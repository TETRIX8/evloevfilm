import Peer, { DataConnection, MediaConnection } from "peerjs";

export interface RoomParticipant {
  peerId: string;
  name: string;
  isHost: boolean;
  isMicOn: boolean;
  isSpeaking?: boolean;
  joinedAt: number;
}

export interface PlaybackState {
  status: "PLAYING" | "PAUSED" | "STOPPED";
  currentTime: number;
  movieTitle: string;
  iframeUrl: string;
  posterUrl?: string;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderPeerId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface WatchRoom {
  id: string;
  name: string;
  movieTitle: string;
  iframeUrl: string;
  posterUrl?: string;
  hostPeerId: string;
  hostName: string;
  createdAt: number;
  participants: RoomParticipant[];
  playbackState: PlaybackState;
}

export type SyncSignalType =
  | "ROOM_UPDATE"
  | "PLAY"
  | "PAUSE"
  | "STOP"
  | "SEEK"
  | "CHANGE_MOVIE"
  | "CHAT_MESSAGE"
  | "MIC_STATUS"
  | "REQUEST_SYNC"
  | "REQUEST_HOST_ACTION";

export interface SyncSignal {
  type: SyncSignalType;
  senderPeerId: string;
  senderName: string;
  timestamp: number;
  time?: number;
  movieTitle?: string;
  iframeUrl?: string;
  posterUrl?: string;
  chatMessage?: ChatMessage;
  isMicOn?: boolean;
  room?: WatchRoom;
}

class WatchTogetherManager {
  private peer: Peer | null = null;
  private peerId: string = "";
  private myName: string = "Гость";
  private currentRoom: WatchRoom | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private voiceCalls: Map<string, MediaConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private localAudioStream: MediaStream | null = null;
  private isMicMuted: boolean = true;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;

  private onRoomUpdateCallbacks: Set<(room: WatchRoom) => void> = new Set();
  private onPlaybackSignalCallbacks: Set<(signal: SyncSignal) => void> = new Set();
  private onChatMessageCallbacks: Set<(msg: ChatMessage) => void> = new Set();
  private onRemoteAudioStreamCallbacks: Set<(peerId: string, stream: MediaStream) => void> = new Set();
  private onSpeakingChangeCallbacks: Set<(peerId: string, isSpeaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.broadcastChannel = new BroadcastChannel("evloevfilm_watch_together");
      this.broadcastChannel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    }
  }

  // Initializer
  public async init(userName: string): Promise<string> {
    this.myName = userName || "Зритель " + Math.floor(Math.random() * 1000);

    if (this.peer && !this.peer.destroyed) {
      return this.peerId;
    }

    return new Promise((resolve, reject) => {
      const randomPrefix = Math.random().toString(36).substring(2, 8);
      const generatedId = `ef-${randomPrefix}`;

      const peerInstance = new Peer(generatedId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      peerInstance.on("open", (id) => {
        this.peer = peerInstance;
        this.peerId = id;
        this.setupPeerListeners();
        resolve(id);
      });

      peerInstance.on("error", (err) => {
        console.warn("[WatchTogether] PeerJS warn/error, falling back to local channel:", err);
        // Even if PeerJS server lags, fallback to local generated ID
        this.peerId = generatedId;
        this.peer = peerInstance;
        resolve(generatedId);
      });

      setTimeout(() => {
        if (!this.peerId) {
          this.peerId = generatedId;
          resolve(generatedId);
        }
      }, 4000);
    });
  }

  private setupPeerListeners() {
    if (!this.peer) return;

    this.peer.on("connection", (conn) => {
      this.setupDataConnection(conn);
    });

    this.peer.on("call", (call) => {
      if (this.localAudioStream) {
        call.answer(this.localAudioStream);
      } else {
        call.answer();
      }

      call.on("stream", (remoteStream) => {
        this.notifyRemoteAudioStream(call.peer, remoteStream);
      });

      this.voiceCalls.set(call.peer, call);
    });
  }

  private setupDataConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on("open", () => {
      if (this.currentRoom) {
        // Send current room state to new peer
        conn.send({
          type: "ROOM_UPDATE",
          senderPeerId: this.peerId,
          senderName: this.myName,
          timestamp: Date.now(),
          room: this.currentRoom,
        } as SyncSignal);
      }
    });

    conn.on("data", (data: any) => {
      this.handleIncomingSignal(data as SyncSignal);
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.handlePeerDisconnect(conn.peer);
    });
  }

  // Local Room Storage Manager
  public getStoredRooms(): WatchRoom[] {
    try {
      const data = localStorage.getItem("evloevfilm_watch_rooms");
      if (!data) return [];
      const rooms: WatchRoom[] = JSON.parse(data);
      // Filter out rooms older than 12 hours
      const now = Date.now();
      return rooms.filter((r) => now - r.createdAt < 12 * 3600 * 1000);
    } catch {
      return [];
    }
  }

  private saveRoomToStorage(room: WatchRoom) {
    try {
      const rooms = this.getStoredRooms().filter((r) => r.id !== room.id);
      rooms.unshift(room);
      localStorage.setItem("evloevfilm_watch_rooms", JSON.stringify(rooms.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  }

  // Room Creation
  public createRoom(movieTitle: string, iframeUrl: string, posterUrl?: string, customName?: string): WatchRoom {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const roomName = customName || `Комната: ${movieTitle}`;

    const hostParticipant: RoomParticipant = {
      peerId: this.peerId,
      name: this.myName,
      isHost: true,
      isMicOn: false,
      joinedAt: Date.now(),
    };

    const newRoom: WatchRoom = {
      id: code,
      name: roomName,
      movieTitle,
      iframeUrl,
      posterUrl,
      hostPeerId: this.peerId,
      hostName: this.myName,
      createdAt: Date.now(),
      participants: [hostParticipant],
      playbackState: {
        status: "PAUSED",
        currentTime: 0,
        movieTitle,
        iframeUrl,
        posterUrl,
        updatedAt: Date.now(),
      },
    };

    this.currentRoom = newRoom;
    this.saveRoomToStorage(newRoom);
    this.broadcastLocal({ type: "ROOM_UPDATE", senderPeerId: this.peerId, senderName: this.myName, timestamp: Date.now(), room: newRoom });
    this.notifyRoomUpdate();

    return newRoom;
  }

  // Join Room
  public async joinRoom(roomId: string): Promise<WatchRoom | null> {
    const rooms = this.getStoredRooms();
    let targetRoom = rooms.find((r) => r.id === roomId);

    if (!targetRoom && this.currentRoom?.id === roomId) {
      targetRoom = this.currentRoom;
    }

    if (!targetRoom) {
      // Create virtual room entry if joining via link with ID
      targetRoom = {
        id: roomId,
        name: `Сеанс #${roomId}`,
        movieTitle: "Загрузка фильма...",
        iframeUrl: "",
        hostPeerId: "",
        hostName: "Ведущий",
        createdAt: Date.now(),
        participants: [],
        playbackState: {
          status: "PAUSED",
          currentTime: 0,
          movieTitle: "",
          iframeUrl: "",
          updatedAt: Date.now(),
        },
      };
    }

    // Add self to participants
    const me: RoomParticipant = {
      peerId: this.peerId,
      name: this.myName,
      isHost: targetRoom.hostPeerId === this.peerId,
      isMicOn: !this.isMicMuted,
      joinedAt: Date.now(),
    };

    const exists = targetRoom.participants.some((p) => p.peerId === this.peerId);
    if (!exists) {
      targetRoom.participants.push(me);
    }

    this.currentRoom = targetRoom;
    this.saveRoomToStorage(targetRoom);

    // Try connecting via PeerJS if hostPeerId exists
    if (targetRoom.hostPeerId && targetRoom.hostPeerId !== this.peerId && this.peer) {
      try {
        const conn = this.peer.connect(targetRoom.hostPeerId);
        this.setupDataConnection(conn);
      } catch (e) {
        console.warn("[WatchTogether] Peer connection attempt:", e);
      }
    }

    this.broadcastSignal({
      type: "ROOM_UPDATE",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      room: targetRoom,
    });

    this.notifyRoomUpdate();
    return targetRoom;
  }

  // Leave Room
  public leaveRoom() {
    if (!this.currentRoom) return;

    if (this.currentRoom) {
      this.currentRoom.participants = this.currentRoom.participants.filter((p) => p.peerId !== this.peerId);
      this.broadcastSignal({
        type: "ROOM_UPDATE",
        senderPeerId: this.peerId,
        senderName: this.myName,
        timestamp: Date.now(),
        room: this.currentRoom,
      });
    }

    this.stopMicrophone();
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    this.voiceCalls.forEach((call) => call.close());
    this.voiceCalls.clear();

    this.currentRoom = null;
    this.notifyRoomUpdate();
  }

  // Sync Controls
  public sendPlay(time: number) {
    if (!this.currentRoom) return;
    this.currentRoom.playbackState.status = "PLAYING";
    this.currentRoom.playbackState.currentTime = time;
    this.currentRoom.playbackState.updatedAt = Date.now();

    this.broadcastSignal({
      type: "PLAY",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      time,
    });
  }

  public sendPause(time: number) {
    if (!this.currentRoom) return;
    this.currentRoom.playbackState.status = "PAUSED";
    this.currentRoom.playbackState.currentTime = time;
    this.currentRoom.playbackState.updatedAt = Date.now();

    this.broadcastSignal({
      type: "PAUSE",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      time,
    });
  }

  public sendSeek(time: number) {
    if (!this.currentRoom) return;
    this.currentRoom.playbackState.currentTime = time;
    this.currentRoom.playbackState.updatedAt = Date.now();

    this.broadcastSignal({
      type: "SEEK",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      time,
    });
  }

  public sendChangeMovie(movieTitle: string, iframeUrl: string, posterUrl?: string) {
    if (!this.currentRoom) return;

    this.currentRoom.movieTitle = movieTitle;
    this.currentRoom.iframeUrl = iframeUrl;
    if (posterUrl) this.currentRoom.posterUrl = posterUrl;

    this.currentRoom.playbackState = {
      status: "PAUSED",
      currentTime: 0,
      movieTitle,
      iframeUrl,
      posterUrl,
      updatedAt: Date.now(),
    };

    this.saveRoomToStorage(this.currentRoom);

    this.broadcastSignal({
      type: "CHANGE_MOVIE",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      movieTitle,
      iframeUrl,
      posterUrl,
      time: 0,
    });

    this.notifyRoomUpdate();
  }

  public sendChatMessage(text: string) {
    if (!text.trim() || !this.currentRoom) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: this.myName,
      senderPeerId: this.peerId,
      text: text.trim(),
      timestamp: Date.now(),
    };

    this.broadcastSignal({
      type: "CHAT_MESSAGE",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      chatMessage: msg,
    });

    this.notifyChatMessage(msg);
  }

  // Voice Chat (Microphone)
  public async toggleMicrophone(): Promise<boolean> {
    if (this.isMicMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.localAudioStream = stream;
        this.isMicMuted = false;

        this.setupAudioAnalysis(stream);

        // Call active peers for audio streaming
        if (this.peer) {
          this.connections.forEach((_, remotePeerId) => {
            if (this.peer) {
              const call = this.peer.call(remotePeerId, stream);
              call.on("stream", (remoteStream) => {
                this.notifyRemoteAudioStream(remotePeerId, remoteStream);
              });
              this.voiceCalls.set(remotePeerId, call);
            }
          });
        }

        this.updateMicStateInRoom(true);
        return true;
      } catch (err) {
        console.error("[WatchTogether] Microphone permission denied or error:", err);
        return false;
      }
    } else {
      this.stopMicrophone();
      return false;
    }
  }

  private stopMicrophone() {
    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((track) => track.stop());
      this.localAudioStream = null;
    }
    this.isMicMuted = true;
    this.updateMicStateInRoom(false);

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private setupAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      source.connect(this.analyserNode);

      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speaking = false;

      const checkVolume = () => {
        if (!this.analyserNode || this.isMicMuted) return;

        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const isNowSpeaking = average > 20;

        if (isNowSpeaking !== speaking) {
          speaking = isNowSpeaking;
          this.notifySpeakingChange(this.peerId, speaking);
        }

        requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn("[WatchTogether] WebAudio analysis error:", e);
    }
  }

  private updateMicStateInRoom(isMicOn: boolean) {
    if (!this.currentRoom) return;

    const me = this.currentRoom.participants.find((p) => p.peerId === this.peerId);
    if (me) me.isMicOn = isMicOn;

    this.broadcastSignal({
      type: "MIC_STATUS",
      senderPeerId: this.peerId,
      senderName: this.myName,
      timestamp: Date.now(),
      isMicOn,
    });

    this.notifyRoomUpdate();
  }

  // Network Signal Distributors
  private broadcastSignal(signal: SyncSignal) {
    // 1. Send via PeerJS connections
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(signal);
      }
    });

    // 2. Send via local BroadcastChannel
    this.broadcastLocal(signal);
  }

  private broadcastLocal(signal: SyncSignal) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(signal);
      } catch (e) {}
    }
  }

  private handleBroadcastMessage(signal: SyncSignal) {
    if (signal.senderPeerId === this.peerId) return;
    this.handleIncomingSignal(signal);
  }

  private handleIncomingSignal(signal: SyncSignal) {
    switch (signal.type) {
      case "ROOM_UPDATE":
        if (signal.room) {
          this.mergeRoomUpdate(signal.room);
        }
        break;

      case "PLAY":
      case "PAUSE":
      case "STOP":
      case "SEEK":
        if (this.currentRoom && signal.time !== undefined) {
          this.currentRoom.playbackState.currentTime = signal.time;
          this.currentRoom.playbackState.status =
            signal.type === "PLAY" ? "PLAYING" : signal.type === "PAUSE" ? "PAUSED" : "STOPPED";
          this.currentRoom.playbackState.updatedAt = Date.now();
        }
        this.notifyPlaybackSignal(signal);
        break;

      case "CHANGE_MOVIE":
        if (this.currentRoom && signal.movieTitle && signal.iframeUrl) {
          this.currentRoom.movieTitle = signal.movieTitle;
          this.currentRoom.iframeUrl = signal.iframeUrl;
          if (signal.posterUrl) this.currentRoom.posterUrl = signal.posterUrl;
          this.currentRoom.playbackState.currentTime = 0;
          this.currentRoom.playbackState.status = "PAUSED";
          this.notifyRoomUpdate();
        }
        this.notifyPlaybackSignal(signal);
        break;

      case "CHAT_MESSAGE":
        if (signal.chatMessage) {
          this.notifyChatMessage(signal.chatMessage);
        }
        break;

      case "MIC_STATUS":
        if (this.currentRoom) {
          const participant = this.currentRoom.participants.find((p) => p.peerId === signal.senderPeerId);
          if (participant) {
            participant.isMicOn = Boolean(signal.isMicOn);
            this.notifyRoomUpdate();
          }
        }
        break;
    }
  }

  private mergeRoomUpdate(remoteRoom: WatchRoom) {
    if (!this.currentRoom || this.currentRoom.id === remoteRoom.id) {
      this.currentRoom = remoteRoom;
      this.saveRoomToStorage(remoteRoom);
      this.notifyRoomUpdate();
    }
  }

  private handlePeerDisconnect(disconnectedPeerId: string) {
    if (this.currentRoom) {
      this.currentRoom.participants = this.currentRoom.participants.filter((p) => p.peerId !== disconnectedPeerId);
      this.notifyRoomUpdate();
    }
  }

  // Getters & Callbacks
  public getCurrentRoom(): WatchRoom | null {
    return this.currentRoom;
  }

  public getPeerId(): string {
    return this.peerId;
  }

  public getUserName(): string {
    return this.myName;
  }

  public setUserName(name: string) {
    this.myName = name;
  }

  public isHost(): boolean {
    if (!this.currentRoom) return false;
    return this.currentRoom.hostPeerId === this.peerId || this.currentRoom.participants[0]?.peerId === this.peerId;
  }

  public subscribeRoomUpdate(cb: (room: WatchRoom) => void) {
    this.onRoomUpdateCallbacks.add(cb);
    return () => {
      this.onRoomUpdateCallbacks.delete(cb);
    };
  }

  public subscribePlaybackSignal(cb: (signal: SyncSignal) => void) {
    this.onPlaybackSignalCallbacks.add(cb);
    return () => {
      this.onPlaybackSignalCallbacks.delete(cb);
    };
  }

  public subscribeChatMessage(cb: (msg: ChatMessage) => void) {
    this.onChatMessageCallbacks.add(cb);
    return () => {
      this.onChatMessageCallbacks.delete(cb);
    };
  }

  public subscribeRemoteAudioStream(cb: (peerId: string, stream: MediaStream) => void) {
    this.onRemoteAudioStreamCallbacks.add(cb);
    return () => {
      this.onRemoteAudioStreamCallbacks.delete(cb);
    };
  }

  public subscribeSpeakingChange(cb: (peerId: string, isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallbacks.add(cb);
    return () => {
      this.onSpeakingChangeCallbacks.delete(cb);
    };
  }

  private notifyRoomUpdate() {
    if (this.currentRoom) {
      this.onRoomUpdateCallbacks.forEach((cb) => cb(this.currentRoom!));
    }
  }

  private notifyPlaybackSignal(signal: SyncSignal) {
    this.onPlaybackSignalCallbacks.forEach((cb) => cb(signal));
  }

  private notifyChatMessage(msg: ChatMessage) {
    this.onChatMessageCallbacks.forEach((cb) => cb(msg));
  }

  private notifyRemoteAudioStream(peerId: string, stream: MediaStream) {
    this.onRemoteAudioStreamCallbacks.forEach((cb) => cb(peerId, stream));
  }

  private notifySpeakingChange(peerId: string, isSpeaking: boolean) {
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(peerId, isSpeaking));
  }
}

export const watchTogetherService = new WatchTogetherManager();

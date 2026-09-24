import { useState, useEffect, useCallback, useRef } from "react";
import {
  watchTogetherService,
  WatchRoom,
  ChatMessage,
  SyncSignal,
} from "@/services/watchTogetherService";
import { toast } from "sonner";
import { useFirebaseAuth } from "./use-firebase-auth";

export function useWatchTogether(iframeRef?: React.RefObject<HTMLIFrameElement>) {
  const { user } = useFirebaseAuth();
  const userName = user?.displayName || user?.email?.split("@")[0] || "Киноман " + Math.floor(Math.random() * 100);

  const [peerId, setPeerId] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<WatchRoom | null>(watchTogetherService.getCurrentRoom());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<"SYNCED" | "SYNCING" | "PAUSED">("SYNCED");

  const remoteAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize service
  useEffect(() => {
    watchTogetherService.init(userName).then((id) => {
      setPeerId(id);
    });

    const unsubRoom = watchTogetherService.subscribeRoomUpdate((room) => {
      setCurrentRoom({ ...room });
    });

    const unsubPlayback = watchTogetherService.subscribePlaybackSignal((signal) => {
      handleRemoteSignal(signal);
    });

    const unsubChat = watchTogetherService.subscribeChatMessage((msg) => {
      setChatMessages((prev) => [...prev.slice(-100), msg]);
    });

    const unsubAudio = watchTogetherService.subscribeRemoteAudioStream((peerId, stream) => {
      if (!remoteAudioRefs.current[peerId]) {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        remoteAudioRefs.current[peerId] = audio;
      } else {
        remoteAudioRefs.current[peerId].srcObject = stream;
      }
    });

    const unsubSpeaking = watchTogetherService.subscribeSpeakingChange((peerId, isSpeaking) => {
      setSpeakingPeers((prev) => ({ ...prev, [peerId]: isSpeaking }));
    });

    return () => {
      unsubRoom();
      unsubPlayback();
      unsubChat();
      unsubAudio();
      unsubSpeaking();
    };
  }, [userName]);

  // Player Remote Execution Handler
  const handleRemoteSignal = useCallback(
    (signal: SyncSignal) => {
      const iframe = iframeRef?.current;
      setSyncStatus("SYNCING");

      if (signal.type === "PLAY") {
        toast.info(`▶️ ${signal.senderName} запустил воспроизведение`, { duration: 2500 });
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ key: "playerjs", api: "play", value: signal.time }),
            "*"
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ key: "playerjs", api: "seek", value: signal.time }),
            "*"
          );
        }
        setSyncStatus("SYNCED");
      } else if (signal.type === "PAUSE" || signal.type === "STOP") {
        toast.info(`⏸️ ${signal.senderName} поставил на паузу`, { duration: 2500 });
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ key: "playerjs", api: "pause", value: signal.time }),
            "*"
          );
        }
        setSyncStatus("PAUSED");
      } else if (signal.type === "SEEK") {
        toast.info(`⏩ ${signal.senderName} перемотал на ${formatSeconds(signal.time || 0)}`, { duration: 2500 });
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ key: "playerjs", api: "seek", value: signal.time }),
            "*"
          );
        }
        setSyncStatus("SYNCED");
      } else if (signal.type === "CHANGE_MOVIE") {
        toast.success(`🎬 ${signal.senderName} сменил фильм: ${signal.movieTitle}`, { duration: 3500 });
        setSyncStatus("SYNCED");
      }
    },
    [iframeRef]
  );

  // User Actions
  const createRoom = useCallback((movieTitle: string, iframeUrl: string, posterUrl?: string, customName?: string) => {
    const room = watchTogetherService.createRoom(movieTitle, iframeUrl, posterUrl, customName);
    setCurrentRoom({ ...room });
    toast.success(`Комната "${room.name}" создана! Код: ${room.id}`);
    return room;
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    const room = await watchTogetherService.joinRoom(roomId);
    if (room) {
      setCurrentRoom({ ...room });
      toast.success(`Вы вошли в комнату #${room.id}`);
    } else {
      toast.error("Не удалось подключиться к комнате");
    }
    return room;
  }, []);

  const leaveRoom = useCallback(() => {
    watchTogetherService.leaveRoom();
    setCurrentRoom(null);
    setIsMicOn(false);
    toast("Вы вышли из комнаты");
  }, []);

  const playMovie = useCallback((time: number) => {
    watchTogetherService.sendPlay(time);
    setSyncStatus("SYNCED");
  }, []);

  const pauseMovie = useCallback((time: number) => {
    watchTogetherService.sendPause(time);
    setSyncStatus("PAUSED");
  }, []);

  const seekMovie = useCallback((time: number) => {
    watchTogetherService.sendSeek(time);
    setSyncStatus("SYNCED");
  }, []);

  const changeMovie = useCallback((movieTitle: string, iframeUrl: string, posterUrl?: string) => {
    watchTogetherService.sendChangeMovie(movieTitle, iframeUrl, posterUrl);
    setSyncStatus("SYNCED");
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    watchTogetherService.sendChatMessage(text);
  }, []);

  const toggleMic = useCallback(async () => {
    const newState = await watchTogetherService.toggleMicrophone();
    setIsMicOn(newState);
    if (newState) {
      toast.success("Микрофон включен");
    } else {
      toast("Микрофон выключен");
    }
  }, []);

  const isHost = watchTogetherService.isHost();

  return {
    peerId,
    currentRoom,
    isHost,
    chatMessages,
    isMicOn,
    speakingPeers,
    syncStatus,
    createRoom,
    joinRoom,
    leaveRoom,
    playMovie,
    pauseMovie,
    seekMovie,
    changeMovie,
    sendChatMessage,
    toggleMic,
  };
}

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

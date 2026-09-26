import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Mic,
  MicOff,
  MessageSquare,
  Users,
  Share2,
  Crown,
  Sparkles,
  Radio,
  Volume2,
  X,
  Send,
  Heart,
  Flame,
  Smile,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { WatchRoom, ChatMessage } from "@/services/watchTogetherService";
import { toast } from "sonner";

interface WatchPartyControlOverlayProps {
  room: WatchRoom;
  isHost: boolean;
  peerId: string;
  isMicOn: boolean;
  speakingPeers: Record<string, boolean>;
  chatMessages: ChatMessage[];
  syncStatus: "SYNCED" | "SYNCING" | "PAUSED";
  onPlay: (time: number) => void;
  onPause: (time: number) => void;
  onSeek: (time: number) => void;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  onLeaveRoom: () => void;
  currentTime?: number;
}

export function WatchPartyControlOverlay({
  room,
  isHost,
  peerId,
  isMicOn,
  speakingPeers,
  chatMessages,
  syncStatus,
  onPlay,
  onPause,
  onSeek,
  onToggleMic,
  onSendMessage,
  onLeaveRoom,
  currentTime = room.playbackState.currentTime,
}: WatchPartyControlOverlayProps) {
  const [showChat, setShowChat] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const isPlaying = room.playbackState.status === "PLAYING";

  const handleShare = () => {
    const url = `${window.location.origin}/watch-together?room=${room.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Ссылка на комнату скопирована!");
    } else {
      toast.info(`Код комнаты: ${room.id}`);
    }
  };

  const sendReaction = (emoji: string) => {
    const id = Math.random().toString();
    const x = Math.random() * 80 + 10;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);

    onSendMessage(`${emoji}`);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="relative w-full rounded-2xl border border-primary/20 bg-[#0c0e14]/90 p-4 backdrop-blur-2xl shadow-[0_0_50px_rgba(229,9,20,0.15)]">
      {/* Floating Reactions Overlay */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 bottom-0 overflow-hidden z-40">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: 100, scale: 0.8 }}
              animate={{ opacity: 0, y: -150, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              style={{ left: `${r.x}%` }}
              className="absolute text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1.5 px-3 py-1 font-bold text-xs tracking-wider">
            <Radio className="h-3.5 w-3.5 animate-pulse text-red-500" />
            СОВМЕСТНЫЙ ПРОСМОТР
          </Badge>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Код комнаты:</span>
            <span className="font-mono text-sm font-black text-foreground bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10 select-all">
              {room.id}
            </span>
            <Button variant="ghost" size="icon" onClick={handleShare} className="h-7 w-7 text-muted-foreground hover:text-white" title="Скопировать ссылку">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10 text-xs">
            {syncStatus === "SYNCED" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Синхронизировано</span>
              </>
            ) : syncStatus === "SYNCING" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-spin absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-amber-400 font-medium">Синхронизация...</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-400 font-medium">Пауза</span>
              </>
            )}
          </div>

          <Button variant="destructive" size="sm" onClick={onLeaveRoom} className="h-8 text-xs font-bold gap-1 rounded-xl">
            <X className="h-3.5 w-3.5" /> Выйти
          </Button>
        </div>
      </div>

      {/* Main Controls & Voice Section */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        {/* Master Host / Playback Controls */}
        <div className="flex items-center gap-2">
          {isHost ? (
            <>
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 gap-1 px-2.5 py-1 text-xs">
                <Crown className="h-3.5 w-3.5" /> Вы ведущий
              </Badge>

              <Button
                variant="default"
                size="icon"
                onClick={() => (isPlaying ? onPause(currentTime) : onPlay(currentTime))}
                className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-transform active:scale-95"
                title={isPlaying ? "Пауза для всех" : "Старт для всех"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onSeek(Math.max(0, currentTime - 10))}
                className="h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                title="Перемотать на 10 сек назад"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onSeek(currentTime + 10)}
                className="h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                title="Перемотать на 10 сек вперед"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-2 rounded-xl border border-white/5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Управляет ведущий: <strong className="text-foreground">{room.hostName}</strong></span>
            </div>
          )}
        </div>

        {/* Voice Chat & Microphone Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant={isMicOn ? "default" : "outline"}
            size="sm"
            onClick={onToggleMic}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs gap-2 transition-all ${
              isMicOn
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            }`}
          >
            {isMicOn ? (
              <>
                <Mic className="h-4 w-4 animate-bounce" /> Микрофон вкл.
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4 text-muted-foreground" /> Голосовая связь
              </>
            )}
          </Button>

          {/* Quick Participant Avatars with Voice visualizer */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {room.participants.slice(0, 5).map((p) => {
              const isSpeaking = speakingPeers[p.peerId];
              return (
                <div
                  key={p.peerId}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-gradient-to-br from-zinc-800 to-zinc-950 font-bold text-xs text-white uppercase shadow-md transition-all ${
                    isSpeaking
                      ? "border-emerald-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.8)] z-20"
                      : p.isHost
                      ? "border-amber-400 z-10"
                      : "border-zinc-700"
                  }`}
                  title={`${p.name}${p.isHost ? " (Ведущий)" : ""}${p.isMicOn ? " 🎤" : ""}`}
                >
                  {p.name.charAt(0)}
                  {p.isMicOn && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-zinc-900" />
                  )}
                </div>
              );
            })}
            {room.participants.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-800 text-[10px] font-bold text-muted-foreground">
                +{room.participants.length - 5}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowUsers(!showUsers)}
            className="h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground relative"
            title="Участники"
          >
            <Users className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white">
              {room.participants.length}
            </span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground relative"
            title="Чат комнаты"
          >
            <MessageSquare className="h-4 w-4" />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white">
                {chatMessages.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Reactions Bar */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-2.5">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" /> Быстрые эмоции:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["❤️", "🔥", "🍿", "😂", "😱", "👏", "👍"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-base transition-all hover:bg-white/15 hover:scale-125 active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Participant List Popover */}
      <AnimatePresence>
        {showUsers && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-4 bottom-full mb-3 w-72 rounded-2xl border border-white/10 bg-[#12151e]/95 p-4 backdrop-blur-2xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary" /> Участники сеанса ({room.participants.length})
              </h4>
              <button onClick={() => setShowUsers(false)} className="text-muted-foreground hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {room.participants.map((p) => (
                <div key={p.peerId} className="flex items-center justify-between rounded-xl bg-white/5 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 font-bold text-primary text-[10px]">
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {p.isHost && (
                      <Crown className="h-3 w-3 text-amber-400" title="Ведущий комнаты" />
                    )}
                  </div>
                  {p.isMicOn ? (
                    <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5 text-zinc-600" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Drawer / Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 bottom-full mb-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#12151e]/95 p-4 backdrop-blur-2xl shadow-2xl z-50 flex flex-col h-80"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-primary" /> Чат зрителей
              </h4>
              <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 italic">
                  Пока сообщений нет. Напишите первым!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-xl ${
                      msg.senderPeerId === peerId
                        ? "bg-primary/20 border border-primary/30 ml-auto max-w-[85%]"
                        : "bg-white/5 border border-white/5 mr-auto max-w-[85%]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-[11px] text-amber-300">{msg.senderName}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-foreground text-xs leading-snug">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="h-9 text-xs rounded-xl bg-white/5 border-white/10 focus:border-primary"
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

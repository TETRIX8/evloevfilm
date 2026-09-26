import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Film, Radio, Sparkles, Copy, Check } from "lucide-react";
import { watchTogetherService } from "@/services/watchTogetherService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreateRoomModalProps {
  movieTitle?: string;
  iframeUrl?: string;
  posterUrl?: string;
  trigger?: React.ReactNode;
}

export function CreateRoomModal({
  movieTitle = "Интерстеллар",
  iframeUrl = "https://evloevfilmapi.vercel.app/iframe/avatar",
  posterUrl,
  trigger,
}: CreateRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState(`Киновечер: ${movieTitle}`);
  const [movieInput, setMovieInput] = useState(movieTitle);
  const [iframeInput, setIframeInput] = useState(iframeUrl);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = await watchTogetherService.createRoom(
      movieInput || movieTitle,
      iframeInput || iframeUrl,
      posterUrl,
      roomName
    );

    setOpen(false);
    toast.success(`Комната "${room.name}" успешно создана!`);
    navigate(`/watch-together?room=${room.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="default"
            size="lg"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-6 font-extrabold text-white shadow-[0_0_30px_rgba(229,9,20,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 text-base">
              <Radio className="h-5 w-5 animate-pulse text-amber-300" />
              Посмотреть вместе
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-transparent -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="border-white/10 bg-[#0d0f17]/95 p-6 backdrop-blur-2xl sm:max-w-md rounded-3xl text-foreground shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_20px_rgba(229,9,20,0.3)]">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg font-black tracking-tight text-white">
                Создать комнату совместного просмотра
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Смотрите фильмы одновременно с друзьями, синхронизируйте плеер и общайтесь голосом
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Название комнаты</Label>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Название сеанса..."
              className="rounded-xl bg-white/5 border-white/10 text-sm focus:border-primary"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Фильм для просмотра</Label>
            <div className="relative">
              <Film className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={movieInput}
                onChange={(e) => setMovieInput(e.target.value)}
                placeholder="Название фильма..."
                className="pl-9 rounded-xl bg-white/5 border-white/10 text-sm focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Управление (Старт, Стоп, Перемотка) будет у вас как у создателя. Все друзья будут слушать ваш голосовой чат и смотреть синхронно!
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-extrabold text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-primary/90"
            >
              Запустить комнату
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

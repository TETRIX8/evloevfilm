import {
  Clapperboard,
  Fingerprint,
  Film,
  Ghost,
  Heart,
  Laugh,
  Rocket,
  Sparkles,
  Swords,
  Tv,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

export type { Route } from "./router";

export interface CategoryMeta {
  id: Category;
  label: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "films",
    label: "Фильмы",
    title: "Фильмы",
    blurb: "От свежих премьер до признанной классики — смотрите то, что цепляет с первых минут.",
    icon: Film,
  },
  {
    id: "serials",
    label: "Сериалы",
    title: "Сериалы",
    blurb: "Истории, от которых невозможно оторваться: выбирайте и проваливайтесь на весь вечер.",
    icon: Tv,
  },
  {
    id: "cartoon",
    label: "Мультфильмы",
    title: "Мультфильмы",
    blurb: "Анимация для всей семьи — яркая, добрая и остроумная.",
    icon: Clapperboard,
  },
  {
    id: "anime-serials",
    label: "Аниме",
    title: "Аниме",
    blurb: "Культовые сериалы и свежие релизы из Страны восходящего солнца.",
    icon: Sparkles,
  },
];

export const GENRES = [
  "Боевик",
  "Комедия",
  "Драма",
  "Триллер",
  "Ужасы",
  "Фантастика",
  "Фэнтези",
  "Мелодрама",
  "Детектив",
  "Криминал",
  "Приключения",
  "Семейный",
  "Военный",
  "Исторический",
  "Документальный",
];

export interface Mood {
  genre: string;
  title: string;
  hint: string;
  gradient: string;
  icon: LucideIcon;
}

export const MOODS: Mood[] = [
  { genre: "Комедия", title: "Посмеяться", hint: "Лёгкие комедии", gradient: "from-amber-500/90 via-orange-500/80 to-rose-600/80", icon: Laugh },
  { genre: "Триллер", title: "Пощекотать нервы", hint: "Триллеры", gradient: "from-sky-500/80 via-indigo-600/80 to-violet-700/85", icon: Zap },
  { genre: "Мелодрама", title: "Влюбиться", hint: "Мелодрамы", gradient: "from-pink-500/85 via-rose-500/80 to-red-600/80", icon: Heart },
  { genre: "Фантастика", title: "Улететь в космос", hint: "Фантастика", gradient: "from-cyan-500/80 via-blue-600/80 to-indigo-700/85", icon: Rocket },
  { genre: "Боевик", title: "Адреналин", hint: "Боевики", gradient: "from-red-500/85 via-orange-600/80 to-amber-600/80", icon: Swords },
  { genre: "Ужасы", title: "Испугаться", hint: "Ужасы", gradient: "from-zinc-600/90 via-purple-800/80 to-fuchsia-900/85", icon: Ghost },
  { genre: "Детектив", title: "Разгадать тайну", hint: "Детективы", gradient: "from-emerald-500/80 via-teal-600/80 to-cyan-800/85", icon: Fingerprint },
  { genre: "Семейный", title: "Всей семьёй", hint: "Для семейного вечера", gradient: "from-lime-500/80 via-green-600/80 to-emerald-700/85", icon: Users },
];

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

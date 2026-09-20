import { Navigation } from "@/components/navigation/Navigation";
import { VisitorCounter } from "@/components/VisitorCounter";
import { Clapperboard, Compass, Sparkles } from "lucide-react";

const principles = [
  ["Без визуального шума", "Каталог, поиск и действия расположены так, чтобы ничего не отвлекало от выбора фильма."],
  ["Личный маршрут", "Избранное и история сохраняют то, к чему хочется вернуться позднее."],
  ["Открытие нового", "Подборки, жанры и чат помогают уйти дальше привычного списка названий."],
];

export default function About() {
  return <div className="page-shell soft-grid"><Navigation /><main className="content-container pt-28"><section className="mx-auto max-w-4xl"><div className="flex flex-col justify-between gap-6 border-b border-white/[0.08] pb-9 sm:flex-row sm:items-end"><div><p className="section-eyebrow">О платформе</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.07em] sm:text-5xl">Кино начинается с хорошего выбора.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">EVLOEVFILM — пространство для тех, кто хочет спокойно находить фильмы, сериалы и аниме, сохранять интересное и возвращаться к своим находкам.</p></div><VisitorCounter /></div><div className="mt-10 grid gap-4 md:grid-cols-3">{principles.map(([title, description], index) => { const Icon = [Clapperboard, Compass, Sparkles][index]; return <article key={title} className="surface-panel p-6"><Icon className="h-5 w-5 text-primary" /><h2 className="mt-8 text-base font-extrabold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p></article>; })}</div><section className="surface-panel mt-8 p-7 sm:p-9"><p className="section-eyebrow">Наш подход</p><h2 className="mt-3 text-2xl font-extrabold tracking-tight">Технологии должны поддерживать впечатление, а не спорить с ним.</h2><p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">Поэтому мы собираем каталог, поиск, избранное, историю и рекомендации в одном интерфейсе. Основной фокус остаётся на историях, которые вы хотите посмотреть сегодня.</p></section></section></main></div>;
}

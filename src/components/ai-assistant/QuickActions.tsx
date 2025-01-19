import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (message: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    "Что посмотреть сегодня вечером?",
    "Найти хорошую комедию",
    "Посоветуй фильмы похожие на Inception",
    "Какие фильмы самые популярные?",
    "Помоги разобраться с приложением",
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground mb-2">
        👋 Привет! Я ваш киноассистент. Я помогу найти фильмы, отвечу на вопросы и дам рекомендации.
        Попробуйте спросить:
      </p>
      {actions.map((action) => (
        <Button
          key={action}
          variant="outline"
          className="justify-start"
          onClick={() => onAction(action)}
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (message: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    "What should I watch tonight?",
    "Find me a good comedy",
    "Recommend similar movies to Inception",
    "What are the top rated movies?",
    "Help me use this app",
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground mb-2">
        👋 Hi! I'm your movie assistant. I can help you find movies, answer questions, and more.
        Try one of these:
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

import { useVisitorCount } from "@/hooks/use-visitor-count";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export function VisitorCounter() {
  const { visitorCount, loading, error } = useVisitorCount();

  return (
    <Card className="p-4 bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg flex items-center justify-center space-x-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
        <Users className="w-6 h-6 text-primary" />
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-primary/20"></div>
        ) : error ? (
          <p className="text-sm text-destructive">Не удалось загрузить данные</p>
        ) : (
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{visitorCount}</span>
            <span className="text-xs text-muted-foreground">уникальных посетителей</span>
          </div>
        )}
      </div>
    </Card>
  );
}

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MoviePlayerProps {
  title: string;
  iframeUrl: string;
}

export function MoviePlayer({ title, iframeUrl }: MoviePlayerProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
      <div className="container mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Назад</span>
        </button>
        <h1 className="text-2xl font-bold mb-6 animate-fade-in">{title}</h1>
      </div>
      
      <div className="flex-1 relative w-full max-w-[1200px] mx-auto px-4">
        <div className="relative w-full rounded-lg overflow-hidden shadow-2xl animate-scale-in" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={iframeUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}
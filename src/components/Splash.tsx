import { Logo } from "./Logo";
import { Loader3D } from "./Loader3D";
import { cn } from "../utils/cn";

interface Props {
  leaving: boolean;
  source: string;
}

export function Splash({ leaving, source }: Props) {
  return (
    <div
      aria-hidden={leaving}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950 transition-all duration-[800ms] ease-out",
        leaving && "pointer-events-none scale-[1.12] opacity-0 blur-md",
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-[45%] rounded-full bg-gold-500/15 blur-[130px]" />
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-rose-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <Logo className="mb-1 animate-fade-in scale-110" />
        <Loader3D size="lg" label="Загружаем кино" hint={`Подключаем источник · ${source}`} />
      </div>
    </div>
  );
}

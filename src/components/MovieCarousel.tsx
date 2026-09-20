import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MovieCard } from "./MovieCard";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface MovieCarouselProps {
  title: string;
  movies: Movie[] | null;
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }));
  if (!movies || !Array.isArray(movies) || movies.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div><p className="section-eyebrow">Продолжайте исследовать</p><h2 className="section-heading">{title}</h2></div>
        <div className="hidden items-center gap-2 md:flex"><span className="text-xs text-muted-foreground">Листайте подборку</span></div>
      </div>
      <div className="relative">
        <Carousel opts={{ align: "start", loop: true }} plugins={[plugin.current]} className="w-full" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
          <CarouselContent className="-ml-3 sm:-ml-4">
            {movies.map((movie, index) => (
              <CarouselItem key={movie.title + index} className="basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 lg:basis-1/4 xl:basis-1/5"><MovieCard {...movie} /></CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden h-10 w-10 border-white/15 bg-[#151820]/95 text-foreground shadow-xl hover:border-primary/60 hover:bg-[#1c2028] xl:flex" />
          <CarouselNext className="-right-4 hidden h-10 w-10 border-white/15 bg-[#151820]/95 text-foreground shadow-xl hover:border-primary/60 hover:bg-[#1c2028] xl:flex" />
        </Carousel>
      </div>
    </section>
  );
}

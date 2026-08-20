
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";
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
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  if (!movies || !Array.isArray(movies)) {
    return null;
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-l-2 border-primary pl-4 text-2xl font-semibold tracking-[-0.025em] md:text-3xl"
      >
        {title}
      </motion.h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {movies.map((movie, index) => (
              <CarouselItem key={movie.title + index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <MovieCard {...movie} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur hover:scale-105 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground" />
          <CarouselNext className="hidden md:flex -right-12 border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur hover:scale-105 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground" />
        </Carousel>
      </div>
    </motion.section>
  );
}

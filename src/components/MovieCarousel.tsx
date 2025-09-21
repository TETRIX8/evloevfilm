
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";

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
  if (!movies || !Array.isArray(movies)) {
    return null;
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-semibold"
      >
        {title}
      </motion.h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {movies.map((movie, index) => (
              <CarouselItem key={movie.title + index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <MovieCard {...movie} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 transition-transform duration-300 hover:scale-110" />
          <CarouselNext className="hidden md:flex -right-12 transition-transform duration-300 hover:scale-110" />
        </Carousel>
      </div>
    </motion.section>
  );
}

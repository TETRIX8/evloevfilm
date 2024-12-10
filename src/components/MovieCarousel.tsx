import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MovieCard } from "./MovieCard";

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
    <section className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold">{title}</h2>
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
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
}
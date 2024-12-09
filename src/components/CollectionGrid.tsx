import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface Collection {
  id: number;
  name: string;
  poster: string;
}

interface CollectionGridProps {
  collections: Collection[] | null;
  className?: string;
}

export function CollectionGrid({ collections, className }: CollectionGridProps) {
  if (!collections) {
    return <div className="text-muted-foreground">No collections available</div>;
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {collections.map((collection, index) => (
        <Card 
          key={collection.id} 
          className="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="aspect-[2/3] relative">
            <img
              src={collection.poster || "/placeholder.svg"}
              alt={collection.name}
              className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-white line-clamp-2">{collection.name}</h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
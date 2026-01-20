import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Star } from "lucide-react";

export type RoomCardProps = {
  id: string;
  title: string;
  description?: string;
  district: string;
  image?: string | null;
  price: number;
  rating?: number;
  minGuests: number;
  maxGuests: number;
};

export function RoomCard({
  id,
  title,
  description,
  district,
  image,
  price,
  rating,
  minGuests,
  maxGuests,
}: RoomCardProps) {
  return (
    <Link
      className="group flex flex-col gap-2 w-full"
      params={{ id }}
      to="/rooms/$id"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          height={400}
          src={image || "https://via.placeholder.com/400x400?text=No+Image"}
          width={400}
        />
      </div>

      <div className="grid gap-0.5">
        <div className="flex justify-between gap-2 items-start">
          <h3 className="font-semibold truncate text-base text-foreground leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star className="size-3 fill-current text-foreground" />
            <span className="text-sm text-foreground leading-none">
              {rating ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground truncate">{district}</p>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          {minGuests}-{maxGuests} guests
        </p>

        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="font-semibold text-foreground">${price}</span>
          <span className="text-sm text-foreground"> hour</span>
        </div>
      </div>
    </Link>
  );
}

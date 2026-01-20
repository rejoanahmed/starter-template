import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { cn } from "@web/lib/utils";
import type { Room } from "@web/services/rooms";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type RoomListingCardProps = {
  room: Room & {
    photos: Array<{
      id: string;
      url: string;
      width: number;
      height: number;
      isCover: boolean;
      order: number;
    }>;
  };
};

export function RoomListingCard({ room }: RoomListingCardProps) {
  const { t } = useTranslation();
  const coverPhoto =
    room.photos.find((photo: { isCover: boolean }) => photo.isCover) ||
    room.photos[0];

  const approvedColors: Record<string, string> = {
    true: "bg-green-100 text-green-800",
    false: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="group cursor-pointer">
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
        {coverPhoto ? (
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <Image
              alt={room.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              height={coverPhoto.height}
              src={coverPhoto.url}
              width={coverPhoto.width}
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  approvedColors[room.approved ? "true" : "false"]
                )}
              >
                {room.approved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              {t("host.listings.noPhotos")}
            </p>
          </div>
        )}

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{room.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {room.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{room.district}</span>
            {room.hourlyTiers && room.hourlyTiers.length > 0 && (
              <span className="font-semibold text-gray-900">
                ${room.hourlyTiers[0].price}
                <span className="text-gray-500 font-normal">/hour</span>
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Link
              className="flex-1"
              params={{ id: room.id }}
              to="/host/listings/$id/edit"
            >
              <Pencil className="size-4 text-gray-600" />
            </Link>
            <button
              className="text-gray-400 hover:text-red-600 transition-colors"
              onClick={() => {
                console.log("Delete listing:", room.id);
              }}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

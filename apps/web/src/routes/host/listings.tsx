import { createFileRoute, Link } from "@tanstack/react-router";
import { RoomListingCard } from "@web/components/room-listing/RoomListingCard";
import { useGetMerchantRooms } from "@web/services/rooms";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/host/listings")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      onboarding: (search.onboarding as string) || undefined,
    };
  },
  component: ListingsPage,
});

function ListingsPage() {
  const { t } = useTranslation();
  const { data: rooms = [], isLoading } = useGetMerchantRooms();

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {t("host.listings.title")}
        </h1>
        <Link
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          to="/host/create-listing"
        >
          <Plus className="size-4 sm:size-5" />
          <span className="hidden sm:inline">
            {t("host.listings.addNewListing")}
          </span>
          <span className="sm:hidden">Add New</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">{t("host.listings.loading")}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {t("host.listings.noListingsYet")}
          </h2>
          <p className="text-gray-600 mb-6">{t("host.listings.getStarted")}</p>
          <Link
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            to="/host/create-listing"
          >
            <Plus size={20} />
            <span>{t("host.listings.createFirstListing")}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <RoomListingCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

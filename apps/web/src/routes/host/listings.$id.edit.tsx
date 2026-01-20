import {
  createFileRoute,
  useLoaderData,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { RoomListingForm } from "@web/components/room-listing/RoomListingForm";
import { api } from "@web/lib/api-client";
import { useUpdateRoom } from "@web/services/rooms";
import { toast } from "sonner";

export const Route = createFileRoute("/host/listings/$id/edit")({
  loader: async ({ params }) => {
    const roomId = params.id;
    const response = await api.api.merchant.rooms.$get();
    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }
    const data = await response.json();
    const room = data.rooms?.find((r: any) => r.id === roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    return {
      room: room as {
        id: string;
        title: string;
        description: string;
        address: string;
        district: string;
        latitude: string;
        longitude: string;
        photos?: Array<{ id: string; url: string; isCover?: boolean }>;
      },
    };
  },
  component: EditRoomPage,
});

function EditRoomPage() {
  const { room } = useLoaderData({ from: "/host/listings/$id/edit" }) as {
    room: {
      id: string;
      title: string;
      description: string;
      address: string;
      district: string;
      latitude: string;
      longitude: string;
      photos?: Array<{ id: string; url: string; isCover?: boolean }>;
      minGuests?: number;
      maxGuests?: number;
      hourlyTiers?: Array<{ hours: number; price: number }>;
      extraPersonChargePerHour?: string;
      facilities?: Record<string, Array<{ name: string; icon?: string }>>;
      policies?: {
        cancellation?: {
          type: "lenient" | "strict";
          rules: Array<{ cutoff: string; refund: string }>;
        };
      };
    };
  };
  const navigate = useNavigate();
  const updateMutation = useUpdateRoom();
  const params = useParams({ from: "/host/listings/$id/edit" });
  const id = params.id as string;

  const data = {
    name: room.title,
    description: room.description,
    address: room.address,
    district: room.district,
    location: {
      latitude: Number.parseFloat(room.latitude),
      longitude: Number.parseFloat(room.longitude),
    },
    photos:
      room.photos?.map(
        (photo: { id: string; url: string; isCover?: boolean }) => ({
          file: new File([], photo.url),
          preview: photo.url,
          id: photo.id,
        })
      ) || [],
    coverId: room.photos?.find(
      (p: { id: string; url: string; isCover?: boolean }) => p.isCover
    )?.id,
    minGuests: room.minGuests || 1,
    maxGuests: room.maxGuests || room.minGuests || 1,
    basePrice: Number.parseFloat(
      room.hourlyTiers?.[0]?.price?.toString() || "0"
    ),
    minHours: room.hourlyTiers?.[0]?.hours || 1,
    discountRate: 0,
    extraPersonCharge: Number.parseFloat(room.extraPersonChargePerHour || "0"),
    selectedAmenities: room.facilities as
      | Record<string, Array<{ name: string }>>
      | undefined,
    cancellationPolicy: room.policies
      ? {
          type: room.policies.cancellation?.type || "lenient",
          rules: room.policies.cancellation?.rules || [],
        }
      : undefined,
  };

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({ id, roomData: data });
      navigate({ to: "/host/listings" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update room"
      );
    }
  };

  if (!room) {
    return <div>Room not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => navigate({ to: "/host/listings" })}
            type="button"
          >
            ← Back to Listings
          </button>
        </div>

        <RoomListingForm
          initialData={data}
          mode="edit"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

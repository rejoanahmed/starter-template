import { createFileRoute } from "@tanstack/react-router";
import { RoomCard } from "@web/components/RoomCard";

export const Route = createFileRoute("/wishlists")({ component: App });

function App() {
  const mockWishlists = [
    {
      id: "1",
      title: "Beachfront Villa",
      description:
        "Stunning ocean views with private beach access. Perfect for romantic getaways.",
      district: "Oceanfront District",
      price: 120,
      rating: 4.96,
      minGuests: 2,
      maxGuests: 4,
      image:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    },
    {
      id: "2",
      title: "Mountain Retreat Cabin",
      description:
        "Cozy cabin nestled in the mountains with hot tub and hiking trails nearby.",
      district: "Mountain Valley",
      price: 95,
      rating: 4.89,
      minGuests: 2,
      maxGuests: 6,
      image:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
    },
    {
      id: "3",
      title: "Urban Loft in Arts District",
      description:
        "Trendy loft in the heart of the arts district. Walking distance to galleries and cafes.",
      district: "Arts Quarter",
      price: 85,
      rating: 4.91,
      minGuests: 1,
      maxGuests: 2,
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    },
    {
      id: "4",
      title: "Lakeside Cottage",
      description:
        "Peaceful cottage by the lake with canoe rental included. Great for nature lovers.",
      district: "Lakeside",
      price: 70,
      rating: 4.84,
      minGuests: 2,
      maxGuests: 4,
      image:
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pb-24">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Wishlists</h1>
          <p className="text-muted-foreground mt-2">Your saved places</p>
        </header>

        {mockWishlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockWishlists.map((room) => (
              <RoomCard key={room.id} {...room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No wishlists yet</p>
            <p className="text-muted-foreground mt-2">
              Start saving your favorite places
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

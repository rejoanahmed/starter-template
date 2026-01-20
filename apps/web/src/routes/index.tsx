import { createFileRoute } from "@tanstack/react-router";
import { RoomCard } from "@web/components/RoomCard";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const mockRooms = [
    {
      id: "1",
      title: "Modern Studio with City View",
      description:
        "A beautiful studio in the heart of downtown with stunning city views. Perfect for business travelers or couples.",
      district: "Central District",
      price: 50,
      rating: 4.85,
      minGuests: 1,
      maxGuests: 2,
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    },
    {
      id: "2",
      title: "Cozy Loft near Park",
      description:
        "Charming loft apartment just steps from the park. High ceilings, exposed brick, and natural light.",
      district: "Midtown",
      price: 45,
      rating: 4.92,
      minGuests: 1,
      maxGuests: 3,
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    },
    {
      id: "3",
      title: "Spacious Family Room",
      description:
        "Large room perfect for families or groups. Includes separate living area and kitchenette.",
      district: "West End",
      price: 75,
      rating: 4.78,
      minGuests: 2,
      maxGuests: 6,
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    },
    {
      id: "4",
      title: "Minimalist Design Studio",
      description:
        "Clean, modern design with high-end amenities. Perfect for creative professionals.",
      district: "Arts District",
      price: 60,
      rating: 4.95,
      minGuests: 1,
      maxGuests: 2,
      image:
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    },
    {
      id: "5",
      title: "Rustic Charm with Garden",
      description:
        "Unique space with rustic decor and private garden access. Quiet and peaceful.",
      district: "Old Town",
      price: 40,
      rating: 4.88,
      minGuests: 1,
      maxGuests: 4,
      image:
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    },
    {
      id: "6",
      title: "Luxury Penthouse Suite",
      description:
        "Stunning penthouse with panoramic views, premium furnishings, and full amenities.",
      district: "Downtown",
      price: 150,
      rating: 4.99,
      minGuests: 2,
      maxGuests: 4,
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Find your perfect space</h1>
          <p className="text-muted-foreground mt-2">
            Discover unique rooms and experiences
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockRooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useParams } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@web/components/ui/button";
import {
  Bath,
  BedDouble,
  MapPin,
  Maximize,
  Star,
  Users,
  Wifi,
} from "lucide-react";

const mockRooms = {
  "1": {
    id: "1",
    title: "Modern Studio with City View",
    description:
      "A beautiful studio in the heart of downtown with stunning city views. Perfect for business travelers or couples looking for a stylish urban retreat.",
    district: "Central District",
    price: 50,
    rating: 4.85,
    reviewCount: 128,
    minGuests: 1,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    area: 450,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
    ],
    amenities: [
      { name: "High-speed WiFi", icon: Wifi },
      { name: "Smart TV", icon: Maximize },
      { name: "Air conditioning", icon: Maximize },
      { name: "Workspace", icon: Maximize },
    ],
  },
  "2": {
    id: "2",
    title: "Cozy Loft near Park",
    description:
      "Charming loft apartment just steps from the park. High ceilings, exposed brick, and natural light create a warm and inviting atmosphere.",
    district: "Midtown",
    price: 45,
    rating: 4.92,
    reviewCount: 87,
    minGuests: 1,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    amenities: [
      { name: "Fast WiFi", icon: Wifi },
      { name: "Balcony", icon: Maximize },
      { name: "Near park", icon: MapPin },
    ],
  },
  "3": {
    id: "3",
    title: "Spacious Family Room",
    description:
      "Large room perfect for families or groups. Includes separate living area and kitchenette, making it ideal for extended stays.",
    district: "West End",
    price: 75,
    rating: 4.78,
    reviewCount: 203,
    minGuests: 2,
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 2,
    area: 900,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
    ],
    amenities: [
      { name: "Full kitchen", icon: Maximize },
      { name: "Dining area", icon: Maximize },
      { name: "Family-friendly", icon: Users },
    ],
  },
  "4": {
    id: "4",
    title: "Minimalist Design Studio",
    description:
      "Clean, modern design with high-end amenities. Perfect for creative professionals who appreciate a clutter-free environment.",
    district: "Arts District",
    price: 60,
    rating: 4.95,
    reviewCount: 64,
    minGuests: 1,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    area: 400,
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    amenities: [
      { name: "Designer decor", icon: Maximize },
      { name: "Ergonomic furniture", icon: Maximize },
      { name: "Art district location", icon: MapPin },
    ],
  },
  "5": {
    id: "5",
    title: "Rustic Charm with Garden",
    description:
      "Unique space with rustic decor and private garden access. Quiet and peaceful, perfect for those who want to escape the city.",
    district: "Old Town",
    price: 40,
    rating: 4.88,
    reviewCount: 92,
    minGuests: 1,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    area: 550,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    amenities: [
      { name: "Private garden", icon: MapPin },
      { name: "Fireplace", icon: Maximize },
      { name: "Quiet location", icon: Maximize },
    ],
  },
  "6": {
    id: "6",
    title: "Luxury Penthouse Suite",
    description:
      "Stunning penthouse with panoramic views, premium furnishings, and full amenities. The ultimate luxury experience.",
    district: "Downtown",
    price: 150,
    rating: 4.99,
    reviewCount: 156,
    minGuests: 2,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
    ],
    amenities: [
      { name: "Rooftop terrace", icon: Maximize },
      { name: "City views", icon: MapPin },
      { name: "Premium amenities", icon: Maximize },
      { name: "Smart home", icon: Wifi },
    ],
  },
};

export const Route = createFileRoute("/rooms/$id")({
  component: RoomDetailPage,
});

function RoomDetailPage() {
  const { id } = useParams({ from: "/rooms/$id" });
  const room = mockRooms[id as keyof typeof mockRooms];

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Room not found</h1>
          <p className="text-muted-foreground">
            The room you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              alt={room.title}
              className="w-full h-full object-cover"
              height={600}
              src={room.images[0]}
              width={800}
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
            {room.images.slice(1, 3).map((image) => (
              <div
                className="aspect-[4/3] rounded-xl overflow-hidden"
                key={image}
              >
                <Image
                  alt={room.title}
                  className="w-full h-full object-cover"
                  height={300}
                  src={image}
                  width={400}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-current" />
                  <span className="font-medium text-foreground">
                    {room.rating}
                  </span>
                  <span>({room.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span>{room.district}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="text-center">
                <Users className="size-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-semibold">
                  {room.minGuests}-{room.maxGuests}
                </p>
              </div>
              <div className="text-center">
                <BedDouble className="size-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="font-semibold">{room.bedrooms}</p>
              </div>
              <div className="text-center">
                <Bath className="size-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="font-semibold">{room.bathrooms}</p>
              </div>
              <div className="text-center">
                <Maximize className="size-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="font-semibold">{room.area} sq ft</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">About this space</h2>
              <p className="text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {room.amenities.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <div className="flex items-center gap-3" key={amenity.name}>
                      <Icon className="size-5 text-muted-foreground" />
                      <span>{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 border rounded-xl p-6 shadow-sm bg-white">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">${room.price}</span>
                  <span className="text-muted-foreground">hour</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {room.reviewCount} reviews · {room.rating} stars
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  Book Now
                </Button>
              </div>

              <div className="mt-4 text-sm text-muted-foreground text-center">
                You won't be charged yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

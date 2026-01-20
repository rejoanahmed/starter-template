import { createFileRoute, redirect } from "@tanstack/react-router";
import { RoomListingForm } from "@web/components/room-listing/RoomListingForm";

export const Route = createFileRoute("/host/create-listing")({
  beforeLoad({ context }) {
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: { redirectUri: "/host/create-listing" },
      });
    }
  },
  component: CreateListingPage,
});

function CreateListingPage() {
  return <RoomListingForm />;
}

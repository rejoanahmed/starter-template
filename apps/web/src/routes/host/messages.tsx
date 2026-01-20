import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/host/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <p className="text-gray-600">Your messages will appear here.</p>
    </div>
  );
}

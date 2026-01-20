import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/host/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <p className="text-gray-600">Your calendar view will appear here.</p>
    </div>
  );
}

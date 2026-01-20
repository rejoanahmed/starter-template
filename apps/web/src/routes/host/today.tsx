import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/host/today")({
  component: TodayPage,
});

function TodayPage() {
  const { data: todayBookings = [] } = useQuery({
    queryKey: ["bookings", "today"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/today");
      if (!response.ok) {
        throw new Error("Failed to fetch today's bookings");
      }
      const data = (await response.json()) as {
        bookings?: {
          id: string;
          startTime: string;
          room: { title: string };
          guestCount?: number;
          totalAmount?: string;
          status?: string;
          specialRequests?: string[];
        }[];
      };
      return data.bookings || [];
    },
  });

  const groupedBookings = todayBookings.reduce(
    (groups: Record<string, any[]>, booking: any) => {
      const hourKey = new Date(booking.startTime).getHours();
      const key =
        hourKey < 6 ? "Morning" : hourKey < 12 ? "Afternoon" : "Evening";
      if (!groups[key]) groups[key] = [];
      groups[key].push(booking);
      return groups;
    },
    {}
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="today-header">
          Today's Schedule
        </h1>
        <p className="text-gray-600">
          Manage your bookings and prepare for guests
        </p>
      </div>

      {todayBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📅</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No bookings today
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have any bookings scheduled for today. Take a break or
            prepare for future guests!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBookings)
            .sort(([timeA], [timeB]) => {
              const timeOrder = { Morning: 1, Afternoon: 2, Evening: 3 };
              return (
                timeOrder[timeA as keyof typeof timeOrder] -
                timeOrder[timeB as keyof typeof timeOrder]
              );
            })
            .map(([timeOfDay, timeBookings]) => (
              <div key={timeOfDay}>
                <h2
                  className="text-xl font-semibold text-gray-700 mb-4"
                  data-testid={`time-group-${timeOfDay.toLowerCase()}`}
                >
                  {timeOfDay}
                </h2>
                <div className="space-y-3">
                  {timeBookings.map((booking) => (
                    <div
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                      data-testid="booking-card"
                      key={booking.id}
                    >
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="font-semibold text-lg text-gray-900">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Guests</div>
                          <div className="font-medium">
                            {booking.guestCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Room</div>
                          <div className="font-medium">
                            {booking.room?.title || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="font-semibold text-lg text-gray-900">
                          HKD{" "}
                          {Number.parseFloat(booking.totalAmount).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-sm text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">
                            {booking.specialRequests || "No special requests"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

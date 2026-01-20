import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@web/lib/utils";
import { Calendar, Home, List, MessageSquare, User } from "lucide-react";

const navItems = [
  { label: "Today", path: "/host/today", icon: Home },
  { label: "Calendar", path: "/host/calendar", icon: Calendar },
  { label: "Listings", path: "/host/listings", icon: List },
  { label: "Messages", path: "/host/messages", icon: MessageSquare },
  { label: "Account", path: "/host/account", icon: User },
];

export function HostNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="hidden lg:flex border-b border-gray-200 bg-white">
      <div className="px-6">
        <div className="flex gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);

            return (
              <Link
                className={cn(
                  "flex items-center gap-2 px-1 py-4 border-b-2 transition-colors",
                  isActive
                    ? "border-red-600 text-red-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
                key={item.path}
                to={item.path}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

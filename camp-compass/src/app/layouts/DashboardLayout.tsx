"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Calendar,
  Building2,
  Clock,
  Bell,
  LogOut,
  Home,
  Users,
  Settings
} from "lucide-react";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: "Dashboard", path: `/dashboard/${user.role}` },
      { icon: MapPin, label: "Campus Map", path: "/dashboard/map" },
    ];

    if (user.role === "student" && user.tuitionPaid) {
      baseItems.push(
        { icon: Calendar, label: "My Timetable", path: "/dashboard/timetable" },
        { icon: Bell, label: "Notifications", path: "/dashboard/notifications" }
      );
    }

    if (user.role === "staff") {
      baseItems.push(
        { icon: Calendar, label: "My Schedule", path: "/dashboard/timetable" },
        { icon: Clock, label: "Availability", path: "/dashboard/availability" },
        { icon: Bell, label: "Notifications", path: "/dashboard/notifications" }
      );
    }

    if (user.role === "admin") {
      baseItems.push(
        { icon: Calendar, label: "Timetables", path: "/dashboard/timetable" },
        { icon: Building2, label: "Hall Search", path: "/dashboard/halls" },
        { icon: Clock, label: "Availability", path: "/dashboard/availability" },
        { icon: Bell, label: "Notifications", path: "/dashboard/notifications" }
      );
    }

    if (user.role === "registrar") {
      baseItems.push(
        { icon: Users, label: "User Management", path: "/dashboard/registrar" },
        { icon: Settings, label: "Settings", path: "/dashboard/registrar" }
      );
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Camp-Compass</h1>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.department && (
              <p className="text-xs text-gray-500 mt-1">{user.department}</p>
            )}
            {user.level && (
              <p className="text-xs text-gray-500">{user.level}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

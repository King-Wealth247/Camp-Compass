import { createBrowserRouter } from "next/navigation";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RegistrarDashboard } from "./pages/RegistrarDashboard";
import { CampusMapPage } from "./pages/CampusMapPage";
import { TimetablePage } from "./pages/TimetablePage";
import { HallSearchPage } from "./pages/HallSearchPage";
import { AvailabilityPage } from "./pages/AvailabilityPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { path: "student", Component: StudentDashboard },
      { path: "staff", Component: StaffDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "registrar", Component: RegistrarDashboard },
      { path: "map", Component: CampusMapPage },
      { path: "timetable", Component: TimetablePage },
      { path: "halls", Component: HallSearchPage },
      { path: "availability", Component: AvailabilityPage },
      { path: "notifications", Component: NotificationsPage },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

import { useAuth } from "@/app/context/AuthContext";
import { MapPin, Calendar, Bell, BookOpen, Clock, AlertCircle } from "lucide-react";
import { timetableData, notifications } from "@/app/data/mockData";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function StudentDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const todaysCourses = timetableData
    .filter(
      (entry) =>
        entry.department === user.department &&
        entry.level === user.level &&
        entry.day === "Monday"
    )
    .slice(0, 3);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          {user.department} • {user.level}
        </p>
      </div>

      {/* Tuition Warning */}
      {!user.tuitionPaid && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Payment Required</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your timetable access is restricted. Please complete your first tuition
              installment payment to view your schedule and receive notifications.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.tuitionPaid ? "18" : "—"}
          </p>
          <p className="text-sm text-gray-600">Courses This Week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-sm text-gray-600">Campus Buildings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.tuitionPaid ? unreadNotifications : "—"}
          </p>
          <p className="text-sm text-gray-600">New Notifications</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">6</p>
          <p className="text-sm text-gray-600">Active Courses</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">Monday, March 24, 2026</p>
          </div>
          <div className="p-6">
            {user.tuitionPaid ? (
              <div className="space-y-4">
                {todaysCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-lg px-3 py-2 min-w-16">
                      <span className="text-lg font-bold">{course.startTime}</span>
                      <span className="text-xs">{course.endTime}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{course.courseName}</p>
                      <p className="text-sm text-gray-600">{course.courseCode}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {course.hallCode}
                        </span>
                        <span>{course.lecturerName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Complete your tuition payment to view your schedule</p>
              </div>
            )}
          </div>
        </div>

        {/* Campus Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
          </div>
          <div className="p-6 space-y-3">
            <a
              href="/dashboard/map"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                  Campus Map
                </p>
                <p className="text-sm text-gray-600">
                  Navigate to buildings and halls
                </p>
              </div>
            </a>

            {user.tuitionPaid && (
              <>
                <a
                  href="/dashboard/timetable"
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition group"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-green-600">
                      My Timetable
                    </p>
                    <p className="text-sm text-gray-600">View your weekly schedule</p>
                  </div>
                </a>

                <a
                  href="/dashboard/notifications"
                  className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition group"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center relative">
                    <Bell className="w-6 h-6 text-white" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600">
                      Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      {unreadNotifications} unread messages
                    </p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

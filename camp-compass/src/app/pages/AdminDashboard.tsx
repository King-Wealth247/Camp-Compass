import { useAuth } from "../context/AuthContext";
import { Calendar, Building2, Users, AlertTriangle } from "lucide-react";
import { halls, timetableData } from "../data/mockData";

export function AdminDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const availableHalls = halls.filter((h) => h.available).length;
  const totalCourses = timetableData.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System Overview & Management</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
          <p className="text-sm text-gray-600">Scheduled Courses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{availableHalls}</p>
          <p className="text-sm text-gray-600">Available Halls</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">45</p>
          <p className="text-sm text-gray-600">Active Lecturers</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-sm text-gray-600">Conflicts Detected</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Availability Changes
            </h2>
            <p className="text-sm text-gray-600 mt-1">Lecturer updates this week</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Dr. John Smith - Unavailable
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Thursday 14:00-16:00 • Medical appointment
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Reschedule Course →
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-600 mt-1">
                  Available all week • No conflicts
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">Dr. Emily Brown</p>
                <p className="text-sm text-gray-600 mt-1">
                  Available all week • No conflicts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Management Tools</h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Generate New Timetable
                  </p>
                  <p className="text-sm text-gray-600">Create next week's schedule</p>
                </div>
              </div>
            </button>

            <a
              href="/dashboard/halls"
              className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hall Search & Management</p>
                  <p className="text-sm text-gray-600">Find and manage halls</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/timetable"
              className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">View All Timetables</p>
                  <p className="text-sm text-gray-600">Browse all schedules</p>
                </div>
              </div>
            </a>

            <button className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Send Notification</p>
                  <p className="text-sm text-gray-600">Alert students & staff</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

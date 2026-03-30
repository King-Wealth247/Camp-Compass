import { useAuth } from "@/app/context/AuthContext";
import { Calendar, Users, Clock, Bell } from "lucide-react";
import { timetableData } from "@/app/data/mockData";

export function StaffDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const mySchedule = timetableData
    .filter((entry) => entry.lecturerName === user.name)
    .slice(0, 5);

  const totalCourses = timetableData.filter(
    (entry) => entry.lecturerName === user.name
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.name}
        </h1>
        <p className="text-gray-600">{user.department} Department</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
          <p className="text-sm text-gray-600">Courses This Week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">250+</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Available</p>
          <p className="text-sm text-gray-600">This Week Status</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-600">Pending Updates</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Teaching Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">My Teaching Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">This Week</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {mySchedule.map((course) => (
                <div
                  key={course.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {course.courseName}
                      </p>
                      <p className="text-sm text-gray-600">{course.courseCode}</p>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {course.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {course.startTime} - {course.endTime}
                    </span>
                    <span>•</span>
                    <span>{course.hallCode}</span>
                    <span>•</span>
                    <span>
                      {course.department} {course.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <a
              href="/dashboard/availability"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Update Availability</p>
                  <p className="text-sm text-gray-600">
                    Declare next week's schedule
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/timetable"
              className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">View Full Schedule</p>
                  <p className="text-sm text-gray-600">Check all classes</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/notifications"
              className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-600">View all updates</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

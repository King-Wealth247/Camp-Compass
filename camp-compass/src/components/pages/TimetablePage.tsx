import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { timetableData } from "@/app/data/mockData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

export function TimetablePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"week" | "list">("week");

  if (!user) return null;

  // Filter timetable based on user role
  const getUserTimetable = () => {
    if (user.role === "student") {
      return timetableData.filter(
        (entry) =>
          entry.department === user.department && entry.level === user.level
      );
    } else if (user.role === "staff") {
      return timetableData.filter((entry) => entry.lecturerName === user.name);
    } else {
      return timetableData;
    }
  };

  const userTimetable = getUserTimetable();

  const getTimeSlotEntry = (day: string, timeSlot: string) => {
    return userTimetable.find((entry) => {
      const entryStart = entry.startTime;
      const slotStart = timeSlot.split("-")[0];
      return entry.day === day && entryStart === slotStart;
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === "student" ? "My Timetable" : "Teaching Schedule"}
            </h1>
            <p className="text-gray-600 mt-1">
              Week of March 24 - 28, 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {user.role === "student" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>{user.department}</strong> • {user.level} •{" "}
              {userTimetable.length} courses this week
            </p>
          </div>
        )}
      </div>

      {viewMode === "week" ? (
        /* Week View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[120px]">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b border-gray-100">
                    <td className="p-4 text-sm text-gray-600 font-medium bg-gray-50">
                      {timeSlot}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getTimeSlotEntry(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-2">
                          {entry ? (
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded hover:bg-blue-100 transition cursor-pointer">
                              <p className="font-semibold text-gray-900 text-sm mb-1">
                                {entry.courseName}
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                {entry.courseCode}
                              </p>
                              <div className="flex flex-col gap-1 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {entry.hallCode}
                                </span>
                                {user.role !== "staff" && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {entry.lecturerName}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full min-h-[80px]"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {DAYS.map((day) => {
            const dayEntries = userTimetable.filter((entry) => entry.day === day);
            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{day}</h3>
                </div>
                <div className="p-4">
                  {dayEntries.length > 0 ? (
                    <div className="space-y-3">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 min-w-[100px]">
                            <span className="text-lg font-bold">
                              {entry.startTime}
                            </span>
                            <span className="text-xs">{entry.endTime}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {entry.courseName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {entry.courseCode}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {entry.hallCode}
                              </span>
                              {user.role !== "staff" && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {entry.lecturerName}
                                </span>
                              )}
                              {user.role === "admin" && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {entry.department} {entry.level}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No classes scheduled
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

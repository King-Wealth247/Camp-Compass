import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Calendar, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
];

interface Availability {
  [key: string]: {
    [key: string]: boolean;
  };
}

export function AvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<Availability>(() => {
    const initial: Availability = {};
    DAYS.forEach((day) => {
      initial[day] = {};
      TIME_SLOTS.forEach((slot) => {
        initial[day][slot] = true; // Default to available
      });
    });
    return initial;
  });
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const toggleDay = (day: string) => {
    const allAvailable = TIME_SLOTS.every((slot) => availability[day][slot]);
    setAvailability((prev) => ({
      ...prev,
      [day]: Object.fromEntries(
        TIME_SLOTS.map((slot) => [slot, !allAvailable])
      ),
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getAvailableCount = () => {
    let count = 0;
    DAYS.forEach((day) => {
      TIME_SLOTS.forEach((slot) => {
        if (availability[day][slot]) count++;
      });
    });
    return count;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Availability Declaration
        </h1>
        <p className="text-gray-600">
          Declare your availability for the week of March 31 - April 4, 2026
        </p>
      </div>

      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-900">
            Your availability has been submitted successfully. The admin has been
            notified.
          </p>
        </div>
      )}

      {user.role === "staff" && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 mb-1">Important Reminder</p>
            <p className="text-sm text-blue-700">
              Please submit your availability by{" "}
              <strong>Friday 5:00 PM</strong> each week. Any mid-week changes will
              trigger a notification to the admin for manual timetable adjustments.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Availability Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Weekly Availability
              </h2>
              <p className="text-sm text-gray-600">
                Click to toggle availability
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[120px]">
                    Time Slot
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-4 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[140px]"
                    >
                      <button
                        onClick={() => toggleDay(day)}
                        className="hover:text-blue-600 transition"
                      >
                        {day}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="border-b border-gray-100">
                    <td className="p-4 text-sm font-medium text-gray-700 bg-gray-50">
                      {slot}
                    </td>
                    {DAYS.map((day) => (
                      <td key={`${day}-${slot}`} className="p-2">
                        <button
                          onClick={() => toggleSlot(day, slot)}
                          className={`w-full h-16 rounded-lg transition-all ${
                            availability[day][slot]
                              ? "bg-green-100 hover:bg-green-200 border-2 border-green-400"
                              : "bg-red-100 hover:bg-red-200 border-2 border-red-400"
                          }`}
                        >
                          {availability[day][slot] ? (
                            <CheckCircle className="w-6 h-6 mx-auto text-green-600" />
                          ) : (
                            <span className="text-red-600 text-xl">✕</span>
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Submit */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {getAvailableCount()}
                  </p>
                  <p className="text-sm text-gray-600">Available Slots</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {DAYS.length * TIME_SLOTS.length - getAvailableCount()}
                  </p>
                  <p className="text-sm text-gray-600">Unavailable Slots</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Additional Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any comments or special requests..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Send className="w-5 h-5" />
              Submit Availability
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Deadline: Friday, March 28, 5:00 PM
            </p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 border-2 border-green-400 rounded flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 border-2 border-red-400 rounded flex items-center justify-center">
                  <span className="text-red-600">✕</span>
                </div>
                <span className="text-sm text-gray-700">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

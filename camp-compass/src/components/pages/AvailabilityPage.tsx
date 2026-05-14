import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Calendar, Clock, CheckCircle, AlertCircle, Send, Loader2 } from "lucide-react";
import { dataService, Availability } from "@/lib/dataService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_RANGES = [
  { value: "08:00-12:00", label: "8:00 AM - 12:00 PM" },
  { value: "13:00-17:00", label: "1:00 PM - 5:00 PM" },
  { value: "08:00-17:00", label: "8:00 AM - 5:00 PM" },
];

interface AvailabilityForm {
  monday: boolean;
  mondayTime: string;
  tuesday: boolean;
  tuesdayTime: string;
  wednesday: boolean;
  wednesdayTime: string;
  thursday: boolean;
  thursdayTime: string;
  friday: boolean;
  fridayTime: string;
  saturday: boolean;
  saturdayTime: string;
  description: string;
}

export function AvailabilityPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<AvailabilityForm>({
    monday: false,
    mondayTime: "08:00-17:00",
    tuesday: false,
    tuesdayTime: "08:00-17:00",
    wednesday: false,
    wednesdayTime: "08:00-17:00",
    thursday: false,
    thursdayTime: "08:00-17:00",
    friday: false,
    fridayTime: "08:00-17:00",
    saturday: false,
    saturdayTime: "08:00-17:00",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingAvailability, setExistingAvailability] = useState<Availability | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadExistingAvailability();
    }
  }, [user]);

  const loadExistingAvailability = async () => {
    if (!user?.id) return;
    try {
      const response = await dataService.getAvailabilities(user.id);
      if (response.data && response.data.length > 0) {
        const latest = response.data[0]; // Most recent first
        setExistingAvailability(latest);
        setForm({
          monday: latest.monday,
          mondayTime: latest.mondayTime || "08:00-17:00",
          tuesday: latest.tuesday,
          tuesdayTime: latest.tuesdayTime || "08:00-17:00",
          wednesday: latest.wednesday,
          wednesdayTime: latest.wednesdayTime || "08:00-17:00",
          thursday: latest.thursday,
          thursdayTime: latest.thursdayTime || "08:00-17:00",
          friday: latest.friday,
          fridayTime: latest.fridayTime || "08:00-17:00",
          saturday: latest.saturday,
          saturdayTime: latest.saturdayTime || "08:00-17:00",
          description: latest.description || "",
        });
      }
    } catch (error) {
      console.error("Failed to load availability:", error);
    }
  };

  if (!user) return null;

  const handleDayToggle = (day: string) => {
    const dayKey = day.toLowerCase() as keyof AvailabilityForm;
    const timeKey = `${day.toLowerCase()}Time` as keyof AvailabilityForm;
    setForm(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const handleTimeChange = (day: string, time: string) => {
    const timeKey = `${day.toLowerCase()}Time` as keyof AvailabilityForm;
    setForm(prev => ({
      ...prev,
      [timeKey]: time,
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await dataService.submitAvailability({
        lecturerId: user.id,
        monday: form.monday,
        mondayTime: form.monday ? form.mondayTime : undefined,
        tuesday: form.tuesday,
        tuesdayTime: form.tuesday ? form.tuesdayTime : undefined,
        wednesday: form.wednesday,
        wednesdayTime: form.wednesday ? form.wednesdayTime : undefined,
        thursday: form.thursday,
        thursdayTime: form.thursday ? form.thursdayTime : undefined,
        friday: form.friday,
        fridayTime: form.friday ? form.fridayTime : undefined,
        saturday: form.saturday,
        saturdayTime: form.saturday ? form.saturdayTime : undefined,
        description: form.description || undefined,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      await loadExistingAvailability(); // Refresh data
    } catch (error) {
      console.error("Failed to submit availability:", error);
      alert("Failed to submit availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDaysCount = () => {
    return DAYS.filter(day => form[day.toLowerCase() as keyof AvailabilityForm] as boolean).length;
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
        {/* Availability Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Weekly Availability
              </h2>
              <p className="text-sm text-gray-600">
                Select days and time ranges you're available
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    id={day}
                    checked={form[day.toLowerCase() as keyof AvailabilityForm] as boolean}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={day} className="text-sm font-medium text-gray-900">
                    {day}
                  </label>
                </div>
                {form[day.toLowerCase() as keyof AvailabilityForm] && (
                  <select
                    value={form[`${day.toLowerCase()}Time` as keyof AvailabilityForm] as string}
                    onChange={(e) => handleTimeChange(day, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {TIME_RANGES.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Any special circumstances or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
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
                    {getAvailableDaysCount()}
                  </p>
                  <p className="text-sm text-gray-600">Available Days</p>
                </div>
              </div>

              {existingAvailability && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Last submitted:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(existingAvailability.submissionDate).toLocaleDateString()}
                  </p>
                  {existingAvailability.resubmission && (
                    <p className={`text-xs mt-1 ${
                      existingAvailability.resubmission === 'validated' ? 'text-green-600' :
                      existingAvailability.resubmission === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      Status: {existingAvailability.resubmission}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {existingAvailability ? 'Update Availability' : 'Submit Availability'}
          </button>

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

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Calendar, Building2, Users, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { halls, timetableData } from "@/app/data/mockData";
import { dataService, Availability } from "@/lib/dataService";

export function AdminDashboard() {
  const { user } = useAuth();
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resubmissions, setResubmissions] = useState<Availability[]>([]);
  const [loadingResubmissions, setLoadingResubmissions] = useState(true);

  useEffect(() => {
    loadResubmissions();
  }, []);

  const loadResubmissions = async () => {
    try {
      const response = await dataService.getAvailabilities();
      if (response.data) {
        // Filter for unseen resubmissions
        const pending = response.data.filter(r => r.resubmission === 'unseen');
        setResubmissions(pending);
      }
    } catch (error) {
      console.error("Failed to load resubmissions:", error);
    } finally {
      setLoadingResubmissions(false);
    }
  };

  const handleReviewResubmission = async (id: string, action: 'validate' | 'reject') => {
    try {
      await dataService.reviewAvailability(id, action);
      // Refresh the list
      await loadResubmissions();
    } catch (error) {
      console.error("Failed to review resubmission:", error);
      alert("Failed to process review. Please try again.");
    }
  };

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
          <p className="text-2xl font-bold text-gray-900">{resubmissions.length}</p>
          <p className="text-sm text-gray-600">Pending Resubmissions</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Availability Resubmissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Availability Resubmissions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Lecturer availability changes requiring review</p>
          </div>
          <div className="p-6">
            {loadingResubmissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : resubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p>No pending resubmissions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resubmissions.map((resubmission) => (
                  <div key={resubmission.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {resubmission.lecturer.name} - Availability Update
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted: {new Date(resubmission.submissionDate).toLocaleDateString()}
                        </p>
                        {resubmission.description && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{resubmission.description}"
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleReviewResubmission(resubmission.id, 'validate')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Validate
                          </button>
                          <button
                            onClick={() => handleReviewResubmission(resubmission.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Management Tools</h2>
          </div>
          <div className="p-6 space-y-3">
            <button
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                setGenerationStatus(null);
                try {
                  const response = await dataService.generateTimetable({ startDate: new Date().toISOString().slice(0, 10) });
                  if (response.data) {
                    setGenerationStatus(response.data.message);
                  } else {
                    setGenerationStatus('Timetable generation completed, but no response was returned.');
                  }
                } catch (error) {
                  setGenerationStatus('Failed to generate timetable. Please try again.');
                } finally {
                  setIsGenerating(false);
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left disabled:opacity-60 disabled:cursor-not-allowed"
            >
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
              <span className="text-sm text-gray-700">
                {isGenerating ? 'Generating...' : 'Run'}
              </span>
            </button>
            {generationStatus ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                {generationStatus}
              </div>
            ) : null}

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

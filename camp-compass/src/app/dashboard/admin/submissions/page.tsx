"use client";

import { useEffect, useState } from "react";
import { dataService, Availability } from "@/lib/dataService";
import { Clock, Filter, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterResubmissions, setFilterResubmissions] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await dataService.getAvailabilities();
    if (res.data) setSubmissions(res.data);
    setLoading(false);
  };

  const handleReview = async (id: string, action: 'validate' | 'reject') => {
    try {
      await dataService.reviewAvailability(id, action);
      toast.success(`Resubmission ${action}d`);
      load();
    } catch (err) {
      toast.error("Failed to review resubmission");
    }
  };

  const filtered = submissions.filter(s => {
    if (filterResubmissions) return s.resubmission !== null;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecturer Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Review availability submissions and changes</p>
        </div>
        <button
          onClick={() => setFilterResubmissions(!filterResubmissions)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            filterResubmissions ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          {filterResubmissions ? "Showing Resubmissions" : "Filter: Resubmissions"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading submissions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No submissions found.</td></tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{s.lecturer?.name}</div>
                        <div className="text-xs text-gray-500">{s.lecturer?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(s.submissionDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {s.resubmission !== null ? (
                          <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-medium">
                            <Clock className="w-3 h-3" /> Resubmission
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            Initial
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{s.description || "-"}</td>
                      <td className="py-3 px-4">
                        {s.resubmission === 'unseen' && <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium"><AlertCircle className="w-4 h-4"/> Pending</span>}
                        {s.resubmission === 'validated' && <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4"/> Approved</span>}
                        {s.resubmission === 'rejected' && <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><XCircle className="w-4 h-4"/> Rejected</span>}
                        {s.resubmission === null && <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.resubmission === 'unseen' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleReview(s.id, 'validate')} className="text-xs px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded font-medium">Approve</button>
                            <button onClick={() => handleReview(s.id, 'reject')} className="text-xs px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { dataService, Timetable, Institution, Department, Level } from "@/lib/dataService";
import { CalendarDays, Wand2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TimetablesPage() {
  const [activeTab, setActiveTab] = useState<"view" | "generate">("view");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
        <p className="text-sm text-gray-500 mt-1">View schedules and generate new ones</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {/* Navbar */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {[
            { id: "view", label: "View time tables", icon: CalendarDays },
            { id: "generate", label: "Generate", icon: Wand2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "view" && <ViewTimetablesTab />}
          {activeTab === "generate" && <GenerateTimetablesTab onComplete={() => setActiveTab("view")} />}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW TIMETABLES TAB
// -------------------------------------------------------------
function ViewTimetablesTab() {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    dataService.getTimetables().then(res => {
      if (res.data) setTimetables(res.data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
          <tr>
            <th className="py-3 px-4 w-10"></th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4">Level</th>
            <th className="py-3 px-4">Subcomponents</th>
            <th className="py-3 px-4">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {timetables.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No timetables generated yet.</td></tr>
          ) : (
            timetables.map(t => {
              const isExpanded = expanded.has(t.id);
              return (
                <React.Fragment key={t.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                    <td className="py-3 px-4 text-gray-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                    </td>
                    <td className="py-3 px-4 font-medium">{t.department?.departmentName || "-"}</td>
                    <td className="py-3 px-4">Level {t.level}</td>
                    <td className="py-3 px-4">{t.subComponents?.length || 0} classes</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                  {isExpanded && t.subComponents && t.subComponents.length > 0 && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-100 text-gray-600">
                              <tr>
                                <th className="py-2 px-3">Course</th>
                                <th className="py-2 px-3">Instructor</th>
                                <th className="py-2 px-3">Hall</th>
                                <th className="py-2 px-3">Time</th>
                                <th className="py-2 px-3">Day</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {t.subComponents.map((sub: any) => (
                                <tr key={sub.id}>
                                  <td className="py-2 px-3 font-medium">{sub.course}</td>
                                  <td className="py-2 px-3 text-gray-600">{sub.instructor}</td>
                                  <td className="py-2 px-3 text-gray-600">{sub.hall} (Flr {sub.floor})</td>
                                  <td className="py-2 px-3 text-gray-600">
                                    {new Date(sub.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                    {new Date(sub.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </td>
                                  <td className="py-2 px-3 text-gray-600">{sub.day}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------------------------------------------
// GENERATE TAB
// -------------------------------------------------------------
function GenerateTimetablesTab({ onComplete }: { onComplete: () => void }) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [mode, setMode] = useState<"all" | "department" | "single">("all");
  
  const [selInst, setSelInst] = useState("");
  const [selDept, setSelDept] = useState("");
  const [selLevel, setSelLevel] = useState("");
  const [startDate, setStartDate] = useState("");

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      dataService.getInstitutions(),
      dataService.getDepartments(),
      dataService.getLevels()
    ]).then(([i, d, l]) => {
      if (i.data) setInstitutions(i.data);
      if (d.data) setDepartments(d.data);
      if (l.data) setLevels(l.data);
    });
  }, []);

  const handleGenerate = async () => {
    if (mode === 'department' && !selDept) return toast.error("Select a department");
    if (mode === 'single' && !selLevel) return toast.error("Select a level");

    setGenerating(true);
    setProgress(0);

    // Simulate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 10;
      });
    }, 200);

    try {
      const res = await dataService.generateTimetable({
        campusId: "dummy", // The generator backend was refactored to use mode, departmentId, levelId, startDate
        startDate: startDate || undefined,
        ...(mode === 'department' ? { departmentId: selDept } : {}),
        ...(mode === 'single' ? { departmentId: selDept, levelId: selLevel } : {}),
      } as any);

      // We need to send mode directly to the custom backend API, wait, dataService only takes campusId, startDate, endDate.
      // Let's bypass dataService strongly typed params for this specific call
      await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, departmentId: selDept, levelId: selLevel, startDate })
      });

      setProgress(100);
      toast.success("Timetable generated successfully!");
      setTimeout(() => onComplete(), 1000);
    } catch (err) {
      toast.error("Generation failed due to constraints or server error");
    } finally {
      clearInterval(interval);
      setTimeout(() => setGenerating(false), 1000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setMode('all')} className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'all' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <h3 className={`font-semibold ${mode === 'all' ? 'text-blue-700' : 'text-gray-900'}`}>All Departments</h3>
          <p className="text-xs text-gray-500 mt-1">Generate for every level in every department across the institution.</p>
        </button>
        <button onClick={() => setMode('department')} className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'department' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <h3 className={`font-semibold ${mode === 'department' ? 'text-blue-700' : 'text-gray-900'}`}>Single Department</h3>
          <p className="text-xs text-gray-500 mt-1">Generate for all levels within a specific department.</p>
        </button>
        <button onClick={() => setMode('single')} className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'single' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <h3 className={`font-semibold ${mode === 'single' ? 'text-blue-700' : 'text-gray-900'}`}>Single Level</h3>
          <p className="text-xs text-gray-500 mt-1">Generate for one specific level in a department.</p>
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
        {mode !== 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <select value={selInst} onChange={e => { setSelInst(e.target.value); setSelDept(""); setSelLevel(""); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Select Institution...</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select value={selDept} onChange={e => { setSelDept(e.target.value); setSelLevel(""); }} disabled={!selInst} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100">
                <option value="">Select Department...</option>
                {departments.filter(d => d.institutionId === selInst).map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'single' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select value={selLevel} onChange={e => setSelLevel(e.target.value)} disabled={!selDept} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100">
                <option value="">Select Level...</option>
                {levels.filter(l => l.departmentId === selDept).map(l => <option key={l.id} value={l.id}>Level {l.level}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Week Start Date (Optional)</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>

      {generating && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-blue-900 mb-2">Constraint Solver is Generating Timetable...</p>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {!generating && (
        <button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
          <Wand2 className="w-5 h-5" /> Generate Timetable
        </button>
      )}

    </div>
  );
}

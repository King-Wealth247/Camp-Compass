import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Calendar, MapPin, User, X, ChevronDown, Loader2 } from "lucide-react";
import { dataService, Timetable } from "@/lib/dataService";
import { TimetableEntry } from "@/app/data/mockData"; // Keeping the type for UI consistency

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const DEPT_COLORS: Record<string, string> = {
  "Computer Science": "#2563EB",
  "Engineering": "#7C3AED",
  "Science": "#059669",
};

function deptColor(dept: string) {
  return DEPT_COLORS[dept] ?? "#2563EB";
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const BASE_HOUR = 8;
const SLOT_HEIGHT_PX = 64;

function slotTopPx(startTime: string) {
  return (timeToMinutes(startTime) - BASE_HOUR * 60) * (SLOT_HEIGHT_PX / 60);
}

function slotHeightPx(startTime: string, endTime: string) {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) * (SLOT_HEIGHT_PX / 60);
}

interface SlotDetailProps {
  entry: TimetableEntry;
  onClose: () => void;
  onViewMap: () => void;
  showMap: boolean;
}

function SlotDetail({ entry, onClose, onViewMap, showMap }: SlotDetailProps) {
  const color = deptColor(entry.department);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900 pr-6">{entry.courseName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{entry.courseCode}</p>

          <div className="space-y-2 text-sm text-gray-700 mb-5">
            <div className="flex gap-2"><span className="text-gray-400 w-10">Time</span><span>{entry.startTime} – {entry.endTime}</span></div>
            <div className="flex gap-2"><span className="text-gray-400 w-10">Day</span><span>{entry.day}</span></div>
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span>{entry.lecturerName}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span>{entry.hallCode} · Floor {entry.floor}</span></div>
            <div className="flex gap-2"><span className="text-gray-400 w-10">Dept</span><span>{entry.department} · {entry.level}</span></div>
          </div>

          {showMap && (
            <button
              onClick={onViewMap}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: color }}
            >
              <MapPin className="w-4 h-4" />
              View on Floor Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TimetablePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [dbTimetables, setDbTimetables] = useState<any[]>([]);
  
  const [viewMode, setViewMode] = useState<"week" | "list">("week");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  
  const [filterDept, setFilterDept] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  // Fetch timetables based on role
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        let res;
        if (user.role === 'student') {
          // If student, check the database for existing timetable for their specific departmentId and levelId
          if (user.departmentId && user.levelId) {
            res = await dataService.getTimetablesByDepartmentAndLevel(user.departmentId, user.levelId);
            // We just need the latest timetable (backend sorts by desc createdAt)
            if (res.data && res.data.length > 0) {
              setDbTimetables([res.data[0]]); // Take only the latest one
            } else {
              setDbTimetables([]);
            }
          }
        } else if (user.role === 'staff') {
          // Instructor view
          res = await dataService.getTimetablesByInstructor(user.name);
          setDbTimetables(res.data || []);
        } else {
          // Admin/Registrar gets all
          res = await dataService.getTimetables();
          setDbTimetables(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load timetables", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";
  const hasMap = isAdmin || user.role === "student" || user.role === "staff";

  // Map backend timetables to UI entries
  const allEntries = useMemo(() => {
    let entries: TimetableEntry[] = [];
    
    dbTimetables.forEach((tt: any) => {
      if (tt.subComponents) {
        tt.subComponents.forEach((sub: any) => {
          entries.push({
            id: sub.id,
            courseId: sub.courseId,
            courseCode: sub.courseRef?.code || sub.course,
            courseName: sub.courseRef?.title || sub.course,
            lecturerName: sub.instructor,
            department: tt.department?.departmentName || "Unknown Dept",
            level: `Level ${tt.level}`,
            day: sub.day,
            startTime: new Date(sub.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(sub.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            hallId: sub.hallId,
            hallCode: sub.hall,
            floor: sub.floor || 1,
            buildingId: sub.hallRef?.buildingId || '',
          });
        });
      }
    });

    if (isAdmin) {
      if (filterDept) entries = entries.filter((e) => e.department === filterDept);
      if (filterLevel) entries = entries.filter((e) => e.level.includes(filterLevel));
    }
    
    return entries;
  }, [dbTimetables, filterDept, filterLevel, isAdmin]);

  const ALL_DEPARTMENTS = [...new Set(allEntries.map((e) => e.department))].sort();
  const levelOptions = filterDept 
    ? [...new Set(allEntries.filter(e => e.department === filterDept).map((e) => e.level))].sort()
    : [...new Set(allEntries.map((e) => e.level))].sort();

  const dayEntries = allEntries.filter((e) => e.day === selectedDay);

  const handleViewMap = (entry: TimetableEntry) => {
    setSelectedEntry(null);
    router.push(`/dashboard/map?buildingId=${entry.buildingId}&floor=${entry.floor}&hallCode=${encodeURIComponent(entry.hallCode)}`);
  };

  const totalGridHeight = TIME_SLOTS.length * SLOT_HEIGHT_PX;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Timetable...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isStaff ? "Teaching Schedule" : "My Timetable"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin
                ? `${filterDept || "All Departments"} · ${filterLevel || "All Levels"} · ${allEntries.length} entries`
                : isStaff
                ? `${user.name} · ${allEntries.length} classes`
                : `${user.department || 'No Dept'} · Level ${user.level || 'No Level'} · ${allEntries.length} courses`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "week" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Admin filters */}
        {isAdmin && (
          <div className="flex gap-3">
            {/* Department dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDeptOpen(!deptOpen); setLevelOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {filterDept || "All Departments"} <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {deptOpen && (
                <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[180px]">
                  {["", ...ALL_DEPARTMENTS].map((d) => (
                    <button
                      key={d}
                      onClick={() => { setFilterDept(d); setFilterLevel(""); setDeptOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${filterDept === d ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`}
                    >
                      {d || "All Departments"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Level dropdown */}
            <div className="relative">
              <button
                onClick={() => { setLevelOpen(!levelOpen); setDeptOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {filterLevel || "All Levels"} <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {levelOpen && (
                <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[140px]">
                  {["", ...levelOptions].map((l) => (
                    <button
                      key={l}
                      onClick={() => { setFilterLevel(l); setLevelOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${filterLevel === l ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`}
                    >
                      {l || "All Levels"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {viewMode === "week" ? (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 mb-4">
            {DAYS.map((day) => {
              const count = allEntries.filter((e) => e.day === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedDay === day ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {day.slice(0, 3)}
                  {count > 0 && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${selectedDay === day ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar grid */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0">
                {TIME_SLOTS.map((t) => (
                  <div key={t} className="h-16 flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs text-gray-400 font-medium">{t}</span>
                  </div>
                ))}
              </div>

              {/* Events column */}
              <div className="flex-1 relative border-l border-gray-100" style={{ height: totalGridHeight }}>
                {TIME_SLOTS.map((_, i) => (
                  <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: i * SLOT_HEIGHT_PX }} />
                ))}

                {dayEntries.map((entry) => {
                  const top = slotTopPx(entry.startTime);
                  let height = slotHeightPx(entry.startTime, entry.endTime);
                  if (height < 20) height = 20; // Minimum visual height
                  
                  const color = deptColor(entry.department);
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="absolute left-2 right-2 rounded-lg border-l-4 px-3 py-2 text-left hover:brightness-95 transition"
                      style={{ top, height, borderLeftColor: color, backgroundColor: `${color}18` }}
                    >
                      <p className="text-xs font-bold truncate" style={{ color }}>{entry.courseName}</p>
                      <p className="text-xs text-gray-500 truncate">{entry.hallCode} · {entry.startTime}–{entry.endTime}</p>
                      {(isAdmin || isStaff) && (
                        <p className="text-xs text-gray-400 truncate">{entry.department} {entry.level}</p>
                      )}
                    </button>
                  );
                })}

                {dayEntries.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-300 font-semibold">No classes on {selectedDay}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* List view */
        <div className="flex-1 overflow-y-auto space-y-4">
          {DAYS.map((day) => {
            const entries = allEntries.filter((e) => e.day === day);
            return (
              <div key={day} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">{day}</h3>
                </div>
                <div className="p-4">
                  {entries.length > 0 ? (
                    <div className="space-y-3">
                      {entries.map((entry) => {
                        const color = deptColor(entry.department);
                        return (
                          <button
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="w-full flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-left border border-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[80px] text-white" style={{ backgroundColor: color }}>
                              <span className="text-sm font-bold">{entry.startTime}</span>
                              <span className="text-xs opacity-80">{entry.endTime}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{entry.courseName}</p>
                              <p className="text-xs text-gray-500">{entry.courseCode}</p>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.hallCode} · Floor {entry.floor}</span>
                                {!isStaff && <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.lecturerName}</span>}
                                {isAdmin && <span>{entry.department} · {entry.level}</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-6">No classes scheduled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedEntry && (
        <SlotDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onViewMap={() => handleViewMap(selectedEntry)}
          showMap={hasMap}
        />
      )}
    </div>
  );
}

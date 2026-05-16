"use client";

import { useEffect, useState } from "react";
import { dataService, Institution, Building, Floor, Hall } from "@/lib/dataService";
import { Building2, Layers, DoorOpen, Plus, Search, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function InfrastructurePage() {
  const [activeTab, setActiveTab] = useState<"buildings" | "floors" | "halls">("buildings");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  
  useEffect(() => {
    dataService.getInstitutions().then(res => res.data && setInstitutions(res.data));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage buildings, floors, and halls</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {/* Navbar */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {[
            { id: "buildings", label: "Buildings", icon: Building2 },
            { id: "floors", label: "Floors", icon: Layers },
            { id: "halls", label: "Halls", icon: DoorOpen },
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
          {activeTab === "buildings" && <BuildingsTab institutions={institutions} />}
          {activeTab === "floors" && <FloorsTab institutions={institutions} />}
          {activeTab === "halls" && <HallsTab institutions={institutions} />}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BUILDINGS TAB
// -------------------------------------------------------------
function BuildingsTab({ institutions }: { institutions: Institution[] }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filterInst, setFilterInst] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newInstId, setNewInstId] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{name: string, code: string}>({ name: "", code: "" });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await dataService.getBuildings();
    if (res.data) setBuildings(res.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newInstId) return toast.error("Name and Institution are required");
    try {
      // In a real app, campusId should be derived from institution. We use a dummy campus ID for now or fetch campuses.
      // Assuming we need a campusId, let's fetch first campus of institution
      const campRes = await dataService.getCampuses();
      const campus = campRes.data?.find(c => c.institutionId === newInstId);
      if (!campus) return toast.error("No campus found for this institution");

      await dataService.createBuilding({ name: newName, code: newCode, floors: 1, campusId: campus.id });
      toast.success("Building added");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error("Failed to add building");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this building?")) return;
    try {
      await dataService.deleteBuilding(id);
      toast.success("Deleted successfully");
      load();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEditSave = async (id: string) => {
    try {
      await dataService.updateBuilding(id, { name: editData.name, code: editData.code });
      toast.success("Updated successfully");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const filtered = buildings.filter(b => {
    if (filterInst && b.campus?.institutionId !== filterInst) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !(b.code || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <select value={filterInst} onChange={e => setFilterInst(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[200px]">
          <option value="">All Institutions</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Building
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Institution</label>
            <select value={newInstId} onChange={e => setNewInstId(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Select Institution</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Building Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Science Block" />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">Code</label>
            <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="SCI" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Save</button>
        </form>
      )}

      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 group" onDoubleClick={() => { setEditingId(b.id); setEditData({ name: b.name, code: b.code || "" }); }}>
                  <td className="py-2 px-4">
                    {editingId === b.id ? <input className="border border-blue-400 rounded px-2 py-1 w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : b.name}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === b.id ? <input className="border border-blue-400 rounded px-2 py-1 w-full" value={editData.code} onChange={e => setEditData({...editData, code: e.target.value})} /> : b.code || "-"}
                  </td>
                  <td className="py-2 px-4 text-gray-500">
                    {institutions.find(i => i.id === b.campus?.institutionId)?.name || "-"}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {editingId === b.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditSave(b.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4"/></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500">No buildings found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// FLOORS TAB
// -------------------------------------------------------------
function FloorsTab({ institutions }: { institutions: Institution[] }) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  
  const [filterInst, setFilterInst] = useState<string>("");
  const [filterBldg, setFilterBldg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newBldgId, setNewBldgId] = useState("");
  const [newFloorNum, setNewFloorNum] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([dataService.getBuildings(), dataService.getFloors()]).then(([bRes, fRes]) => {
      if (bRes.data) setBuildings(bRes.data);
      if (fRes.data) setFloors(fRes.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBldgId || !newFloorNum) return toast.error("Building and Floor Number required");
    
    let base64Image = null;
    if (newImage) {
      // Convert to base64
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(newImage);
      });
    }

    try {
      // The API endpoint for floor needs to handle base64 strings or ignore them if we didn't implement it yet. 
      // Assuming we send it as a string to floorPlan.
      await dataService.createFloor({
        buildingId: newBldgId,
        floorNum: parseInt(newFloorNum),
        floorPlan: base64Image as string | undefined
      });
      toast.success("Floor added");
      setShowForm(false);
      const fRes = await dataService.getFloors();
      if (fRes.data) setFloors(fRes.data);
    } catch (err) {
      toast.error("Failed to add floor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await dataService.deleteFloor(id);
      toast.success("Deleted");
      setFloors(floors.filter(f => f.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const bldgOptionsForFilter = buildings.filter(b => !filterInst || b.campus?.institutionId === filterInst);

  const filtered = floors.filter(f => {
    if (filterBldg && f.buildingId !== filterBldg) return false;
    if (filterInst && buildings.find(b => b.id === f.buildingId)?.campus?.institutionId !== filterInst) return false;
    return true;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <select value={filterInst} onChange={e => { setFilterInst(e.target.value); setFilterBldg(""); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[180px]">
          <option value="">All Institutions</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={filterBldg} onChange={e => setFilterBldg(e.target.value)} disabled={!filterInst} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[180px] disabled:bg-gray-100">
          <option value="">All Buildings</option>
          {bldgOptionsForFilter.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="flex-1"></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Floor
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <label className="block text-xs text-gray-500 mb-1">Building</label>
            <select value={newBldgId} onChange={e => setNewBldgId(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Select...</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Floor #</label>
            <input type="number" value={newFloorNum} onChange={e => setNewFloorNum(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="1" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Floorplan Image (Optional)</label>
            <input type="file" accept="image/*" onChange={e => setNewImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Save</button>
        </form>
      )}

      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Floor Number</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Floorplan</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(f => {
                const bldg = buildings.find(b => b.id === f.buildingId);
                return (
                <tr key={f.id} className="hover:bg-gray-50 group">
                  <td className="py-2 px-4 font-medium">Floor {f.floorNum}</td>
                  <td className="py-2 px-4 text-gray-600">{bldg?.name || "-"}</td>
                  <td className="py-2 px-4">
                    {f.floorPlan ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Uploaded</span> : <span className="text-gray-400 text-xs">None</span>}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500">No floors found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// HALLS TAB
// -------------------------------------------------------------
function HallsTab({ institutions }: { institutions: Institution[] }) {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  const [filterInst, setFilterInst] = useState<string>("");
  const [filterBldg, setFilterBldg] = useState<string>("");
  const [filterFloor, setFilterFloor] = useState<string>("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [newName, setNewName] = useState("");
  const [newCap, setNewCap] = useState("");
  const [newBldgId, setNewBldgId] = useState("");
  const [newFloorId, setNewFloorId] = useState("");

  useEffect(() => {
    Promise.all([dataService.getHalls(), dataService.getBuildings(), dataService.getFloors()]).then(([hRes, bRes, fRes]) => {
      if (hRes.data) setHalls(hRes.data);
      if (bRes.data) setBuildings(bRes.data);
      if (fRes.data) setFloors(fRes.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCap || !newBldgId || !newFloorId) return toast.error("All fields required");
    try {
      const floorObj = floors.find(f => f.id === newFloorId);
      await dataService.createHall({
        name: newName,
        capacity: parseInt(newCap),
        buildingId: newBldgId,
        floorId: newFloorId,
        floor: floorObj?.floorNum || 1,
        available: true
      } as any); // Ignoring strict typing for the dummy floorId field if it mismatches
      toast.success("Hall added");
      setShowForm(false);
      const hRes = await dataService.getHalls();
      if (hRes.data) setHalls(hRes.data);
    } catch (err) {
      toast.error("Failed to add hall");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await dataService.deleteHall(id);
      toast.success("Deleted");
      setHalls(halls.filter(h => h.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const bldgOptions = buildings.filter(b => !filterInst || b.campus?.institutionId === filterInst);
  const floorOptions = floors.filter(f => !filterBldg || f.buildingId === filterBldg);

  const filtered = halls.filter(h => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBldg && h.building.id !== filterBldg) return false;
    if (filterFloor && h.floorId !== filterFloor && String(h.floor) !== filterFloor) return false;
    if (filterInst && buildings.find(b => b.id === h.building.id)?.campus?.institutionId !== filterInst) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <select value={filterInst} onChange={e => { setFilterInst(e.target.value); setFilterBldg(""); setFilterFloor(""); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-40">
          <option value="">Institutions</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={filterBldg} onChange={e => { setFilterBldg(e.target.value); setFilterFloor(""); }} disabled={!filterInst} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-40 disabled:bg-gray-100">
          <option value="">Buildings</option>
          {bldgOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterFloor} onChange={e => setFilterFloor(e.target.value)} disabled={!filterBldg} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-40 disabled:bg-gray-100">
          <option value="">Floors</option>
          {floorOptions.map(f => <option key={f.id} value={f.id}>Floor {f.floorNum}</option>)}
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search halls..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Hall
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Building</label>
            <select value={newBldgId} onChange={e => setNewBldgId(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Select...</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Floor</label>
            <select value={newFloorId} onChange={e => setNewFloorId(e.target.value)} required disabled={!newBldgId} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white disabled:bg-gray-100">
              <option value="">Select...</option>
              {floors.filter(f => f.buildingId === newBldgId).map(f => <option key={f.id} value={f.id}>Floor {f.floorNum}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Hall Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Room 101" />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Capacity</label>
            <input type="number" value={newCap} onChange={e => setNewCap(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="50" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Save</button>
        </form>
      )}

      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Hall Name</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 group">
                  <td className="py-2 px-4 font-medium">{h.name}</td>
                  <td className="py-2 px-4 text-gray-600">{h.capacity}</td>
                  <td className="py-2 px-4 text-gray-600">{h.building.name}</td>
                  <td className="py-2 px-4 text-gray-600">Floor {typeof h.floor === 'object' ? h.floor.floorNum : h.floor}</td>
                  <td className="py-2 px-4 text-right">
                    <button onClick={() => handleDelete(h.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No halls found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

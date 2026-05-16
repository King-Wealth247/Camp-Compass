import React, { useState, useEffect } from 'react';
import { dataService, Campus, Building, Hall, Institution } from '@/lib/dataService';
import { toast } from 'sonner';
import { Building2, MapPin, DoorOpen, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

type Tab = 'campuses' | 'buildings' | 'halls';

export function FacilitiesAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('campuses');
  
  // Data state
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, hRes, iRes] = await Promise.all([
        dataService.getCampuses(),
        dataService.getBuildings(),
        dataService.getHalls(),
        dataService.getInstitutions()
      ]);
      if (cRes.data) setCampuses(cRes.data);
      if (bRes.data) setBuildings(bRes.data);
      if (hRes.data) setHalls(hRes.data);
      if (iRes.data) setInstitutions(iRes.data);
    } catch (error) {
      toast.error('Failed to load facilities data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: 'add' | 'edit', item: any = null) => {
    setModalMode(mode);
    setEditingItem(item);
    
    if (mode === 'edit' && item) {
      setFormData({ ...item });
    } else {
      // Default forms based on tab
      if (activeTab === 'campuses') {
        setFormData({ name: '', city: '', region: '', latitude: '', longitude: '', institutionId: institutions[0]?.id || '' });
      } else if (activeTab === 'buildings') {
        setFormData({ name: '', code: '', campusId: campuses[0]?.id || '', floors: 1, latitude: '', longitude: '' });
      } else if (activeTab === 'halls') {
        setFormData({ name: '', capacity: 30, available: true, floor: 1, buildingId: buildings[0]?.id || '' });
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (activeTab === 'campuses') {
        await dataService.deleteCampus(id);
      } else if (activeTab === 'buildings') {
        await dataService.deleteBuilding(id);
      } else if (activeTab === 'halls') {
        await dataService.deleteHall(id);
      }
      toast.success('Item deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Clean up numbers
      const payload = { ...formData };
      
      if (activeTab === 'campuses') {
        if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
        if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
        
        if (modalMode === 'add') {
          await dataService.createCampus(payload);
        } else {
          await dataService.updateCampus(editingItem.id, payload);
        }
      } else if (activeTab === 'buildings') {
        if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
        if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
        if (payload.floors) payload.floors = parseInt(payload.floors);
        
        if (modalMode === 'add') {
          await dataService.createBuilding(payload);
        } else {
          await dataService.updateBuilding(editingItem.id, payload);
        }
      } else if (activeTab === 'halls') {
        if (payload.capacity) payload.capacity = parseInt(payload.capacity);
        if (payload.floor) payload.floor = parseInt(payload.floor);
        
        // Handle building payload format expected by backend
        const hallPayload = {
            name: payload.name,
            capacity: payload.capacity,
            available: payload.available,
            floor: payload.floor,
            buildingId: payload.buildingId || payload.building?.id
        };

        if (modalMode === 'add') {
          await dataService.createHall(hallPayload as any);
        } else {
          await dataService.updateHall(editingItem.id, hallPayload as any);
        }
      }
      
      toast.success(`Item ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      closeModal();
      loadData();
    } catch (error) {
      toast.error(`Failed to ${modalMode} item`);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderModalForm = () => {
    if (activeTab === 'campuses') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Institution</label>
            <select 
              value={formData.institutionId || ''} 
              onChange={e => setFormData({...formData, institutionId: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <input type="text" value={formData.region || ''} onChange={e => setFormData({...formData, region: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'buildings') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campus</label>
            <select 
              value={formData.campusId || ''} 
              onChange={e => setFormData({...formData, campusId: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Campus</option>
              {campuses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <input type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Floors</label>
              <input type="number" required min="1" value={formData.floors || 1} onChange={e => setFormData({...formData, floors: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'halls') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Building</label>
            <select 
              value={formData.buildingId || formData.building?.id || ''} 
              onChange={e => setFormData({...formData, buildingId: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Building</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({campuses.find(c => c.id === b.campusId)?.name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input type="number" required min="1" value={formData.capacity || 30} onChange={e => setFormData({...formData, capacity: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Floor</label>
              <input type="number" required min="0" value={formData.floor ?? 1} onChange={e => setFormData({...formData, floor: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input 
              type="checkbox" 
              id="available" 
              checked={formData.available !== false} 
              onChange={e => setFormData({...formData, available: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Is Available
            </label>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facilities Management</h1>
          <p className="text-gray-600">Manage campuses, buildings, and halls</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('campuses')}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'campuses' 
              ? 'border-blue-600 text-blue-600 font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Campuses
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'buildings' 
              ? 'border-blue-600 text-blue-600 font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Buildings
        </button>
        <button
          onClick={() => setActiveTab('halls')}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'halls' 
              ? 'border-blue-600 text-blue-600 font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          Halls
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                  {activeTab === 'campuses' && <th className="p-4 font-semibold text-gray-600 text-sm">Location</th>}
                  {activeTab === 'buildings' && <th className="p-4 font-semibold text-gray-600 text-sm">Campus</th>}
                  {activeTab === 'buildings' && <th className="p-4 font-semibold text-gray-600 text-sm">Floors</th>}
                  {activeTab === 'halls' && <th className="p-4 font-semibold text-gray-600 text-sm">Building</th>}
                  {activeTab === 'halls' && <th className="p-4 font-semibold text-gray-600 text-sm">Capacity</th>}
                  {activeTab === 'halls' && <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>}
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'campuses' && campuses.map(campus => (
                  <tr key={campus.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{campus.name}</td>
                    <td className="p-4 text-gray-600">{[campus.city, campus.region].filter(Boolean).join(', ') || '-'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal('edit', campus)} className="text-blue-600 hover:text-blue-800 p-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(campus.id)} className="text-red-600 hover:text-red-800 p-2 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'buildings' && buildings.map(building => (
                  <tr key={building.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{building.name} {building.code ? `(${building.code})` : ''}</td>
                    <td className="p-4 text-gray-600">{building.campus?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-600">{building.floors}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal('edit', building)} className="text-blue-600 hover:text-blue-800 p-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(building.id)} className="text-red-600 hover:text-red-800 p-2 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'halls' && halls.map(hall => (
                  <tr key={hall.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{hall.name} (Floor {typeof hall.floor === 'object' ? hall.floor.floorNum : hall.floor})</td>
                    <td className="p-4 text-gray-600">{hall.building?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-600">{hall.capacity} seats</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${hall.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {hall.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal('edit', hall)} className="text-blue-600 hover:text-blue-800 p-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(hall.id)} className="text-red-600 hover:text-red-800 p-2 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}

                {/* Empty states */}
                {activeTab === 'campuses' && campuses.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">No campuses found. Create one to get started.</td></tr>
                )}
                {activeTab === 'buildings' && buildings.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No buildings found. Create one to get started.</td></tr>
                )}
                {activeTab === 'halls' && halls.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No halls found. Create one to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {modalMode} {activeTab.slice(0, -1)}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {renderModalForm()}
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {modalMode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

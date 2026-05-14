import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  Navigation,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
} from "lucide-react";
import { dataService, Building, Campus, Hall } from "@/lib/dataService";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const defaultCenter = { lat: 40.7128, lng: -74.006 };

function loadGoogleMapsScript(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is not available"));
    }

    if (window.google?.maps) {
      return resolve();
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export function CampusMapPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingBuilding, setCreatingBuilding] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(false);
  const [creatingCampus, setCreatingCampus] = useState(false);
  const [editingCampus, setEditingCampus] = useState(false);
  const [campusForm, setCampusForm] = useState({
    name: "",
    city: "",
    region: "",
    latitude: "",
    longitude: "",
  });
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    code: "",
    floors: 1,
    latitude: "",
    longitude: "",
  });
  const [hallSearchQuery, setHallSearchQuery] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === selectedCampusId) || campuses[0] || null,
    [campuses, selectedCampusId]
  );

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  );

  const campusBuildings = useMemo(
    () => buildings.filter((building) => building.campusId === selectedCampus?.id),
    [buildings, selectedCampus]
  );

  const buildingHalls = useMemo(
    () =>
      selectedBuilding
        ? halls.filter((hall) => hall.building.id === selectedBuilding.id)
        : [],
    [halls, selectedBuilding]
  );

  const floors = useMemo(
    () => (selectedBuilding ? Array.from({ length: selectedBuilding.floors }, (_, index) => index + 1) : []),
    [selectedBuilding]
  );

  const filteredBuildings = useMemo(
    () =>
      campusBuildings.filter(
        (building) =>
          building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          building.code?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [campusBuildings, searchQuery]
  );

  useEffect(() => {
    if (!selectedCampusId && selectedCampus) {
      setSelectedCampusId(selectedCampus.id);
    }
  }, [selectedCampus, selectedCampusId]);

  useEffect(() => {
    if (!selectedBuilding) {
      setSelectedFloor(1);
    }
  }, [selectedBuilding]);

  useEffect(() => {
    async function loadData() {
      const [campusRes, buildingRes, hallRes] = await Promise.all([
        dataService.getCampuses(),
        dataService.getBuildings(),
        dataService.getHalls(),
      ]);

      if (campusRes.data) {
        setCampuses(campusRes.data);
        if (!selectedCampusId && campusRes.data.length) {
          setSelectedCampusId(campusRes.data[0].id);
        }
      }

      if (buildingRes.data) {
        setBuildings(buildingRes.data);
      }

      if (hallRes.data) {
        setHalls(hallRes.data);
      }
    }

    loadData();
  }, [selectedCampusId]);

  useEffect(() => {
    if (!selectedCampus || !mapRef.current) {
      return;
    }

    async function initMap() {
      if (!GOOGLE_MAPS_API_KEY) {
        setMapError('Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment to enable Google Maps');
        return;
      }

      setMapError(null);
      setMapLoading(true);

      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to initialize');
        }

        const center = {
          lat: selectedCampus.latitude ?? defaultCenter.lat,
          lng: selectedCampus.longitude ?? defaultCenter.lng,
        };

        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
        } else {
          mapInstance.current.setCenter(center);
        }

        markers.current.forEach((marker) => marker.setMap(null));
        markers.current = [];

        campusBuildings.forEach((building) => {
          if (building.latitude && building.longitude) {
            const marker = new window.google.maps.Marker({
              position: { lat: building.latitude, lng: building.longitude },
              map: mapInstance.current,
              title: building.name,
            });

            marker.addListener('click', () => {
              setSelectedBuildingId(building.id);
            });

            markers.current.push(marker);
          }
        });
      } catch (error) {
        setMapError((error as Error).message || 'Unable to load Google Maps');
      } finally {
        setMapLoading(false);
      }
    }

    initMap();

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
  }, [selectedCampus, campusBuildings]);

  const handleCreateCampus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const institutionId = campuses[0]?.institutionId ?? '';
    if (!institutionId) {
      return;
    }

    const result = await dataService.createCampus({
      name: campusForm.name,
      city: campusForm.city,
      region: campusForm.region,
      latitude: campusForm.latitude ? parseFloat(campusForm.latitude) : undefined,
      longitude: campusForm.longitude ? parseFloat(campusForm.longitude) : undefined,
      institutionId,
    });

    if (result.data) {
      setCampuses((current) => [...current, result.data as Campus]);
      setSelectedCampusId(result.data.id);
      setCampusForm({ name: '', city: '', region: '', latitude: '', longitude: '' });
      setCreatingCampus(false);
    }
  };

  const handleUpdateCampus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCampus) {
      return;
    }

    const result = await dataService.updateCampus(selectedCampus.id, {
      name: campusForm.name,
      city: campusForm.city,
      region: campusForm.region,
      latitude: campusForm.latitude ? parseFloat(campusForm.latitude) : undefined,
      longitude: campusForm.longitude ? parseFloat(campusForm.longitude) : undefined,
    });

    if (result.data) {
      setCampuses((current) => current.map((campus) => (campus.id === result.data?.id ? result.data : campus)));
      setEditingCampus(false);
    }
  };

  const handleCreateBuilding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCampus) {
      return;
    }

    const result = await dataService.createBuilding({
      name: buildingForm.name,
      code: buildingForm.code,
      campusId: selectedCampus.id,
      floors: buildingForm.floors,
      latitude: buildingForm.latitude ? parseFloat(buildingForm.latitude) : undefined,
      longitude: buildingForm.longitude ? parseFloat(buildingForm.longitude) : undefined,
    });

    if (result.data) {
      setBuildings((current) => [...current, result.data as Building]);
      setBuildingForm({ name: '', code: '', floors: 1, latitude: '', longitude: '' });
      setCreatingBuilding(false);
    }
  };

  const handleUpdateBuilding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBuilding) {
      return;
    }

    const result = await dataService.updateBuilding(selectedBuilding.id, {
      name: buildingForm.name,
      code: buildingForm.code,
      floors: buildingForm.floors,
      latitude: buildingForm.latitude ? parseFloat(buildingForm.latitude) : undefined,
      longitude: buildingForm.longitude ? parseFloat(buildingForm.longitude) : undefined,
    });

    if (result.data) {
      setBuildings((current) => current.map((building) => (building.id === result.data?.id ? (result.data as Building) : building)));
      setEditingBuilding(false);
      setSelectedBuildingId(result.data.id);
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    await dataService.deleteBuilding(buildingId);
    setBuildings((current) => current.filter((building) => building.id !== buildingId));
    if (selectedBuildingId === buildingId) {
      setSelectedBuildingId(null);
    }
  };

  const prepareCampusEdit = () => {
    if (!selectedCampus) {
      return;
    }

    setCampusForm({
      name: selectedCampus.name,
      city: selectedCampus.city ?? '',
      region: selectedCampus.region ?? '',
      latitude: selectedCampus.latitude?.toString() ?? '',
      longitude: selectedCampus.longitude?.toString() ?? '',
    });
    setEditingCampus(true);
    setCreatingCampus(false);
  };

  const prepareBuildingEdit = () => {
    if (!selectedBuilding) {
      return;
    }

    setBuildingForm({
      name: selectedBuilding.name,
      code: selectedBuilding.code ?? '',
      floors: selectedBuilding.floors,
      latitude: selectedBuilding.latitude?.toString() ?? '',
      longitude: selectedBuilding.longitude?.toString() ?? '',
    });
    setEditingBuilding(true);
    setCreatingBuilding(false);
  };

  const activeFloorHalls = selectedBuilding
    ? buildingHalls.filter((hall) => hall.floor === selectedFloor)
    : [];

  const filteredFloorHalls = useMemo(
    () => activeFloorHalls.filter((hall) =>
      hall.name.toLowerCase().includes(hallSearchQuery.toLowerCase())
    ),
    [activeFloorHalls, hallSearchQuery]
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campus Map</h1>
              <p className="text-gray-600 mt-1">Navigate the campus with real marker locations and floor plans.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {campuses.map((campus) => (
                <button
                  key={campus.id}
                  onClick={() => {
                    setSelectedCampusId(campus.id);
                    setSelectedBuildingId(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCampus?.id === campus.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {campus.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search buildings, halls, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-sm bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Campus Details</h3>
                  <p className="text-sm text-gray-600">Location, building count, and edit controls.</p>
                </div>
                <button
                  onClick={prepareCampusEdit}
                  className="rounded-full border border-blue-200 bg-white p-2 text-blue-600 hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{selectedCampus?.city ?? 'Unknown city'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  <span>{selectedCampus?.region ?? 'Unknown region'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Buildings:</span>
                  <span>{campusBuildings.length}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Buildings</h3>
                  <p className="text-sm text-gray-600">Click a marker or building to inspect it.</p>
                </div>
                <button
                  onClick={() => {
                    setCreatingBuilding((value) => !value);
                    setEditingBuilding(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {creatingBuilding && (
                <form onSubmit={handleCreateBuilding} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      value={buildingForm.name}
                      onChange={(e) => setBuildingForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Code</label>
                    <input
                      type="text"
                      value={buildingForm.code}
                      onChange={(e) => setBuildingForm((prev) => ({ ...prev, code: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Floors</label>
                      <input
                        type="number"
                        min={1}
                        value={buildingForm.floors}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, floors: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Latitude</label>
                      <input
                        type="text"
                        value={buildingForm.latitude}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, latitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Longitude</label>
                    <input
                      type="text"
                      value={buildingForm.longitude}
                      onChange={(e) => setBuildingForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button type="button" onClick={() => setCreatingBuilding(false)} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {editingBuilding && selectedBuilding && (
                <form onSubmit={handleUpdateBuilding} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Building Name</label>
                    <input
                      type="text"
                      value={buildingForm.name}
                      onChange={(e) => setBuildingForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Code</label>
                      <input
                        type="text"
                        value={buildingForm.code}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, code: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Floors</label>
                      <input
                        type="number"
                        min={1}
                        value={buildingForm.floors}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, floors: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Latitude</label>
                      <input
                        type="text"
                        value={buildingForm.latitude}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, latitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Longitude</label>
                      <input
                        type="text"
                        value={buildingForm.longitude}
                        onChange={(e) => setBuildingForm((prev) => ({ ...prev, longitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      <Save className="w-4 h-4" /> Update
                    </button>
                    <button type="button" onClick={() => setEditingBuilding(false)} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {filteredBuildings.map((building) => (
                  <div key={building.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{building.name}</p>
                        <p className="text-sm text-gray-600">{building.code ?? 'No code'}</p>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBuildingId(building.id);
                            setBuildingForm({
                              name: building.name,
                              code: building.code ?? '',
                              floors: building.floors,
                              latitude: building.latitude?.toString() ?? '',
                              longitude: building.longitude?.toString() ?? '',
                            });
                            setEditingBuilding(true);
                            setCreatingBuilding(false);
                          }}
                          className="rounded-full p-2 text-blue-600 hover:bg-blue-100"
                          aria-label="Edit building"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBuilding(building.id)}
                          className="rounded-full p-2 text-red-600 hover:bg-red-100"
                          aria-label="Delete building"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{building.floors} floors, {building.latitude ? building.latitude.toFixed(4) : 'No lat'}, {building.longitude ? building.longitude.toFixed(4) : 'No lng'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Campus Admin</h3>
                  <p className="text-sm text-gray-600">Create and update campus records.</p>
                </div>
                <button
                  onClick={() => {
                    setCreatingCampus((value) => !value);
                    setEditingCampus(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" /> New
                </button>
              </div>

              {creatingCampus && (
                <form onSubmit={handleCreateCampus} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Campus Name</label>
                    <input
                      type="text"
                      value={campusForm.name}
                      onChange={(e) => setCampusForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">City</label>
                      <input
                        type="text"
                        value={campusForm.city}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Region</label>
                      <input
                        type="text"
                        value={campusForm.region}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, region: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Latitude</label>
                      <input
                        type="text"
                        value={campusForm.latitude}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, latitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Longitude</label>
                      <input
                        type="text"
                        value={campusForm.longitude}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, longitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      <Save className="w-4 h-4" /> Save Campus
                    </button>
                    <button type="button" onClick={() => setCreatingCampus(false)} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {editingCampus && selectedCampus && (
                <form onSubmit={handleUpdateCampus} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Campus Name</label>
                    <input
                      type="text"
                      value={campusForm.name}
                      onChange={(e) => setCampusForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">City</label>
                      <input
                        type="text"
                        value={campusForm.city}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Region</label>
                      <input
                        type="text"
                        value={campusForm.region}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, region: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Latitude</label>
                      <input
                        type="text"
                        value={campusForm.latitude}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, latitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Longitude</label>
                      <input
                        type="text"
                        value={campusForm.longitude}
                        onChange={(e) => setCampusForm((prev) => ({ ...prev, longitude: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      <Save className="w-4 h-4" /> Update Campus
                    </button>
                    <button type="button" onClick={() => setEditingCampus(false)} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 overflow-hidden">
          {selectedBuilding ? (
            <div className="h-full flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedBuilding.name}</h3>
                    <p className="text-sm text-gray-500">Floor plan and room layout for the current building.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prepareBuildingEdit}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBuildingId(null);
                        setEditingBuilding(false);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Back to Campus
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                  <div className="rounded-3xl bg-white shadow overflow-hidden">
                    <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-300">Floor plan</p>
                        <h4 className="text-xl font-semibold">Floor {selectedFloor}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {floors.map((floor) => (
                          <button
                            key={floor}
                            type="button"
                            onClick={() => setSelectedFloor(floor)}
                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                              selectedFloor === floor
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-blue-50'
                            }`}
                          >
                            {floor}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="relative h-96 rounded-3xl border border-gray-200 bg-slate-100">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <span className="text-xl font-semibold">{selectedBuilding.code ?? selectedBuilding.name}</span>
                        </div>
                        {activeFloorHalls.map((hall, index) => (
                          <div
                            key={hall.id}
                            className="absolute rounded-2xl border border-blue-200 bg-blue-600/90 text-white p-3 shadow-lg"
                            style={{
                              width: '25%',
                              left: `${8 + (index % 3) * 30}%`,
                              top: `${12 + Math.floor(index / 3) * 28}%`,
                            }}
                          >
                            <p className="text-sm font-semibold">{hall.name}</p>
                            <p className="text-xs text-blue-100">Capacity: {hall.capacity}</p>
                          </div>
                        ))}
                        {activeFloorHalls.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                            No halls currently assigned to this floor.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white shadow p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Current Floor Rooms</h4>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search halls..."
                          value={hallSearchQuery}
                          onChange={(e) => setHallSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredFloorHalls.map((hall) => (
                        <div key={hall.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{hall.name}</p>
                              <p className="text-sm text-gray-500">Floor {hall.floor}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              hall.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {hall.available ? 'Available' : 'In Use'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-gray-600">Capacity: {hall.capacity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden relative">
              <div className="absolute inset-0 z-0">
                <div ref={mapRef} className="h-full" />
              </div>

              {!GOOGLE_MAPS_API_KEY && (
                <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center p-6 text-center text-white">
                  <div>
                    <p className="text-lg font-semibold">Google Maps API key not configured</p>
                    <p className="mt-2 text-sm text-slate-200">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment to enable live map rendering.</p>
                  </div>
                </div>
              )}

              {mapError && (
                <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center p-6 text-center text-white">
                  <p className="text-lg font-semibold">{mapError}</p>
                </div>
              )}

              {mapLoading && (
                <div className="absolute inset-0 z-10 bg-black/20 flex items-center justify-center text-white">
                  Loading map...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

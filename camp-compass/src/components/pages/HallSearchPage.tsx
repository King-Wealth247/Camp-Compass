import { useEffect, useMemo, useState } from "react";
import { Search, Building2, MapPin, Users, Filter } from "lucide-react";
import { dataService, Hall } from "@/lib/dataService";

export function HallSearchPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [minCapacity, setMinCapacity] = useState<string>("");

  useEffect(() => {
    const loadHalls = async () => {
      setIsLoading(true);
      const response = await dataService.getHalls();
      if (response.data) {
        setHalls(response.data);
      }
      setIsLoading(false);
    };

    loadHalls();
  }, []);

  const campusOptions = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    halls.forEach((hall) => {
      const campus = hall.building?.campus;
      if (campus) {
        unique.set(campus.id, campus);
      }
    });
    return Array.from(unique.values());
  }, [halls]);

  const buildingOptions = useMemo(() => {
    const unique = new Map<string, { id: string; name: string; campusId: string }>();
    halls.forEach((hall) => {
      if (hall.building) {
        unique.set(hall.building.id, {
          id: hall.building.id,
          name: hall.building.name,
          campusId: hall.building.campusId,
        });
      }
    });
    return Array.from(unique.values());
  }, [halls]);

  const filteredHalls = halls.filter((hall) => {
    const building = buildingOptions.find((b) => b.id === hall.building.id);
    const campus = hall.building?.campus;
    const hallType = (hall as any).type ?? "General";

    const matchesSearch =
      hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campus?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" || hallType.toLowerCase() === selectedType;

    const matchesCampus =
      selectedCampus === "all" || hall.building.campusId === selectedCampus;

    const matchesCapacity =
      !minCapacity || hall.capacity >= parseInt(minCapacity, 10);

    return matchesSearch && matchesType && matchesCampus && matchesCapacity;
  });

  const getHallBuilding = (hall: Hall) => hall.building;
  const getHallCampus = (hall: Hall) => hall.building?.campus;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hall Search</h1>
        <p className="text-gray-600">Search and filter halls by available rooms</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hall name, building, or campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Campuses</option>
              {campusOptions.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hall Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Types</option>
              <option value="lecture">Lecture Hall</option>
              <option value="laboratory">Laboratory</option>
              <option value="seminar">Seminar Room</option>
              <option value="theatre">Theatre</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Capacity</label>
            <input
              type="number"
              placeholder="e.g., 50"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedType("all");
              setSelectedCampus("all");
              setMinCapacity("");
            }}
            className="mt-7 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredHalls.length}</span>{' '}
          {filteredHalls.length === 1 ? 'hall' : 'halls'} found
        </p>
        {isLoading && <p className="text-sm text-gray-500">Loading halls...</p>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHalls.map((hall) => {
          const building = getHallBuilding(hall);
          const campus = getHallCampus(hall);
          const hallType = (hall as any).type ?? 'General';

          return (
            <div
              key={hall.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">{hall.name}</p>
                    <p className="text-blue-100">{building?.name || 'Building'}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      hall.available
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {hall.available ? 'Available' : 'In Use'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-blue-100">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    Capacity: <strong className="text-white">{hall.capacity}</strong>
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{building?.name}</p>
                      <p className="text-xs text-gray-600">Building</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campus?.name || 'Campus'}</p>
                      <p className="text-xs text-gray-600">Campus</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
                      {hallType}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && filteredHalls.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No halls match your criteria</p>
          <p className="text-sm text-gray-500">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}

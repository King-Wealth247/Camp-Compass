import { useState } from "react";
import { MapPin, Building2, Navigation, Search } from "lucide-react";
import { campuses, buildings, halls } from "@/app/data/mockData";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function CampusMapPage() {
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const campusBuildings = buildings.filter((b) => b.campusId === selectedCampus.id);
  const buildingHalls = selectedBuilding
    ? halls.filter((h) => h.buildingId === selectedBuilding)
    : [];

  const filteredBuildings = campusBuildings.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campus Map</h1>
              <p className="text-gray-600 mt-1">
                Navigate indoor and outdoor campus locations
              </p>
            </div>
            <div className="flex gap-2">
              {campuses.map((campus) => (
                <button
                  key={campus.id}
                  onClick={() => {
                    setSelectedCampus(campus);
                    setSelectedBuilding(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCampus.id === campus.id
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
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Campus Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{selectedCampus.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{selectedCampus.region} Region</span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Buildings</h3>
            <div className="space-y-2">
              {filteredBuildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building.id)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedBuilding === building.id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{building.name}</p>
                      <p className="text-sm text-gray-600">{building.code}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {building.floors} floors
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {selectedBuilding ? (
            <div className="h-full flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {buildings.find((b) => b.id === selectedBuilding)?.name} - Floor Plans
                  </h3>
                  <button
                    onClick={() => setSelectedBuilding(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Back to Campus
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Floor Plan Visualization */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
                      <span className="font-semibold">Ground Floor</span>
                      <span className="text-sm">Interactive Floor Plan</span>
                    </div>
                    <div className="aspect-[16/10] bg-gray-100 relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1757192420329-39acf20a12b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWN0dXJlJTIwaGFsbCUyMGNsYXNzcm9vbSUyMGVtcHR5fGVufDF8fHx8MTc3NDM5MDUzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Floor plan"
                        className="w-full h-full object-cover"
                      />
                      {/* Hall markers */}
                      {buildingHalls.slice(0, 3).map((hall, index) => (
                        <div
                          key={hall.id}
                          className="absolute bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition"
                          style={{
                            left: `${20 + index * 25}%`,
                            top: `${30 + index * 15}%`,
                          }}
                        >
                          <p className="text-sm font-semibold">{hall.code}</p>
                          <p className="text-xs">{hall.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Halls List */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Available Halls
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {buildingHalls.map((hall) => (
                        <div
                          key={hall.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{hall.code}</p>
                              <p className="text-sm text-gray-600">{hall.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              hall.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {hall.available ? "Available" : "In Use"}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600 mt-2">
                            <span>Floor {hall.floor}</span>
                            <span>•</span>
                            <span>Capacity: {hall.capacity}</span>
                            <span>•</span>
                            <span className="capitalize">{hall.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1763098843764-ef3698038adc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzQzOTA1MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Campus aerial view"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{selectedCampus.name}</h2>
                  <p className="text-lg">Select a building to view floor plans</p>
                </div>
              </div>

              {/* Building Markers */}
              {campusBuildings.map((building, index) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building.id)}
                  className="absolute bg-white rounded-lg shadow-xl p-3 hover:bg-blue-50 transition cursor-pointer border-2 border-blue-600"
                  style={{
                    left: `${25 + index * 20}%`,
                    top: `${30 + index * 15}%`,
                  }}
                >
                  <Building2 className="w-6 h-6 text-blue-600 mb-1" />
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {building.code}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/navigation";
import { Home, MapPin } from "lucide-react";

export function NotFound() {
  const navigate = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-6">
          <MapPin className="w-16 h-16 text-blue-600" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Looks like you've ventured off the map. This page doesn't exist in our
          campus system.
        </p>

        <button
          onClick={() => navigate.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Home className="w-5 h-5" />
          Go to Home
        </button>
      </div>
    </div>
  );
}

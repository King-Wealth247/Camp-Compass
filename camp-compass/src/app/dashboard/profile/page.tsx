"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { dataService } from "@/lib/dataService";
import { User as DataServiceUser } from "@/lib/dataService";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<DataServiceUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    level: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) return;
      
      try {
        setLoading(true);
        const response = await dataService.getUser(authUser.id);
        if (response.data) {
          setUser(response.data);
          setFormData({
            name: response.data.name,
            email: response.data.email,
            department: response.data.department || "",
            level: response.data.level || "",
          });
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser || !user) return;

    try {
      setSaving(true);
      setError(null);
      const response = await dataService.updateUser(authUser.id, formData);
      if (response.data) {
        setUser(response.data);
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setFormData({
                name: user?.name || "",
                email: user?.email || "",
                department: user?.department || "",
                level: user?.level || "",
              });
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Read Only */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  User ID
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                  {user?.id}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Role
                </label>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <span className="capitalize font-semibold text-blue-700">{user?.role}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Institution ID
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                  {user?.institutionId}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Member Since
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Tuition Status
                </label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  user?.tuitionPaid
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}>
                  {user?.tuitionPaid ? "✓ Paid" : "Pending"}
                </div>
              </div>
            </div>

            {/* Right Column - Editable */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {user?.name}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {user?.email}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {user?.department || "Not specified"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Level
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g., 200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {user?.level || "Not specified"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setFormData({
                    name: user?.name || "",
                    email: user?.email || "",
                    department: user?.department || "",
                    level: user?.level || "",
                  });
                  setIsEditing(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

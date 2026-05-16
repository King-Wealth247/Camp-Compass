"use client";

import { useEffect, useState } from "react";
import { dataService, User } from "@/lib/dataService";
import { User as UserIcon, Save } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dataService.getCurrentUserProfile().then(res => {
      if (res.data) {
        setUser(res.data);
        setName(res.data.name);
        setPhone(res.data.phone || "");
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await dataService.updateUser(user.id, { name, phone });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-3xl">
        <div className="p-8 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <span className="text-4xl font-bold text-white">{initial}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institutional Email</label>
              <input type="email" value={user.email} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Institutional email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Email (regEmail)</label>
              <input type="email" value={user.regEmail || "Not set"} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1 234 567 890" />
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-8">Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" value={user.department || "Not assigned"} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <input type="text" value={user.level ? `Year ${user.level}` : "Not assigned"} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { dataService, User } from "@/lib/dataService";
import { Users, GraduationCap, Briefcase, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"student" | "staff" | "registrar" | "admin">("student");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await dataService.getUsers();
      if (res.data) {
        setUsers(res.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => u.role === activeTab);

  const tabs = [
    { id: "student", label: "Students", icon: GraduationCap },
    { id: "staff", label: "Staff", icon: Briefcase },
    { id: "registrar", label: "Registrars", icon: Users },
    { id: "admin", label: "Admins", icon: ShieldAlert },
  ] as const;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system users by role</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navbar */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="pb-3 px-4">Name</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Department</th>
                    <th className="pb-3 px-4">Level</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No users found for this role.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-gray-600">{user.department || "-"}</td>
                        <td className="py-3 px-4 text-gray-600">{user.level || "-"}</td>
                        <td className="py-3 px-4">
                          {user.role === "student" ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.tuitionPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.tuitionPaid ? "Paid" : "Unpaid"}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

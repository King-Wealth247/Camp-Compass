"use client";

import { useEffect, useState } from "react";
import { dataService, Notification } from "@/lib/dataService";
import { Inbox, Send, Bell, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "outbox">("inbox");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Outbox form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await dataService.getNotifications();
    if (res.data) setNotifications(res.data);
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await dataService.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and message are required");
    try {
      await dataService.sendBroadcastNotification({ title, message, targetRole });
      toast.success("Broadcast sent!");
      setTitle("");
      setMessage("");
      setTargetRole("all");
    } catch {
      toast.error("Failed to send broadcast");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Manage inbox and broadcast announcements</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {/* Navbar */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "inbox" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Inbox
            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">{unreadCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab("outbox")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "outbox" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Send className="w-4 h-4" />
            Outbox
          </button>
        </div>

        <div className="p-6">
          {activeTab === "inbox" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-xl border flex gap-4 ${n.read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-200'}`}>
                    <div className={`mt-1 ${n.read ? 'text-gray-400' : 'text-blue-600'}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-medium ${n.read ? 'text-gray-800' : 'text-gray-900'}`}>{n.title}</h4>
                        <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-700'}`}>{n.message}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n.id)} title="Mark as read" className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "outbox" && (
            <div className="max-w-2xl mx-auto py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Broadcast Message</h3>
              <form onSubmit={handleBroadcast} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="all">General Broadcast (All Users)</option>
                    <option value="student">Students Only</option>
                    <option value="staff">Staff / Lecturers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. System Maintenance" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Enter your announcement here..." />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <Send className="w-4 h-4" /> Send Broadcast
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { UserPlus, Users, Mail, Key, Search } from "lucide-react";
import { dataService, User } from "@/lib/dataService";

const initialForm = {
  name: "",
  email: "",
  role: "student",
  department: "Computer Science",
  level: "Year 1",
  password: "TempPass123!",
};

export function RegistrarDashboard() {
  const { user } = useAuth();
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const response = await dataService.getUsers();
      if (response.data) {
        setUsers(response.data);
      }
      setLoading(false);
    };

    loadUsers();
  }, []);

  if (!user) return null;

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalStaff = users.filter((u) => u.role === "staff").length;
  const pendingVerification = users.filter((u) => !u.tuitionPaid).length;
  const newThisMonth = users.slice(0, 5).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload: any = {
      name: formState.name,
      email: formState.email,
      role: formState.role,
      department: formState.department,
      level: formState.role === "student" ? formState.level : undefined,
      password: formState.password,
    };

    const response = await dataService.createUser(payload);
    setSubmitting(false);

    if (response.error) {
      setFormError(response.error.error);
      return;
    }

    if (response.data) {
      setUsers((current) => [response.data as User, ...current]);
      setFormState(initialForm);
      setShowNewUserForm(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Dashboard</h1>
        <p className="text-gray-600">User Registration & Management</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
          <p className="text-sm text-gray-600">Staff Members</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
          <p className="text-sm text-gray-600">New This Month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingVerification}</p>
          <p className="text-sm text-gray-600">Pending Verification</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Registration</h2>
              <p className="text-sm text-gray-600 mt-1">Add new students or staff members</p>
            </div>
            <button
              onClick={() => setShowNewUserForm(!showNewUserForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              New User
            </button>
          </div>

          {showNewUserForm ? (
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={formState.role}
                      onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Sciences">Sciences</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level (for students)</label>
                    <select
                      value={formState.level}
                      onChange={(e) => setFormState({ ...formState, level: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Auto-generated Credentials:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Email: {formState.email || 'john.doe@campus.edu'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Password: {formState.password}</span>
                    </div>
                  </div>
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Register User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewUserForm(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Click "New User" to register a user</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Search Users</p>
                <p className="text-sm text-gray-600">Find existing records</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Bulk Import</p>
                <p className="text-sm text-gray-600">Upload CSV file</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email Credentials</p>
                <p className="text-sm text-gray-600">Send login details</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

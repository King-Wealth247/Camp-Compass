"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { UserPlus, Users, Mail, Key, Search } from "lucide-react";
import { dataService, type Institution, type User } from "@/lib/dataService";
import { authService } from "@/lib/authService";
import { toast } from "sonner";

type MemberType = "student" | "staff";

const emptyForm = {
  name: "",
  phone: "",
  institutionId: "",
  department: "Computer Science",
  level: "Year 1",
  courseTaught: "",
  tuitionFullyPaid: true,
};

export function RegistrarDashboard() {
  const { user } = useAuth();
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [memberType, setMemberType] = useState<MemberType>("student");
  const [formState, setFormState] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const response = await dataService.getUsers();
    if (response.data) {
      setUsers(response.data);
    }
    setLoading(false);
  }, []);

  const loadInstitutions = useCallback(async () => {
    setInstitutionsLoading(true);
    const response = await dataService.getInstitutions();
    if (response.data) {
      setInstitutions(response.data);
    } else if (response.error) {
      toast.error(response.error.error || "Could not load institutions");
    }
    setInstitutionsLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (showNewUserForm) {
      void loadInstitutions();
    }
  }, [showNewUserForm, loadInstitutions]);

  if (!user) return null;

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalStaff = users.filter((u) => u.role === "staff").length;
  const pendingVerification = users.filter((u) => !u.tuitionPaid).length;
  const newThisMonth = users.slice(0, 5).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!formState.institutionId) {
      setFormError("Please select an institution.");
      return;
    }

    setSubmitting(true);

    const response =
      memberType === "student"
        ? await authService.registerByRegistrar({
            role: "student",
            name: formState.name,
            phone: formState.phone,
            institutionId: formState.institutionId,
            department: formState.department,
            level: formState.level,
            tuitionFullyPaid: formState.tuitionFullyPaid,
          })
        : await authService.registerByRegistrar({
            role: "staff",
            name: formState.name,
            phone: formState.phone,
            institutionId: formState.institutionId,
            department: formState.department,
            courseTaught: formState.courseTaught,
          });

    setSubmitting(false);

    if (response.error) {
      setFormError(response.error.error);
      return;
    }

    if (response.data) {
      const { email, generatedPassword, name: createdName } = response.data;
      toast.success("User registered", {
        description: `${createdName} — copy login details from this message if needed.`,
        duration: 12_000,
      });
      toast.message("Generated credentials", {
        description: `Email: ${email}\nPassword: ${generatedPassword}`,
        duration: 20_000,
      });
      setUsers((current) => [
        {
          id: response.data!.id,
          email: response.data!.email,
          name: response.data!.name,
          phone: response.data!.phone,
          role: response.data!.role,
          department: response.data!.department ?? undefined,
          level: response.data!.level ?? undefined,
          courseTaught: response.data!.courseTaught,
          tuitionPaid: response.data!.tuitionPaid,
          institutionId: response.data!.institutionId,
          createdAt: response.data!.createdAt,
        },
        ...current,
      ]);
      setFormState(emptyForm);
      setMemberType("student");
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
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : totalStudents}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : totalStaff}</p>
          <p className="text-sm text-gray-600">Staff Members</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : newThisMonth}</p>
          <p className="text-sm text-gray-600">Recent (top 5)</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : pendingVerification}</p>
          <p className="text-sm text-gray-600">Tuition not fully paid</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Registration</h2>
              <p className="text-sm text-gray-600 mt-1">Register students or staff — login details are generated automatically</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewUserForm(!showNewUserForm);
                setFormError(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              New User
            </button>
          </div>

          {showNewUserForm ? (
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Registering as</p>
                  <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50 w-fit">
                    <button
                      type="button"
                      onClick={() => setMemberType("student")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        memberType === "student" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberType("staff")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        memberType === "staff" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Staff
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                    <input
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                    <input
                      required
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="+237 6…"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <select
                      required
                      value={formState.institutionId}
                      onChange={(e) => setFormState({ ...formState, institutionId: e.target.value })}
                      disabled={institutionsLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-60"
                    >
                      <option value="">{institutionsLoading ? "Loading…" : "Select institution"}</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
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

                  {memberType === "student" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
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
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course taught</label>
                      <input
                        required
                        value={formState.courseTaught}
                        onChange={(e) => setFormState({ ...formState, courseTaught: e.target.value })}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g. CS101 — Introduction to Programming"
                      />
                    </div>
                  )}
                </div>

                {memberType === "student" && (
                  <fieldset className="border border-gray-200 rounded-lg p-4">
                    <legend className="text-sm font-medium text-gray-700 px-1">Tuition fees status</legend>
                    <div className="flex flex-wrap gap-6 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tuition"
                          checked={formState.tuitionFullyPaid}
                          onChange={() => setFormState({ ...formState, tuitionFullyPaid: true })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-800">Fully paid</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tuition"
                          checked={!formState.tuitionFullyPaid}
                          onChange={() => setFormState({ ...formState, tuitionFullyPaid: false })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-800">Not fully paid</span>
                      </label>
                    </div>
                  </fieldset>
                )}

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  <p>
                    A unique institutional email and a temporary password are created on submit (format:{" "}
                    <span className="font-mono text-xs">fullname…&lt;n&gt;@institution…edu</span>). Share them securely with the user.
                  </p>
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || institutions.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? "Registering…" : "Register user"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewUserForm(false);
                      setFormError(null);
                    }}
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
                <p className="text-lg">Click &quot;New User&quot; to register a student or staff member</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <button
              type="button"
              className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Search Users</p>
                <p className="text-sm text-gray-600">Find existing records</p>
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Bulk Import</p>
                <p className="text-sm text-gray-600">Upload CSV file</p>
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Credentials</p>
                <p className="text-sm text-gray-600">Shown after each registration</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

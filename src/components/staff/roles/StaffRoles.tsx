import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./staffRoles.css";

export interface LabRole {
  id: string;
  code: string;
  name: string;
  description: string;
  accessTier: "Tier 1 (Full Access)" | "Tier 2 (Clinical & QA)" | "Tier 3 (Operational)" | "Tier 4 (Front Desk)";
  assignedUsersCount: number;
  keyPrivileges: string[];
  status: "Active" | "Inactive";
  isSystemRole: boolean;
}

const INITIAL_ROLES: LabRole[] = [
  {
    id: "ROLE-01",
    code: "ROLE_ADMIN",
    name: "Admin",
    description: "Complete laboratory authority including user management, role assignment, permissions matrix, and financial reporting.",
    accessTier: "Tier 1 (Full Access)",
    assignedUsersCount: 2,
    keyPrivileges: ["All Modules", "User Management", "Assign Roles", "Financial Analysis", "System Audit"],
    status: "Active",
    isSystemRole: true,
  },
  {
    id: "ROLE-02",
    code: "ROLE_RECEPTIONIST",
    name: "Receptionist",
    description: "Patient registration, billing counter invoice creation, collecting cash/UPI payments, and report printing.",
    accessTier: "Tier 4 (Front Desk)",
    assignedUsersCount: 3,
    keyPrivileges: ["New Registration", "Total Billing", "Daily Collections", "Print Test Reports"],
    status: "Active",
    isSystemRole: false,
  },
  {
    id: "ROLE-03",
    code: "ROLE_LAB_TECH",
    name: "Lab Technician",
    description: "Sample accession, vacutainer barcode labeling, analyzer test processing, and entering laboratory findings.",
    accessTier: "Tier 3 (Operational)",
    assignedUsersCount: 6,
    keyPrivileges: ["Sample Collection", "Barcode Tubes", "Enter Test Results", "Verify & Complete Tests"],
    status: "Active",
    isSystemRole: false,
  },
];

export default function StaffRoles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<LabRole[]>(INITIAL_ROLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<LabRole | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    accessTier: "Tier 3 (Operational)" as LabRole["accessTier"],
    keyPrivileges: "",
    status: "Active" as "Active" | "Inactive",
  });

  // KPI Calculations
  const totalRoles = roles.length;
  const totalAssignedStaff = useMemo(
    () => roles.reduce((sum, r) => sum + r.assignedUsersCount, 0),
    [roles]
  );
  const tier1Count = roles.filter((r) => r.accessTier.includes("Tier 1")).length;
  const activeRolesCount = roles.filter((r) => r.status === "Active").length;

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTier = selectedTier === "All" || role.accessTier.includes(selectedTier);

      return matchesSearch && matchesTier;
    });
  }, [roles, searchTerm, selectedTier]);

  // Paginated Roles
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRoles.slice(start, start + rowsPerPage);
  }, [filteredRoles, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormData({
      code: `ROLE_CUSTOM_${roles.length + 1}`,
      name: "",
      description: "",
      accessTier: "Tier 3 (Operational)",
      keyPrivileges: "Sample Tracking, Enter Results",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: LabRole) => {
    setEditingRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description,
      accessTier: role.accessTier,
      keyPrivileges: role.keyPrivileges.join(", "),
      status: role.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedPrivileges = formData.keyPrivileges
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formData.name,
                code: formData.code.toUpperCase(),
                description: formData.description,
                accessTier: formData.accessTier,
                keyPrivileges: parsedPrivileges,
                status: formData.status,
              }
            : r
        )
      );
    } else {
      const newRole: LabRole = {
        id: `ROLE-0${roles.length + 1}`,
        code: formData.code.toUpperCase() || `ROLE_CUSTOM_${Date.now().toString().slice(-4)}`,
        name: formData.name,
        description: formData.description,
        accessTier: formData.accessTier,
        assignedUsersCount: 0,
        keyPrivileges: parsedPrivileges,
        status: formData.status,
        isSystemRole: false,
      };
      setRoles((prev) => [...prev, newRole]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    "Role & Code",
    "Description",
    "Access Tier",
    "Assigned Staff",
    "Core Privileges",
    "Status",
    "Actions",
  ];

  return (
    <div className="staff-roles-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Staff / Users</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Access Roles</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff Roles & Access Tiers
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Define role boundaries, security tiers, and module privilege assignments across clinical workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/staff/permissions")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>Permission Matrix</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Configured Roles
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <SecurityOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalRoles}</p>
          <p className="mt-1 text-xs text-slate-500">{activeRolesCount} active in lab operations</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Assigned Users
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalAssignedStaff}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Mapped to functional roles</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Administrative Tier 1
            </p>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{tier1Count}</p>
          <p className="mt-1 text-xs text-purple-600 font-medium">Full clinical & billing power</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Access Governance
            </p>
            <span className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-teal-700">RBAC Compliant</p>
          <p className="mt-1 text-xs text-slate-500">NABL & ISO audit ready</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role name, code, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-500">Access Tier:</label>
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Tiers</option>
              <option value="Tier 1">Tier 1 (Full Access)</option>
              <option value="Tier 2">Tier 2 (Clinical & QA)</option>
              <option value="Tier 3">Tier 3 (Operational)</option>
              <option value="Tier 4">Tier 4 (Front Desk)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedRoles}
            maxHeight="440px"
            minWidth="1200px"
            emptyMessage="No roles match your search criteria."
            renderRow={(role: LabRole) => {
              let tierColor = "bg-blue-50 text-blue-700 border-blue-200";
              if (role.accessTier.includes("Tier 1")) {
                tierColor = "bg-purple-50 text-purple-700 border-purple-200";
              } else if (role.accessTier.includes("Tier 2")) {
                tierColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (role.accessTier.includes("Tier 4")) {
                tierColor = "bg-amber-50 text-amber-700 border-amber-200";
              }

              return (
                <>
                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <div className="font-semibold text-slate-900 text-sm">{role.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {role.code}
                      </span>
                      {role.isSystemRole && (
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                          System Locked
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-left max-w-sm">
                    <p className="text-xs text-slate-600 line-clamp-2">{role.description}</p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tierColor}`}>
                      {role.accessTier}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <span className="font-bold text-slate-900 text-sm">
                      {role.assignedUsersCount}
                    </span>{" "}
                    <span className="text-xs text-slate-500">active staff</span>
                  </td>

                  <td className="px-4 py-3.5 text-left max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {role.keyPrivileges.map((priv, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {priv}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        role.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {role.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(role)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Edit Role Details"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/staff/permissions")}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        title="Configure Matrix Permissions"
                      >
                        <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </>
              );
            }}
          />
        </div>

        {/* Standard Pagination */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <Pagination
            totalItems={filteredRoles.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Add / Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <SecurityOutlinedIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRole ? "Edit Role Configuration" : "Create New Access Role"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure access tier boundaries and default operational privileges.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assistant Pathologist"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Identifier Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROLE_ASST_PATH"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Access Tier
                  </label>
                  <select
                    value={formData.accessTier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessTier: e.target.value as LabRole["accessTier"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Tier 1 (Full Access)">Tier 1 (Full Access)</option>
                    <option value="Tier 2 (Clinical & QA)">Tier 2 (Clinical & QA)</option>
                    <option value="Tier 3 (Operational)">Tier 3 (Operational)</option>
                    <option value="Tier 4 (Front Desk)">Tier 4 (Front Desk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Core Privileges (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Test Run, Result Verification, Sample Accept"
                  value={formData.keyPrivileges}
                  onChange={(e) => setFormData({ ...formData, keyPrivileges: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize key clinical or operational duties..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

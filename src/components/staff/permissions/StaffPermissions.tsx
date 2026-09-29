import { useState, useMemo } from "react";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./staffPermissions.css";

interface PermissionRow {
  id: string;
  module: string;
  action: string;
  description: string;
  riskLevel: "Critical" | "High" | "Standard" | "Basic";
  roles: {
    admin: boolean;
    receptionist: boolean;
    technician: boolean;
  };
}

// Section 26: Permissions for Primary Roles (Admin, Receptionist, Lab Technician)
const INITIAL_PERMISSIONS: PermissionRow[] = [
  // Patient Management
  {
    id: "PERM-01",
    module: "Patient Records",
    action: "View Patient Directory",
    description: "Access and search patient demographic profiles and test history.",
    riskLevel: "Basic",
    roles: { admin: true, receptionist: true, technician: true },
  },
  {
    id: "PERM-02",
    module: "Patient Records",
    action: "New Patient Registration",
    description: "Register new walk-in and corporate patients with contact details.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: true, technician: false },
  },
  {
    id: "PERM-03",
    module: "Patient Records",
    action: "Edit Patient Demographics",
    description: "Update existing patient medical records, phone numbers, or doctor refs.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: true, technician: false },
  },
  // Accession
  {
    id: "PERM-04",
    module: "Accession & Phlebotomy",
    action: "Sample Collection & Barcoding",
    description: "Collect blood/urine tubes, assign sample barcodes, and print tags.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: false, technician: true },
  },
  {
    id: "PERM-05",
    module: "Accession & Phlebotomy",
    action: "Accept / Reject Specimen",
    description: "Inspect sample volume, hemolyzed/lipemic criteria, and log rejection reasons.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: true },
  },
  // Analysis
  {
    id: "PERM-06",
    module: "Analysis & Testing",
    action: "Enter & Edit Test Findings",
    description: "Input quantitative and qualitative values into lab analyzer worksheets.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: true },
  },
  {
    id: "PERM-07",
    module: "Analysis & Testing",
    action: "Verify & Complete Tests",
    description: "Review automated analyzer results and mark test orders as complete.",
    riskLevel: "Critical",
    roles: { admin: true, receptionist: false, technician: true },
  },
  {
    id: "PERM-08",
    module: "Analysis & Testing",
    action: "Print Patient Test Reports",
    description: "Generate and print validated laboratory test report sheets.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: true, technician: true },
  },
  // Financial Analysis
  {
    id: "PERM-09",
    module: "Financial Analysis",
    action: "View Daily Collections & Cash",
    description: "Monitor counter receipts, shift handovers, and cash drawer reconciliations.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: true, technician: false },
  },
  {
    id: "PERM-10",
    module: "Financial Analysis",
    action: "View Revenue & Billing Reports",
    description: "Access test-wise revenue, monthly trends, and high-value invoices.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: false },
  },
  {
    id: "PERM-11",
    module: "Financial Analysis",
    action: "Approve Billing Discounts",
    description: "Grant institutional discounts, concession waivers, or credit billing.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: false },
  },
  // Expenses
  {
    id: "PERM-12",
    module: "Expenses & Budget",
    action: "View Operational Expenditures",
    description: "Browse reagent purchase vouchers, facility bills, and courier costs.",
    riskLevel: "Standard",
    roles: { admin: true, receptionist: false, technician: false },
  },
  {
    id: "PERM-13",
    module: "Expenses & Budget",
    action: "Create & Approve Expense Vouchers",
    description: "Record new diagnostic kit invoices and sign off vendor payments.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: false },
  },
  // Staff & System
  {
    id: "PERM-14",
    module: "Staff & Administration",
    action: "Manage Staff Profiles",
    description: "Add, edit, activate/deactivate users, and assign roles.",
    riskLevel: "High",
    roles: { admin: true, receptionist: false, technician: false },
  },
  {
    id: "PERM-15",
    module: "Staff & Administration",
    action: "Configure Permissions Matrix",
    description: "Grant or revoke granular system permissions and audit access.",
    riskLevel: "Critical",
    roles: { admin: true, receptionist: false, technician: false },
  },
];

const columns = [
  "Permission Action",
  "Module",
  "Scope Description",
  "Risk Level",
  "Admin",
  "Receptionist",
  "Lab Technician",
];

export default function StaffPermissions() {
  const [permissions, setPermissions] = useState<PermissionRow[]>(INITIAL_PERMISSIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [saveToast, setSaveToast] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered Permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.module.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === "All" || p.module === selectedModule;
      const matchesRisk = selectedRisk === "All" || p.riskLevel === selectedRisk;

      return matchesSearch && matchesModule && matchesRisk;
    });
  }, [permissions, searchTerm, selectedModule, selectedRisk]);

  // Paginated Permissions
  const paginatedPermissions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPermissions.slice(start, start + rowsPerPage);
  }, [filteredPermissions, currentPage, rowsPerPage]);

  const handleTogglePermission = (
    id: string,
    roleKey: keyof PermissionRow["roles"]
  ) => {
    // Admin permissions are locked to preserve system integrity
    if (roleKey === "admin") return;

    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          roles: {
            ...p.roles,
            [roleKey]: !p.roles[roleKey],
          },
        };
      })
    );
  };

  const handleSaveMatrix = () => {
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 4000);
  };

  const handleResetDefaults = () => {
    setPermissions(INITIAL_PERMISSIONS);
  };

  return (
    <div className="staff-permissions-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Staff / Users</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">Section 26 • Role Permissions</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Access Permissions Matrix
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Control module permissions for the 3 primary roles: <strong>Admin</strong>, <strong>Receptionist</strong>, and <strong>Lab Technician</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <LockResetOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveMatrix}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <SaveOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Save Permissions</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm shadow-sm animate-in fade-in">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
          <span className="font-semibold">Permissions updated successfully!</span>
          <span className="text-emerald-700 text-xs">
            Access privileges for Admin, Receptionist, and Lab Technician are synchronized.
          </span>
        </div>
      )}

      {/* 3 Primary Roles Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Admin (Primary)
            </span>
            <span className="rounded bg-purple-200/60 px-2 py-0.5 text-[10px] font-bold text-purple-900">
              Full Access
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700 font-medium">
            Complete platform management, financial audits, user provisioning, and settings.
          </p>
          <div className="mt-2 text-xs text-purple-700 font-bold">15/15 Permissions Enabled</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Receptionist (Primary)
            </span>
            <span className="rounded bg-blue-200/60 px-2 py-0.5 text-[10px] font-bold text-blue-900">
              Front Desk
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700 font-medium">
            Walk-in patient registration, billing invoices, counter collection, and report printing.
          </p>
          <div className="mt-2 text-xs text-blue-700 font-bold">5/15 Permissions Enabled</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Lab Technician (Primary)
            </span>
            <span className="rounded bg-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
              Operations
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700 font-medium">
            Sample accession, tube barcoding, entering test results, and analyzer operation.
          </p>
          <div className="mt-2 text-xs text-emerald-700 font-bold">6/15 Permissions Enabled</div>
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
              placeholder="Search permission by action or module..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Module:</label>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Modules</option>
                <option value="Patient Records">Patient Records</option>
                <option value="Accession & Phlebotomy">Accession & Phlebotomy</option>
                <option value="Analysis & Testing">Analysis & Testing</option>
                <option value="Financial Analysis">Financial Analysis</option>
                <option value="Expenses & Budget">Expenses & Budget</option>
                <option value="Staff & Administration">Staff & Administration</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Risk Level:</label>
              <select
                value={selectedRisk}
                onChange={(e) => {
                  setSelectedRisk(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
                <option value="Basic">Basic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedPermissions}
            maxHeight="440px"
            minWidth="1300px"
            emptyMessage="No permissions match your search or filter criteria."
            renderRow={(perm: PermissionRow) => {
              let riskBadge = "bg-slate-100 text-slate-700";
              if (perm.riskLevel === "Critical") {
                riskBadge = "bg-rose-100 text-rose-700 font-bold";
              } else if (perm.riskLevel === "High") {
                riskBadge = "bg-amber-100 text-amber-700 font-semibold";
              } else if (perm.riskLevel === "Standard") {
                riskBadge = "bg-blue-100 text-blue-700";
              }

              return (
                <>
                  {/* 1. Permission Action */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[220px]">
                    <div className="font-semibold text-slate-900 text-sm">{perm.action}</div>
                  </td>

                  {/* 2. Module */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[180px]">
                    <span className="inline-flex rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      {perm.module}
                    </span>
                  </td>

                  {/* 3. Scope Description */}
                  <td className="px-4 py-3.5 text-left min-w-[340px] max-w-md">
                    <p className="text-xs text-slate-600 leading-relaxed">{perm.description}</p>
                  </td>

                  {/* 4. Risk Level */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[130px]">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${riskBadge}`}>
                      {perm.riskLevel}
                    </span>
                  </td>

                  {/* 5. Admin (Primary) */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[140px]">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <input
                        type="checkbox"
                        checked={perm.roles.admin}
                        disabled
                        className="h-4 w-4 rounded border-slate-300 text-purple-600 cursor-not-allowed opacity-80"
                        title="Admin privileges are mandatory"
                      />
                      <span className="text-[10px] text-slate-400 font-medium">Default Allow</span>
                    </div>
                  </td>

                  {/* 6. Receptionist (Primary) */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[150px]">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <input
                        type="checkbox"
                        checked={perm.roles.receptionist}
                        onChange={() => handleTogglePermission(perm.id, "receptionist")}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-[10px] font-medium ${perm.roles.receptionist ? "text-blue-600" : "text-slate-400"}`}>
                        {perm.roles.receptionist ? "Granted" : "Denied"}
                      </span>
                    </div>
                  </td>

                  {/* 7. Lab Technician (Primary) */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[150px]">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <input
                        type="checkbox"
                        checked={perm.roles.technician}
                        onChange={() => handleTogglePermission(perm.id, "technician")}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-[10px] font-medium ${perm.roles.technician ? "text-emerald-600" : "text-slate-400"}`}>
                        {perm.roles.technician ? "Granted" : "Denied"}
                      </span>
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
            totalItems={filteredPermissions.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

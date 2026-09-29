import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./labSettings.css";

export interface AuditLogItem {
  id: string;
  logCode: string;
  timestamp: string;
  action: string;
  module: string;
  performedBy: string;
  role: string;
  ipAddress: string;
  securityLevel: "Critical" | "Standard" | "Informational";
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "LOG-101",
    logCode: "AUD-2026-092",
    timestamp: "28 Sep 2026, 04:30 PM",
    action: "Updated NABL Accreditation Certificate",
    module: "Compliance & Licensing",
    performedBy: "Dr. Arvind Swamy",
    role: "Admin",
    ipAddress: "192.168.1.10 (Admin PC)",
    securityLevel: "Critical",
    details: "Renewed ISO 15189 license certificate expiration date to 2028.",
  },
  {
    id: "LOG-102",
    logCode: "AUD-2026-091",
    timestamp: "28 Sep 2026, 02:15 PM",
    action: "Analyzer Periodic Calibration Certified",
    module: "Equipment Management",
    performedBy: "Er. Karthik Raja",
    role: "Lab Technician",
    ipAddress: "192.168.1.14 (Bio-Med Workstation)",
    securityLevel: "Standard",
    details: "Roche Cobas c311 chemistry analyzer calibrated with lot #8812.",
  },
  {
    id: "LOG-103",
    logCode: "AUD-2026-090",
    timestamp: "28 Sep 2026, 11:45 AM",
    action: "Emergency TAT Benchmark Adjusted",
    module: "Turnaround Time (TAT)",
    performedBy: "Ms. Uma Maheshwari",
    role: "Admin",
    ipAddress: "192.168.1.12 (QA Terminal)",
    securityLevel: "Standard",
    details: "STAT Troponin I & Cardiac panel target TAT updated to 45 minutes.",
  },
  {
    id: "LOG-104",
    logCode: "AUD-2026-089",
    timestamp: "27 Sep 2026, 05:20 PM",
    action: "Staff Access Permissions Synchronized",
    module: "Staff / User Management",
    performedBy: "Dr. Arvind Swamy",
    role: "Admin",
    ipAddress: "192.168.1.10 (Admin PC)",
    securityLevel: "Critical",
    details: "Aligned access matrix strictly to primary roles: Admin, Receptionist, Lab Technician.",
  },
  {
    id: "LOG-105",
    logCode: "AUD-2026-088",
    timestamp: "27 Sep 2026, 01:10 PM",
    action: "Cold Room Temperature Policy Logged",
    module: "Storage & Cold Chain",
    performedBy: "Ms. Priya Dharshini",
    role: "Lab Technician",
    ipAddress: "192.168.1.18 (Microbiology PC)",
    securityLevel: "Informational",
    details: "Daily refrigerator temperature logs (+4.2°C) verified and signed off.",
  },
  {
    id: "LOG-106",
    logCode: "AUD-2026-087",
    timestamp: "26 Sep 2026, 09:30 AM",
    action: "New Department Registered (Immunology)",
    module: "Departments",
    performedBy: "Ms. Uma Maheshwari",
    role: "Admin",
    ipAddress: "192.168.1.12 (QA Terminal)",
    securityLevel: "Standard",
    details: "Created DEPT-IMM for chemiluminescence hormone assays and vitamin profiling.",
  },
  {
    id: "LOG-107",
    logCode: "AUD-2026-086",
    timestamp: "25 Sep 2026, 06:00 PM",
    action: "Automated Daily Database Cloud Backup",
    module: "System Maintenance",
    performedBy: "System Daemon (Automated)",
    role: "System Service",
    ipAddress: "127.0.0.1 (Localhost Engine)",
    securityLevel: "Standard",
    details: "Encrypted snapshot of LIS database generated and uploaded to secure cloud storage.",
  },
  {
    id: "LOG-108",
    logCode: "AUD-2026-085",
    timestamp: "25 Sep 2026, 03:40 PM",
    action: "Specimen Retention Period Policy Configured",
    module: "Sample Storage",
    performedBy: "Dr. Arvind Swamy",
    role: "Admin",
    ipAddress: "192.168.1.10 (Admin PC)",
    securityLevel: "Standard",
    details: "Serum sample post-testing retention period locked to 7 days at +2°C to +8°C.",
  },
];

export default function LabSettings() {
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"general" | "functions" | "audit">("general");

  // Save Banner
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State: Lab Profile & Accreditation
  const [profileData, setProfileData] = useState({
    labName: "Lax360 Clinical Laboratory & Diagnostic Services",
    licenseNo: "TN/MED/LAB-99201/2026",
    nablCertNo: "NABL-MC-44819 (ISO 15189:2022)",
    icmrId: "ICMR-TN-CH-048",
    directorName: "Dr. Arvind Swamy, MBBS, MD (Clinical Pathology)",
    phone: "+91 44 2841 9900",
    emergencyMobile: "+91 98401 22334",
    email: "laboratory.incharge@lax360lab.com",
    address: "Plot 42, Healthcare Avenue, Guindy Institutional Area, Chennai - 600032, Tamil Nadu",
    website: "https://www.lax360lab.com",
  });

  // Form State: Basic Management Functions
  const [mgmtSettings, setMgmtSettings] = useState({
    weekdayHours: "07:00 AM - 09:00 PM",
    sundayHours: "07:00 AM - 02:00 PM",
    emergency247Service: true,
    routineTatMinutes: 120,
    emergencyTatMinutes: 45,
    sampleRetentionSerumDays: 7,
    sampleRetentionEdtaHours: 48,
    sampleRetentionUrineHours: 24,
    coldStorageMinTemp: 2,
    coldStorageMaxTemp: 8,
    deepFreezerTemp: -20,
    autoSmsAlerts: true,
    autoWhatsAppReports: true,
    dailyBackupSchedule: "Every day at 02:00 AM",
  });

  // Audit Logs State
  const [auditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.logCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === "All" || log.module === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [auditLogs, searchTerm, selectedModule]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleExportAuditCSV = () => {
    const headers = "Log Code,Timestamp,Administrative Action,Module,Performed By,Role,IP Address,Security Level,Details\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.logCode}","${l.timestamp}","${l.action}","${l.module}","${l.performedBy}","${l.role}","${l.ipAddress}","${l.securityLevel}","${l.details}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laboratory-management-audit-logs.csv";
    a.click();
  };

  const auditColumns = [
    "Log Code & Timestamp",
    "Administrative Action",
    "Module / Section",
    "Performed By",
    "Security Tier",
    "Workstation IP",
    "Audit Details",
  ];

  return (
    <div className="lab-settings-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Lab Management</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Lab Settings & Governance</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Lab Settings & Basic Functions
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Configure laboratory accreditation, operating hours, sample retention limits, and management policies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <SaveOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Save All Configurations</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm shadow-sm animate-in fade-in">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
          <span className="font-semibold">Lab configuration saved successfully!</span>
          <span className="text-emerald-700 text-xs">
            Accreditation parameters, management functions, and operational limits have been updated.
          </span>
        </div>
      )}

      {/* Cross-Link Card: Staff / User Management Module */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm">
              <GroupsOutlinedIcon sx={{ fontSize: 24 }} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-800">
                  Section 26 Compliance
                </span>
                <span className="text-xs text-slate-500">• 3 Primary Roles: Admin, Receptionist, Lab Technician</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">Staff / User Management Module</h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Manage registered medical personnel, assign roles, enforce password policies, and customize the 15-action granular permissions matrix.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/staff/users")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <span>User Directory</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/staff/roles")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <span>Primary Roles</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/staff/permissions")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <span>Permissions Matrix</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "general"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Lab Profile & Accreditation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("functions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "functions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Basic Management Functions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Administrative Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: General Lab Profile & Accreditation */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Laboratory Identification & Legal Accreditation</h2>
              <p className="text-xs text-slate-500">
                Official clinical registry numbers printed on all patient diagnostic reports.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratory Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.labName}
                  onChange={(e) => setProfileData({ ...profileData, labName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Director / Chief Pathologist
                </label>
                <input
                  type="text"
                  value={profileData.directorName}
                  onChange={(e) => setProfileData({ ...profileData, directorName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Establishment License
                </label>
                <input
                  type="text"
                  value={profileData.licenseNo}
                  onChange={(e) => setProfileData({ ...profileData, licenseNo: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NABL Certificate No (ISO 15189)
                </label>
                <input
                  type="text"
                  value={profileData.nablCertNo}
                  onChange={(e) => setProfileData({ ...profileData, nablCertNo: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ICMR Registration ID
                </label>
                <input
                  type="text"
                  value={profileData.icmrId}
                  onChange={(e) => setProfileData({ ...profileData, icmrId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Central Helpdesk Line
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Lab Mobile
                </label>
                <input
                  type="text"
                  value={profileData.emergencyMobile}
                  onChange={(e) => setProfileData({ ...profileData, emergencyMobile: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Dispatch Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory Physical Address (Printed on Invoices & Test Slips)
              </label>
              <textarea
                rows={2}
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow transition"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Basic Management Functions */}
      {activeTab === "functions" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Operating Hours & Emergency Shifting */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Operating Hours & Emergency Counter Shifting</h2>
                <p className="text-xs text-slate-500">
                  Control routine collection timings and 24/7 urgent testing dispatch.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-247"
                  checked={mgmtSettings.emergency247Service}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, emergency247Service: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="toggle-247" className="text-xs font-bold text-slate-800 cursor-pointer">
                  24/7 Emergency Services Enabled
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weekday Routine Hours (Mon - Sat)
                </label>
                <input
                  type="text"
                  value={mgmtSettings.weekdayHours}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, weekdayHours: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sunday & Public Holiday Hours
                </label>
                <input
                  type="text"
                  value={mgmtSettings.sundayHours}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, sundayHours: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Turnaround Time (TAT) Benchmarks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Turnaround Time (TAT) Benchmarks & Auto Alerts</h2>
              <p className="text-xs text-slate-500">
                Automatic overdue notifications trigger when sample verification exceeds these threshold targets.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Routine Test Target TAT (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={mgmtSettings.routineTatMinutes}
                    onChange={(e) =>
                      setMgmtSettings({ ...mgmtSettings, routineTatMinutes: Number(e.target.value) })
                    }
                    className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    = {(mgmtSettings.routineTatMinutes / 60).toFixed(1)} Hours
                  </span>
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                <label className="block text-xs font-bold text-rose-800 mb-1">
                  Emergency / STAT Target TAT (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={mgmtSettings.emergencyTatMinutes}
                    onChange={(e) =>
                      setMgmtSettings({ ...mgmtSettings, emergencyTatMinutes: Number(e.target.value) })
                    }
                    className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-rose-900 focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-xs text-rose-600 font-medium">Critical urgent threshold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Storage & Cold Chain Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Specimen Retention & Storage Temperature Limits</h2>
              <p className="text-xs text-slate-500">
                Mandatory retention periods for re-testing requests and medical dispute audit compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serum / Plasma Retention (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={mgmtSettings.sampleRetentionSerumDays}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, sampleRetentionSerumDays: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Whole Blood EDTA (Hours)
                </label>
                <input
                  type="number"
                  min="6"
                  value={mgmtSettings.sampleRetentionEdtaHours}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, sampleRetentionEdtaHours: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urine Specimen Retention (Hours)
                </label>
                <input
                  type="number"
                  min="2"
                  value={mgmtSettings.sampleRetentionUrineHours}
                  onChange={(e) =>
                    setMgmtSettings({ ...mgmtSettings, sampleRetentionUrineHours: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Cold Storage Refrigerator Target</span>
                  <span className="text-[11px] text-blue-700">Validated range: +2.0°C to +8.0°C</span>
                </div>
                <span className="rounded bg-blue-200/80 px-2 py-1 text-xs font-bold text-blue-900">Compliant</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 block">Deep Freezer Bio-Archive</span>
                  <span className="text-[11px] text-purple-700">Frozen serum library: -20°C</span>
                </div>
                <span className="rounded bg-purple-200/80 px-2 py-1 text-xs font-bold text-purple-900">Compliant</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow transition"
              >
                Save Management Functions
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Administrative Audit Trail */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search action, log code, user..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Modules</option>
                    <option value="Compliance & Licensing">Compliance & Licensing</option>
                    <option value="Equipment Management">Equipment Management</option>
                    <option value="Turnaround Time (TAT)">Turnaround Time (TAT)</option>
                    <option value="Staff / User Management">Staff / User Management</option>
                    <option value="Sample Storage">Sample Storage</option>
                    <option value="Departments">Departments</option>
                    <option value="System Maintenance">System Maintenance</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportAuditCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>Export Audit CSV</span>
                </button>
              </div>
            </div>

            {/* Table View */}
            <div className="w-full overflow-x-auto">
              <Table
                columns={auditColumns}
                data={paginatedLogs}
                maxHeight="440px"
                minWidth="1300px"
                emptyMessage="No audit logs match your search criteria."
                renderRow={(log: AuditLogItem) => {
                  let tierBadge = "bg-blue-100 text-blue-700";
                  if (log.securityLevel === "Critical") {
                    tierBadge = "bg-rose-100 text-rose-700 font-bold";
                  } else if (log.securityLevel === "Informational") {
                    tierBadge = "bg-slate-100 text-slate-700";
                  }

                  return (
                    <>
                      {/* 1. Log Code & Timestamp */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[200px]">
                        <div className="font-mono text-xs font-bold text-blue-600">{log.logCode}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{log.timestamp}</div>
                      </td>

                      {/* 2. Action */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[240px]">
                        <div className="font-semibold text-slate-900 text-sm">{log.action}</div>
                      </td>

                      {/* 3. Module */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[190px]">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {log.module}
                        </span>
                      </td>

                      {/* 4. Performed By */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[170px]">
                        <div className="font-semibold text-xs text-slate-800">{log.performedBy}</div>
                        <div className="text-[10px] text-slate-400">{log.role}</div>
                      </td>

                      {/* 5. Security Tier */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[130px]">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs ${tierBadge}`}>
                          {log.securityLevel}
                        </span>
                      </td>

                      {/* 6. Workstation IP */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[170px]">
                        <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {log.ipAddress}
                        </span>
                      </td>

                      {/* 7. Audit Details */}
                      <td className="px-4 py-3.5 text-left min-w-[280px]">
                        <p className="text-xs text-slate-600">{log.details}</p>
                      </td>
                    </>
                  );
                }}
              />
            </div>

            {/* Standard Pagination */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
              <Pagination
                totalItems={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

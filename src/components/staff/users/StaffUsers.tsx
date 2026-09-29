import { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./staffUsers.css";

// Section 26: Primary Roles strictly Admin, Receptionist, Lab Technician
export type PrimaryStaffRole = "Admin" | "Receptionist" | "Lab Technician";

export interface StaffMember {
  id: string;
  staffCode: string;
  name: string;
  email: string;
  phone: string;
  role: PrimaryStaffRole;
  department: string;
  shift: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  lastLogin: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "STAFF-001",
    staffCode: "EMP-1001",
    name: "Dr. Arvind Swamy",
    email: "arvind.swamy@labcare.med",
    phone: "+91 98401 22334",
    role: "Admin",
    department: "Clinical Administration",
    shift: "Morning (08:00 - 16:00)",
    status: "Active",
    joinedDate: "12 Jan 2022",
    lastLogin: "Today, 08:30 AM",
  },
  {
    id: "STAFF-002",
    staffCode: "EMP-1002",
    name: "Ms. Uma Maheshwari",
    email: "uma.m@labcare.med",
    phone: "+91 98404 55667",
    role: "Admin",
    department: "Lab Operations & Quality",
    shift: "General (09:00 - 17:00)",
    status: "Active",
    joinedDate: "10 Feb 2023",
    lastLogin: "Today, 07:45 AM",
  },
  {
    id: "STAFF-003",
    staffCode: "EMP-1003",
    name: "Mr. Ramesh K.",
    email: "ramesh.k@labcare.med",
    phone: "+91 98405 66778",
    role: "Lab Technician",
    department: "Hematology",
    shift: "Morning (07:00 - 15:00)",
    status: "Active",
    joinedDate: "01 Jun 2023",
    lastLogin: "Today, 06:55 AM",
  },
  {
    id: "STAFF-004",
    staffCode: "EMP-1004",
    name: "Ms. Priya Dharshini",
    email: "priya.d@labcare.med",
    phone: "+91 98406 77889",
    role: "Lab Technician",
    department: "Microbiology",
    shift: "Evening (14:00 - 22:00)",
    status: "Active",
    joinedDate: "15 Sep 2023",
    lastLogin: "Yesterday, 02:00 PM",
  },
  {
    id: "STAFF-005",
    staffCode: "EMP-1005",
    name: "Mr. Suresh Babu",
    email: "suresh.babu@labcare.med",
    phone: "+91 98407 88990",
    role: "Lab Technician",
    department: "Clinical Accession",
    shift: "Early Morning (06:00 - 14:00)",
    status: "Active",
    joinedDate: "20 Nov 2023",
    lastLogin: "Today, 06:10 AM",
  },
  {
    id: "STAFF-006",
    staffCode: "EMP-1006",
    name: "Dr. Meenakshi Sundaram",
    email: "meenakshi.s@labcare.med",
    phone: "+91 98402 33445",
    role: "Lab Technician",
    department: "Biochemistry",
    shift: "General (09:00 - 17:00)",
    status: "Active",
    joinedDate: "05 Mar 2022",
    lastLogin: "Today, 09:05 AM",
  },
  {
    id: "STAFF-007",
    staffCode: "EMP-1007",
    name: "Er. Karthik Raja",
    email: "karthik.raja@labcare.med",
    phone: "+91 98403 44556",
    role: "Lab Technician",
    department: "Equipment & Quality",
    shift: "General (09:00 - 17:00)",
    status: "Active",
    joinedDate: "18 Aug 2022",
    lastLogin: "Today, 09:12 AM",
  },
  {
    id: "STAFF-008",
    staffCode: "EMP-1008",
    name: "Ms. Deepa Raman",
    email: "deepa.r@labcare.med",
    phone: "+91 98408 99001",
    role: "Receptionist",
    department: "Front Desk & Billing",
    shift: "Morning (07:00 - 15:00)",
    status: "Active",
    joinedDate: "05 Jan 2024",
    lastLogin: "Today, 07:02 AM",
  },
  {
    id: "STAFF-009",
    staffCode: "EMP-1009",
    name: "Mr. Vigneshwaran S.",
    email: "vignesh.s@labcare.med",
    phone: "+91 98409 00112",
    role: "Receptionist",
    department: "Front Desk & Registration",
    shift: "Morning (07:00 - 15:00)",
    status: "Inactive",
    joinedDate: "12 Mar 2024",
    lastLogin: "24 Sep 2026, 02:30 PM",
  },
  {
    id: "STAFF-010",
    staffCode: "EMP-1010",
    name: "Mr. Deepak S.",
    email: "deepak.it@labcare.med",
    phone: "+91 98410 11223",
    role: "Receptionist",
    department: "Front Desk & Inquiries",
    shift: "General (09:00 - 17:00)",
    status: "Active",
    joinedDate: "02 May 2024",
    lastLogin: "Today, 08:50 AM",
  },
];

export default function StaffUsers() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    staffCode: "",
    name: "",
    email: "",
    phone: "",
    role: "Lab Technician" as PrimaryStaffRole,
    department: "Hematology",
    shift: "Morning (07:00 - 15:00)",
    status: "Active" as "Active" | "Inactive",
  });

  // KPI Calculations
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === "Active").length;
  const techniciansCount = staffList.filter((s) => s.role === "Lab Technician").length;
  const receptionistsAdminsCount = staffList.filter((s) => s.role === "Receptionist" || s.role === "Admin").length;

  // Filtered List
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm);

      const matchesRole = selectedRole === "All" || s.role === selectedRole;
      const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
      const matchesStatus = selectedStatus === "All" || s.status === selectedStatus;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [staffList, searchTerm, selectedRole, selectedDepartment, selectedStatus]);

  // Paginated List
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredStaff.slice(start, start + rowsPerPage);
  }, [filteredStaff, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      staffCode: `EMP-${Math.floor(1011 + staffList.length)}`,
      name: "",
      email: "",
      phone: "+91 ",
      role: "Lab Technician",
      department: "Hematology",
      shift: "Morning (07:00 - 15:00)",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      staffCode: staff.staffCode,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      shift: staff.shift,
      status: staff.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                staffCode: formData.staffCode,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                department: formData.department,
                shift: formData.shift,
                status: formData.status,
              }
            : s
        )
      );
    } else {
      const newStaff: StaffMember = {
        id: `STAFF-0${staffList.length + 1}`,
        staffCode: formData.staffCode || `EMP-${1000 + staffList.length + 1}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        shift: formData.shift,
        status: formData.status,
        joinedDate: "Today",
        lastLogin: "Never logged in",
      };
      setStaffList((prev) => [newStaff, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === "Active" ? "Inactive" : "Active";
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "Staff ID,Name,Role,Department,Email,Phone,Shift,Status,Joined Date\n";
    const rows = filteredStaff
      .map(
        (s) =>
          `"${s.staffCode}","${s.name}","${s.role}","${s.department}","${s.email}","${s.phone}","${s.shift}","${s.status}","${s.joinedDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laboratory-staff-directory.csv";
    a.click();
  };

  const columns = [
    "Staff Member",
    "Role & Title",
    "Department",
    "Contact & Email",
    "Duty Shift",
    "Status",
    "Last Login",
    "Actions",
  ];

  return (
    <div className="staff-users-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Staff / Users</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">User Directory</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff & Laboratory Users
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Manage clinical pathologists, medical technicians, phlebotomists, and desk operators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Export Directory</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Enrolled Staff
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStaff}</p>
          <p className="mt-1 text-xs text-slate-500">Registered across all departments</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active & On-Duty
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeStaff}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Ready for duty & operations</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lab Technicians
            </p>
            <span className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <MedicalServicesOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{techniciansCount}</p>
          <p className="mt-1 text-xs text-teal-600 font-medium">Sample accession & analyzers</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admins & Receptionists
            </p>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{receptionistsAdminsCount}</p>
          <p className="mt-1 text-xs text-purple-600 font-medium">Governance & patient billing</p>
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
              placeholder="Search by name, code, email, phone..."
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
              <label className="text-xs font-medium text-slate-500">Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Roles (3 Primary)</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Lab Technician">Lab Technician</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Department:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                <option value="Clinical Administration">Clinical Administration</option>
                <option value="Lab Operations & Quality">Lab Operations & Quality</option>
                <option value="Hematology">Hematology</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Phlebotomy & Accession">Phlebotomy & Accession</option>
                <option value="Equipment & Quality">Equipment & Quality</option>
                <option value="Front Desk & Billing">Front Desk & Billing</option>
                <option value="Front Desk & Registration">Front Desk & Registration</option>
                <option value="Front Desk & Inquiries">Front Desk & Inquiries</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedStaff}
            maxHeight="440px"
            minWidth="1200px"
            emptyMessage="No staff members match the selected search or filter criteria."
            renderRow={(staff: StaffMember) => {
              const statusBadge =
                staff.status === "Active"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300";

              return (
                <>
                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{staff.name}</div>
                        <div className="font-mono text-xs text-blue-600">{staff.staffCode}</div>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <div className="font-medium text-slate-800 text-sm">{staff.role}</div>
                    <div className="text-xs text-slate-400">Joined {staff.joinedDate}</div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {staff.department}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <div className="text-xs font-medium text-slate-800">{staff.email}</div>
                    <div className="text-xs text-slate-400">{staff.phone}</div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                    {staff.shift}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(staff.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${statusBadge}`}
                      title={`Click to ${staff.status === "Active" ? "deactivate" : "activate"} user`}
                    >
                      {staff.status}
                    </button>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-500 font-mono">
                    {staff.lastLogin}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(staff)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit User & Assign Role"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`rounded-lg p-1.5 transition ${
                          staff.status === "Active"
                            ? "text-rose-500 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={staff.status === "Active" ? "Deactivate User" : "Activate User"}
                      >
                        <PowerSettingsNewOutlinedIcon sx={{ fontSize: 18 }} />
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
            totalItems={filteredStaff.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
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
                <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStaff ? "Edit Staff Details" : "Enroll New Staff Member"}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign role, department, shift timings, and contact information.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Code / Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1015"
                    value={formData.staffCode}
                    onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.k@labcare.med"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98400 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Primary Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as PrimaryStaffRole })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Lab Technician">Lab Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Clinical Administration">Clinical Administration</option>
                    <option value="Lab Operations & Quality">Lab Operations & Quality</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Phlebotomy & Accession">Phlebotomy & Accession</option>
                    <option value="Equipment & Quality">Equipment & Quality</option>
                    <option value="Front Desk & Billing">Front Desk & Billing</option>
                    <option value="Front Desk & Registration">Front Desk & Registration</option>
                    <option value="Front Desk & Inquiries">Front Desk & Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duty Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                    <option value="General (09:00 - 17:00)">General (09:00 - 17:00)</option>
                    <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                    <option value="Night (21:00 - 07:00)">Night (21:00 - 07:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {editingStaff ? "Save Changes" : "Enroll Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

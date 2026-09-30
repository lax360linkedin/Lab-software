import { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./departments.css";

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  headOfDept: string;
  location: string;
  intercom: string;
  shift: "24/7 Round-the-clock" | "Morning (07:00 - 15:00)" | "General (09:00 - 17:00)" | "Evening (14:00 - 22:00)";
  equipmentCount: number;
  activeStaffCount: number;
  tatBenchmark: string;
  status: "Active" | "Under Maintenance" | "Inactive";
  description: string;
}

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "DEPT-01",
    code: "DEPT-BIO",
    name: "Clinical Biochemistry",
    headOfDept: "Dr. Meenakshi Sundaram",
    location: "Block A, 1st Floor, Room 102",
    intercom: "Ext: 102",
    shift: "24/7 Round-the-clock",
    equipmentCount: 6,
    activeStaffCount: 4,
    tatBenchmark: "2 - 3 Hours",
    status: "Active",
    description: "Automated chemistry analyzers, liver function panels, lipid profiles, HbA1c, and serum electrolytes.",
  },
  {
    id: "DEPT-02",
    code: "DEPT-HEM",
    name: "Hematology & Coagulation",
    headOfDept: "Mr. Ramesh K.",
    location: "Block A, 1st Floor, Room 104",
    intercom: "Ext: 104",
    shift: "24/7 Round-the-clock",
    equipmentCount: 5,
    activeStaffCount: 3,
    tatBenchmark: "1 - 2 Hours",
    status: "Active",
    description: "Complete blood counts (CBC), peripheral blood smears, ESR, coagulation studies, and blood grouping.",
  },
  {
    id: "DEPT-03",
    code: "DEPT-MIC",
    name: "Microbiology & Serology",
    headOfDept: "Ms. Priya Dharshini",
    location: "Block B, 2nd Floor, Room 201",
    intercom: "Ext: 201",
    shift: "General (09:00 - 17:00)",
    equipmentCount: 4,
    activeStaffCount: 2,
    tatBenchmark: "24 - 48 Hours",
    status: "Active",
    description: "Bacterial culture, antibiotic susceptibility testing (AST), fungal stains, ELISA, and rapid serological assays.",
  },
  {
    id: "DEPT-04",
    code: "DEPT-PAT",
    name: "Clinical Pathology & Urine Routine",
    headOfDept: "Dr. Arvind Swamy",
    location: "Block A, Ground Floor, Room 008",
    intercom: "Ext: 108",
    shift: "Morning (07:00 - 15:00)",
    equipmentCount: 3,
    activeStaffCount: 2,
    tatBenchmark: "1 Hour",
    status: "Active",
    description: "Urine complete analysis, automated urine sediment analyzer, stool routine, and body fluid examinations.",
  },
  {
    id: "DEPT-05",
    code: "DEPT-IMM",
    name: "Immunology & Hormones",
    headOfDept: "Dr. Arvind Swamy",
    location: "Block A, 1st Floor, Room 106",
    intercom: "Ext: 106",
    shift: "General (09:00 - 17:00)",
    equipmentCount: 4,
    activeStaffCount: 3,
    tatBenchmark: "3 - 4 Hours",
    status: "Active",
    description: "Chemiluminescence immunoassays (CLIA), thyroid hormones, vitamin levels, tumor markers, and fertility panel.",
  },
  {
    id: "DEPT-06",
    code: "DEPT-ACC",
    name: "Accession & Central Phlebotomy",
    headOfDept: "Mr. Suresh Babu",
    location: "Main Reception Hall, Counter 1-4",
    intercom: "Ext: 101",
    shift: "24/7 Round-the-clock",
    equipmentCount: 3,
    activeStaffCount: 5,
    tatBenchmark: "Immediate / 15 Mins",
    status: "Active",
    description: "Patient specimen collection, vacutainer barcode labeling, centrifuge sample separation, and dispatch.",
  },
  {
    id: "DEPT-07",
    code: "DEPT-QA",
    name: "Quality Assurance & Bio-Medical",
    headOfDept: "Er. Karthik Raja",
    location: "Block B, Ground Floor, Room 004",
    intercom: "Ext: 110",
    shift: "General (09:00 - 17:00)",
    equipmentCount: 1,
    activeStaffCount: 2,
    tatBenchmark: "N/A (Compliance)",
    status: "Active",
    description: "NABL & ISO 15189 compliance monitoring, daily IQC verification, analyzer calibration, and AMC contracts.",
  },
  {
    id: "DEPT-08",
    code: "DEPT-HIS",
    name: "Histopathology & Cytology",
    headOfDept: "Dr. Arvind Swamy",
    location: "Block B, 2nd Floor, Room 205",
    intercom: "Ext: 205",
    shift: "Morning (07:00 - 15:00)",
    equipmentCount: 3,
    activeStaffCount: 2,
    tatBenchmark: "48 - 72 Hours",
    status: "Under Maintenance",
    description: "Biopsy tissue processing, microtome sectioning, H&E staining, FNAC, and PAP smear cytology examinations.",
  },
];

export default function Departments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedShift, setSelectedShift] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleDeleteDept = (id: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [viewingDept, setViewingDept] = useState<DepartmentItem | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    headOfDept: "",
    location: "",
    intercom: "",
    shift: "24/7 Round-the-clock" as DepartmentItem["shift"],
    equipmentCount: 2,
    activeStaffCount: 2,
    tatBenchmark: "2 - 3 Hours",
    status: "Active" as DepartmentItem["status"],
    description: "",
  });

  // KPI Calculations
  const totalDepartments = departments.length;
  const emergency247Count = departments.filter((d) => d.shift.includes("24/7")).length;
  const totalAttachedAnalyzers = departments.reduce((acc, d) => acc + d.equipmentCount, 0);
  const totalStaffAllocated = departments.reduce((acc, d) => acc + d.activeStaffCount, 0);

  // Filtered List
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "All" || dept.status === selectedStatus;
      const matchesShift = selectedShift === "All" || dept.shift.includes(selectedShift);

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [departments, searchTerm, selectedStatus, selectedShift]);

  // Paginated List
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredDepartments.slice(start, start + rowsPerPage);
  }, [filteredDepartments, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      code: `DEPT-${Math.floor(10 + departments.length + 1)}`,
      name: "",
      headOfDept: "Dr. Arvind Swamy",
      location: "Block A, 1st Floor",
      intercom: `Ext: ${100 + departments.length + 1}`,
      shift: "General (09:00 - 17:00)",
      equipmentCount: 2,
      activeStaffCount: 2,
      tatBenchmark: "2 - 3 Hours",
      status: "Active",
      description: "",
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      headOfDept: dept.headOfDept,
      location: dept.location,
      intercom: dept.intercom,
      shift: dept.shift,
      equipmentCount: dept.equipmentCount,
      activeStaffCount: dept.activeStaffCount,
      tatBenchmark: dept.tatBenchmark,
      status: dept.status,
      description: dept.description,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                code: formData.code,
                name: formData.name,
                headOfDept: formData.headOfDept,
                location: formData.location,
                intercom: formData.intercom,
                shift: formData.shift,
                equipmentCount: Number(formData.equipmentCount),
                activeStaffCount: Number(formData.activeStaffCount),
                tatBenchmark: formData.tatBenchmark,
                status: formData.status,
                description: formData.description,
              }
            : d
        )
      );
    } else {
      const newDept: DepartmentItem = {
        id: `DEPT-0${departments.length + 1}`,
        code: formData.code || `DEPT-${Math.floor(10 + departments.length + 1)}`,
        name: formData.name,
        headOfDept: formData.headOfDept,
        location: formData.location,
        intercom: formData.intercom,
        shift: formData.shift,
        equipmentCount: Number(formData.equipmentCount) || 1,
        activeStaffCount: Number(formData.activeStaffCount) || 1,
        tatBenchmark: formData.tatBenchmark,
        status: formData.status,
        description: formData.description,
      };
      setDepartments((prev) => [newDept, ...prev]);
    }
    setIsAddEditModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const nextStatus = d.status === "Active" ? "Inactive" : "Active";
        return { ...d, status: nextStatus };
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "Department Code,Department Name,Head / In-Charge,Location,Shift,Equipment Count,Staff Count,TAT Target,Status\n";
    const rows = filteredDepartments
      .map(
        (d) =>
          `"${d.code}","${d.name}","${d.headOfDept}","${d.location}","${d.shift}",${d.equipmentCount},${d.activeStaffCount},"${d.tatBenchmark}","${d.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laboratory-departments.csv";
    a.click();
  };

  const columns = [
    "Department & Code",
    "Section Head / In-Charge",
    "Location & Floor",
    "Linked Equipment",
    "Allocated Staff",
    "TAT Target",
    "Status",
    "Actions",
  ];

  return (
    <div className="departments-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Lab Management</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Departments</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laboratory Departments
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Configure clinical pathology, biochemistry, hematology, and specialized testing divisions.
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
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Departments
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalDepartments}</p>
          <p className="mt-1 text-xs text-slate-500">Configured laboratory divisions</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              24/7 Emergency Units
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{emergency247Count}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Round-the-clock testing active</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Analyzers & Equipment
            </p>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <BiotechOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalAttachedAnalyzers}</p>
          <p className="mt-1 text-xs text-purple-600 font-medium">Dedicated instruments linked</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Technicians
            </p>
            <span className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStaffAllocated}</p>
          <p className="mt-1 text-xs text-slate-500">Cross-department duty roster</p>
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
              placeholder="Search department, code, HOD, floor..."
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
              <label className="text-xs font-medium text-slate-500">Shift:</label>
              <select
                value={selectedShift}
                onChange={(e) => {
                  setSelectedShift(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Shifts</option>
                <option value="24/7">24/7 Round-the-clock</option>
                <option value="Morning">Morning</option>
                <option value="General">General</option>
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
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedDepartments}
            maxHeight="380px"
            minWidth="1200px"
            emptyMessage="No departments match your search or filter criteria."
            renderRow={(dept: DepartmentItem) => {
              let statusBadge = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
              if (dept.status === "Under Maintenance") {
                statusBadge = "bg-amber-100 text-amber-700 hover:bg-amber-200";
              } else if (dept.status === "Inactive") {
                statusBadge = "bg-slate-200 text-slate-700 hover:bg-slate-300";
              }

              return (
                <>
                  {/* 1. Department & Code */}
                  <td className="whitespace-nowrap px-4 py-3 text-left min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 border border-blue-100">
                        {dept.code.slice(5, 8)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{dept.name}</div>
                        <div className="font-mono text-xs text-blue-600">{dept.code}</div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Head / In-Charge */}
                  <td className="whitespace-nowrap px-4 py-3 text-left min-w-[190px]">
                    <div className="font-medium text-slate-800 text-sm">{dept.headOfDept}</div>
                    <div className="text-xs text-slate-400">{dept.intercom}</div>
                  </td>

                  {/* 3. Location */}
                  <td className="whitespace-nowrap px-4 py-3 text-left min-w-[200px]">
                    <span className="text-xs text-slate-700 font-medium">
                      {dept.location}
                    </span>
                  </td>

                  {/* 4. Linked Equipment */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[130px]">
                    <span className="inline-flex items-center justify-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                      {dept.equipmentCount} Units
                    </span>
                  </td>

                  {/* 5. Allocated Staff */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[120px]">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {dept.activeStaffCount} Staff
                    </span>
                  </td>

                  {/* 6. TAT Benchmark */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[130px]">
                    <span className="font-semibold text-xs text-slate-700">
                      {dept.tatBenchmark}
                    </span>
                  </td>

                  {/* 7. Status */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(dept.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${statusBadge}`}
                      title="Click to toggle status"
                    >
                      {dept.status}
                    </button>
                  </td>

                  {/* 8. Actions */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingDept(dept)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="View Details"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(dept)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit Department"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDept(dept.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Department"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
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
            totalItems={filteredDepartments.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* View Department Details Modal */}
      {viewingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setViewingDept(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BusinessOutlinedIcon sx={{ fontSize: 24 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingDept.name}</h3>
                <span className="font-mono text-xs text-blue-600 font-semibold">{viewingDept.code}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Head of Section</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewingDept.headOfDept}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Intercom Line</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewingDept.intercom}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Floor Location</span>
                  <p className="text-slate-700 mt-0.5">{viewingDept.location}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Shift Schedule</span>
                  <p className="text-slate-700 mt-0.5">{viewingDept.shift}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Equipment</span>
                  <p className="font-bold text-purple-700 text-base">{viewingDept.equipmentCount} Units</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Staff</span>
                  <p className="font-bold text-blue-700 text-base">{viewingDept.activeStaffCount} Techs</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Target TAT</span>
                  <p className="font-bold text-slate-800 text-base">{viewingDept.tatBenchmark}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Scope of Operations</span>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewingDept.description}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingDept(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Department Drawer (Right Side) */}
      {isAddEditModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsAddEditModalOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BusinessOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingDept ? "Edit Department Details" : "Create New Department"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage clinical divisions, location mapping, and TAT benchmarks.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEPT-BIO"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Biochemistry"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Meenakshi Sundaram"
                    value={formData.headOfDept}
                    onChange={(e) => setFormData({ ...formData, headOfDept: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location & Room No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Block A, Room 102"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shift: e.target.value as DepartmentItem["shift"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="24/7 Round-the-clock">24/7 Round-the-clock</option>
                    <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                    <option value="General (09:00 - 17:00)">General (09:00 - 17:00)</option>
                    <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intercom Line
                  </label>
                  <input
                    type="text"
                    placeholder="Ext: 102"
                    value={formData.intercom}
                    onChange={(e) => setFormData({ ...formData, intercom: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Turnaround Time (TAT)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 - 3 Hours"
                    value={formData.tatBenchmark}
                    onChange={(e) => setFormData({ ...formData, tatBenchmark: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipment Units Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.equipmentCount}
                    onChange={(e) => setFormData({ ...formData, equipmentCount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as DepartmentItem["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Test Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify key analyzers, routine tests, or specimen types processed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  {editingDept ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

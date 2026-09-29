import { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./equipment.css";

export interface EquipmentItem {
  id: string;
  assetCode: string;
  name: string;
  model: string;
  department: string;
  manufacturer: string;
  serialNumber: string;
  installedDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationFrequencyDays: number;
  amcProvider: string;
  amcExpiryDate: string;
  status: "Operational" | "Calibration Due" | "Under Maintenance" | "Offline";
  temperatureZone: string;
  notes: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: "EQ-001",
    assetCode: "EQ-2026-001",
    name: "Roche Cobas c311 Chemistry Analyzer",
    model: "Cobas c311 Automated Spectrophotometer",
    department: "Clinical Biochemistry",
    manufacturer: "Roche Diagnostics Ltd.",
    serialNumber: "SN-RC311-9921",
    installedDate: "15 Jan 2023",
    lastCalibrationDate: "15 Sep 2026",
    nextCalibrationDate: "15 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Roche Direct Care India",
    amcExpiryDate: "14 Jan 2027",
    status: "Operational",
    temperatureZone: "20°C - 25°C (Climate Controlled)",
    notes: "300 tests/hour capacity. Calibrated with Roche C.f.a.s. calibrator lot #8812.",
  },
  {
    id: "EQ-002",
    assetCode: "EQ-2026-002",
    name: "Beckman Coulter DxH 500 CBC Analyzer",
    model: "DxH 500 5-Part Differential",
    department: "Hematology & Coagulation",
    manufacturer: "Beckman Coulter Biomedical",
    serialNumber: "SN-BC500-4412",
    installedDate: "10 Mar 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Transasia Bio-Medicals Ltd",
    amcExpiryDate: "09 Mar 2027",
    status: "Operational",
    temperatureZone: "18°C - 24°C",
    notes: "Laser flow cytometry with Coulter impedance principle. Runs 60 CBC/hr.",
  },
  {
    id: "EQ-003",
    assetCode: "EQ-2026-003",
    name: "Bio-Rad D-10 Hemoglobin Testing System",
    model: "D-10 HPLC Dual Program",
    department: "Clinical Biochemistry",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "SN-BRD10-7714",
    installedDate: "01 Jun 2023",
    lastCalibrationDate: "20 Aug 2026",
    nextCalibrationDate: "20 Sep 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Bio-Rad Medical India",
    amcExpiryDate: "31 May 2027",
    status: "Calibration Due",
    temperatureZone: "15°C - 30°C",
    notes: "Gold standard HPLC HbA1c and beta-thalassemia screening. Scheduled for calibration visit.",
  },
  {
    id: "EQ-004",
    assetCode: "EQ-2026-004",
    name: "Sysmex CA-660 Automated Coagulation Analyzer",
    model: "CA-660 Photo-Optical Coagulometer",
    department: "Hematology & Coagulation",
    manufacturer: "Sysmex Corporation",
    serialNumber: "SN-SYS660-3101",
    installedDate: "22 Aug 2023",
    lastCalibrationDate: "05 Sep 2026",
    nextCalibrationDate: "05 Nov 2026",
    calibrationFrequencyDays: 60,
    amcProvider: "Sysmex India Pvt Ltd",
    amcExpiryDate: "21 Aug 2027",
    status: "Operational",
    temperatureZone: "15°C - 28°C",
    notes: "PT, INR, APTT, and Fibrinogen automated clot detection.",
  },
  {
    id: "EQ-005",
    assetCode: "EQ-2026-005",
    name: "Mindray CL-900i Chemiluminescence (CLIA)",
    model: "CL-900i Micro-CLIA Benchtop",
    department: "Immunology & Hormones",
    manufacturer: "Mindray Bio-Medical",
    serialNumber: "SN-MD900-5882",
    installedDate: "12 Oct 2023",
    lastCalibrationDate: "12 Sep 2026",
    nextCalibrationDate: "12 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Mindray India Technical",
    amcExpiryDate: "11 Oct 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "Thyroid panel (T3, T4, TSH), Vitamin D3, B12, and Ferritin automated assays.",
  },
  {
    id: "EQ-006",
    assetCode: "EQ-2026-006",
    name: "Remi R-8C High Speed Centrifuge",
    model: "R-8C Digital Lab Centrifuge (6000 RPM)",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Remi Instruments Ltd",
    serialNumber: "SN-RM600-1190",
    installedDate: "05 Jan 2024",
    lastCalibrationDate: "01 Jul 2026",
    nextCalibrationDate: "01 Jan 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Remi Customer Service",
    amcExpiryDate: "04 Jan 2028",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Tachometer calibrated for 3500 RPM sample separation speed. 16-tube swing-out rotor.",
  },
  {
    id: "EQ-007",
    assetCode: "EQ-2026-007",
    name: "Dirui H-500 Urine Chemistry Analyzer",
    model: "H-500 Dual Wavelength Reflectance",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Dirui Industrial Co.",
    serialNumber: "SN-DR500-2091",
    installedDate: "18 Feb 2024",
    lastCalibrationDate: "18 Aug 2026",
    nextCalibrationDate: "18 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Medispec Diagnostics",
    amcExpiryDate: "17 Feb 2027",
    status: "Operational",
    temperatureZone: "15°C - 30°C",
    notes: "514 test strips/hr. 11 parameter urine strip automated reader.",
  },
  {
    id: "EQ-008",
    assetCode: "EQ-2026-008",
    name: "Bio-Rad CFX96 Real-Time PCR Detection",
    model: "CFX96 Touch Thermal Cycler",
    department: "Microbiology & Serology",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "SN-CFX96-8801",
    installedDate: "10 Apr 2024",
    lastCalibrationDate: "10 Jun 2026",
    nextCalibrationDate: "10 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Bio-Rad Medical India",
    amcExpiryDate: "09 Apr 2027",
    status: "Operational",
    temperatureZone: "15°C - 31°C",
    notes: "Multiplex molecular diagnostics and infectious disease target detection.",
  },
  {
    id: "EQ-009",
    assetCode: "EQ-2026-009",
    name: "Leica RM2235 Rotary Microtome",
    model: "RM2235 Manual Rotary Sectioner",
    department: "Histopathology & Cytology",
    manufacturer: "Leica Biosystems",
    serialNumber: "SN-LC223-1490",
    installedDate: "20 May 2024",
    lastCalibrationDate: "20 May 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Leica Precision Care",
    amcExpiryDate: "19 May 2027",
    status: "Under Maintenance",
    temperatureZone: "Ambient",
    notes: "Replacement of blade carrier clamp and micrometer feed calibration in progress.",
  },
  {
    id: "EQ-010",
    assetCode: "EQ-2026-010",
    name: "Thermo Scientific Medifuge Centrifuge",
    model: "Medifuge Small Benchtop",
    department: "Clinical Biochemistry",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-THMED-7182",
    installedDate: "15 Jun 2024",
    lastCalibrationDate: "15 Jun 2026",
    nextCalibrationDate: "15 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "14 Jun 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "DualSpin hybrid rotor with 2-in-1 capability. Validated timer & brake.",
  },
];

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<EquipmentItem | null>(null);
  const [calibratingEquipment, setCalibratingEquipment] = useState<EquipmentItem | null>(null);
  const [calibrationLogDate, setCalibrationLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [calibrationNotes, setCalibrationNotes] = useState("");

  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    model: "",
    department: "Clinical Biochemistry",
    manufacturer: "",
    serialNumber: "",
    installedDate: "2024-01-15",
    lastCalibrationDate: new Date().toISOString().split("T")[0],
    nextCalibrationDate: "2026-11-15",
    calibrationFrequencyDays: 30,
    amcProvider: "",
    amcExpiryDate: "2027-01-15",
    status: "Operational" as EquipmentItem["status"],
    temperatureZone: "20°C - 25°C",
    notes: "",
  });

  // KPI Calculations
  const totalEquipment = equipmentList.length;
  const operationalCount = equipmentList.filter((e) => e.status === "Operational").length;
  const calibrationDueCount = equipmentList.filter((e) => e.status === "Calibration Due").length;
  const underMaintenanceCount = equipmentList.filter((e) => e.status === "Under Maintenance").length;

  // Filtered List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === "All" || eq.department === selectedDept;
      const matchesStatus = selectedStatus === "All" || eq.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [equipmentList, searchTerm, selectedDept, selectedStatus]);

  // Paginated List
  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredEquipment.slice(start, start + rowsPerPage);
  }, [filteredEquipment, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setEditingEquipment(null);
    setFormData({
      assetCode: `EQ-2026-0${equipmentList.length + 1}`,
      name: "",
      model: "",
      department: "Clinical Biochemistry",
      manufacturer: "",
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      installedDate: new Date().toISOString().split("T")[0],
      lastCalibrationDate: new Date().toISOString().split("T")[0],
      nextCalibrationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      calibrationFrequencyDays: 30,
      amcProvider: "Authorized Service Center",
      amcExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Operational",
      temperatureZone: "20°C - 25°C",
      notes: "",
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (eq: EquipmentItem) => {
    setEditingEquipment(eq);
    setFormData({
      assetCode: eq.assetCode,
      name: eq.name,
      model: eq.model,
      department: eq.department,
      manufacturer: eq.manufacturer,
      serialNumber: eq.serialNumber,
      installedDate: eq.installedDate,
      lastCalibrationDate: eq.lastCalibrationDate,
      nextCalibrationDate: eq.nextCalibrationDate,
      calibrationFrequencyDays: eq.calibrationFrequencyDays,
      amcProvider: eq.amcProvider,
      amcExpiryDate: eq.amcExpiryDate,
      status: eq.status,
      temperatureZone: eq.temperatureZone,
      notes: eq.notes,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.manufacturer.trim()) return;

    if (editingEquipment) {
      setEquipmentList((prev) =>
        prev.map((item) =>
          item.id === editingEquipment.id
            ? {
                ...item,
                assetCode: formData.assetCode,
                name: formData.name,
                model: formData.model,
                department: formData.department,
                manufacturer: formData.manufacturer,
                serialNumber: formData.serialNumber,
                installedDate: formData.installedDate,
                lastCalibrationDate: formData.lastCalibrationDate,
                nextCalibrationDate: formData.nextCalibrationDate,
                calibrationFrequencyDays: Number(formData.calibrationFrequencyDays),
                amcProvider: formData.amcProvider,
                amcExpiryDate: formData.amcExpiryDate,
                status: formData.status,
                temperatureZone: formData.temperatureZone,
                notes: formData.notes,
              }
            : item
        )
      );
    } else {
      const newEq: EquipmentItem = {
        id: `EQ-0${equipmentList.length + 1}`,
        assetCode: formData.assetCode || `EQ-2026-0${equipmentList.length + 1}`,
        name: formData.name,
        model: formData.model || formData.name,
        department: formData.department,
        manufacturer: formData.manufacturer,
        serialNumber: formData.serialNumber,
        installedDate: formData.installedDate,
        lastCalibrationDate: formData.lastCalibrationDate,
        nextCalibrationDate: formData.nextCalibrationDate,
        calibrationFrequencyDays: Number(formData.calibrationFrequencyDays) || 30,
        amcProvider: formData.amcProvider,
        amcExpiryDate: formData.amcExpiryDate,
        status: formData.status,
        temperatureZone: formData.temperatureZone,
        notes: formData.notes,
      };
      setEquipmentList((prev) => [newEq, ...prev]);
    }
    setIsAddEditModalOpen(false);
  };

  const handleOpenCalibrationModal = (eq: EquipmentItem) => {
    setCalibratingEquipment(eq);
    setCalibrationLogDate(new Date().toISOString().split("T")[0]);
    setCalibrationNotes(`Periodic ISO 15189 calibration passed. Certified by Er. Karthik Raja.`);
  };

  const handleSaveCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingEquipment) return;

    const nextDueDate = new Date(Date.now() + calibratingEquipment.calibrationFrequencyDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === calibratingEquipment.id
          ? {
              ...eq,
              lastCalibrationDate: calibrationLogDate,
              nextCalibrationDate: nextDueDate,
              status: "Operational",
              notes: `${eq.notes ? eq.notes + " | " : ""}${calibrationNotes}`,
            }
          : eq
      )
    );
    setCalibratingEquipment(null);
  };

  const handleToggleStatus = (id: string) => {
    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id !== id) return eq;
        const nextStatus = eq.status === "Operational" ? "Offline" : "Operational";
        return { ...eq, status: nextStatus };
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "Asset Code,Equipment Name,Model,Department,Manufacturer,Serial No,Last Calibrated,Next Due,AMC Provider,Status\n";
    const rows = filteredEquipment
      .map(
        (e) =>
          `"${e.assetCode}","${e.name}","${e.model}","${e.department}","${e.manufacturer}","${e.serialNumber}","${e.lastCalibrationDate}","${e.nextCalibrationDate}","${e.amcProvider}","${e.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laboratory-equipment-register.csv";
    a.click();
  };

  const columns = [
    "Asset Code & Equipment",
    "Department",
    "Manufacturer & Model",
    "Serial Number",
    "Last Calibrated",
    "Next Due Date",
    "AMC / Warranty",
    "Operating Status",
    "Actions",
  ];

  return (
    <div className="equipment-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Lab Management</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">Equipment & Analyzers</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Analyzers & Equipment Register
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Maintain laboratory instrumentation, calibration logs, AMC contracts, and temperature compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Export Register</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Add Instrument</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Equipment Assets
            </p>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <BiotechOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalEquipment}</p>
          <p className="mt-1 text-xs text-slate-500">Across all testing benches</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Operational & Validated
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{operationalCount}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Ready for clinical samples</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Calibration Due / Alert
            </p>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{calibrationDueCount}</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">Re-calibration required</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Maintenance In-Progress
            </p>
            <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <BuildCircleOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{underMaintenanceCount}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Service engineer call-out</p>
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
              placeholder="Search analyzer, model, serial no, vendor..."
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
              <label className="text-xs font-medium text-slate-500">Department:</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Departments</option>
                <option value="Clinical Biochemistry">Clinical Biochemistry</option>
                <option value="Hematology & Coagulation">Hematology & Coagulation</option>
                <option value="Microbiology & Serology">Microbiology & Serology</option>
                <option value="Immunology & Hormones">Immunology & Hormones</option>
                <option value="Clinical Pathology & Urine Routine">Clinical Pathology & Urine Routine</option>
                <option value="Accession & Central Phlebotomy">Accession & Central Phlebotomy</option>
                <option value="Histopathology & Cytology">Histopathology & Cytology</option>
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Status</option>
                <option value="Operational">Operational</option>
                <option value="Calibration Due">Calibration Due</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedEquipment}
            maxHeight="440px"
            minWidth="1300px"
            emptyMessage="No equipment matches your search or filter criteria."
            renderRow={(eq: EquipmentItem) => {
              let statusBadge = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
              if (eq.status === "Calibration Due") {
                statusBadge = "bg-amber-100 text-amber-700 hover:bg-amber-200";
              } else if (eq.status === "Under Maintenance") {
                statusBadge = "bg-rose-100 text-rose-700 hover:bg-rose-200";
              } else if (eq.status === "Offline") {
                statusBadge = "bg-slate-200 text-slate-700 hover:bg-slate-300";
              }

              return (
                <>
                  {/* 1. Asset Code & Equipment */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                        <BiotechOutlinedIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm max-w-[200px] truncate" title={eq.name}>
                          {eq.name}
                        </div>
                        <div className="font-mono text-xs text-purple-600 font-semibold">{eq.assetCode}</div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Department */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[190px]">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {eq.department}
                    </span>
                  </td>

                  {/* 3. Manufacturer & Model */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[190px]">
                    <div className="text-xs font-semibold text-slate-800">{eq.manufacturer}</div>
                    <div className="text-[11px] text-slate-400 max-w-[170px] truncate" title={eq.model}>
                      {eq.model}
                    </div>
                  </td>

                  {/* 4. Serial Number */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[150px]">
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {eq.serialNumber}
                    </span>
                  </td>

                  {/* 5. Last Calibrated */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[140px]">
                    <div className="text-xs text-slate-700 font-medium">{eq.lastCalibrationDate}</div>
                    <div className="text-[10px] text-slate-400">Freq: {eq.calibrationFrequencyDays} days</div>
                  </td>

                  {/* 6. Next Due Date */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[140px]">
                    <div
                      className={`text-xs font-bold ${
                        eq.status === "Calibration Due" ? "text-amber-700" : "text-slate-800"
                      }`}
                    >
                      {eq.nextCalibrationDate}
                    </div>
                    {eq.status === "Calibration Due" && (
                      <span className="text-[10px] text-amber-600 font-semibold">Immediate action</span>
                    )}
                  </td>

                  {/* 7. AMC / Warranty */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[150px]">
                    <div className="text-xs font-medium text-slate-800 truncate max-w-[140px]" title={eq.amcProvider}>
                      {eq.amcProvider}
                    </div>
                    <div className="text-[10px] text-slate-400">Exp: {eq.amcExpiryDate}</div>
                  </td>

                  {/* 8. Operating Status */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(eq.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${statusBadge}`}
                      title="Click to toggle operational status"
                    >
                      {eq.status}
                    </button>
                  </td>

                  {/* 9. Actions */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[130px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingEquipment(eq)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-purple-600 transition"
                        title="View Full Profile"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCalibrationModal(eq)}
                        className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                        title="Log Calibration Record"
                      >
                        <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(eq)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit Instrument"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(eq.id)}
                        className={`rounded-lg p-1.5 transition ${
                          eq.status === "Operational"
                            ? "text-rose-500 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={eq.status === "Operational" ? "Take Offline" : "Set Operational"}
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
            totalItems={filteredEquipment.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Log Calibration Modal */}
      {calibratingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setCalibratingEquipment(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Calibration Record</h3>
                <p className="text-xs text-slate-500">{calibratingEquipment.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveCalibration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibration Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={calibrationLogDate}
                  onChange={(e) => setCalibrationLogDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibration Standards & Verification Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={calibrationNotes}
                  onChange={(e) => setCalibrationNotes(e.target.value)}
                  placeholder="Lot number, calibrator type, standard curve slope, bio-medical engineer sign-off..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCalibratingEquipment(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700 transition"
                >
                  Certify Calibration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Equipment Details Modal */}
      {viewingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setViewingEquipment(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <BiotechOutlinedIcon sx={{ fontSize: 26 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingEquipment.name}</h3>
                <span className="font-mono text-xs text-purple-600 font-semibold">{viewingEquipment.assetCode}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Department</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewingEquipment.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Manufacturer</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewingEquipment.manufacturer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Serial Number</span>
                  <p className="font-mono text-slate-700 mt-0.5 font-bold">{viewingEquipment.serialNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Temperature Zone</span>
                  <p className="text-slate-700 mt-0.5">{viewingEquipment.temperatureZone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Last Calibration</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{viewingEquipment.lastCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Next Due Date</span>
                  <p className="font-bold text-purple-700 text-xs mt-0.5">{viewingEquipment.nextCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Status</span>
                  <p className="font-bold text-emerald-700 text-xs mt-0.5">{viewingEquipment.status}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Maintenance Contract (AMC)</span>
                <p className="text-slate-800 font-semibold mt-0.5">{viewingEquipment.amcProvider}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Contract Expiry: {viewingEquipment.amcExpiryDate}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Operational Specs & Calibration Logs</span>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewingEquipment.notes || "Instrument fully validated according to CLSI & ISO 15189 specifications."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingEquipment(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <BiotechOutlinedIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingEquipment ? "Edit Analyzer Details" : "Enroll New Instrument"}
                </h3>
                <p className="text-xs text-slate-500">
                  Register automated analyzer specs, serial numbers, and maintenance schedule.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asset / Machine Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EQ-2026-011"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipment / Analyzer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sysmex XN-1000"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturer / Brand <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sysmex Corporation"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Clinical Biochemistry">Clinical Biochemistry</option>
                    <option value="Hematology & Coagulation">Hematology & Coagulation</option>
                    <option value="Microbiology & Serology">Microbiology & Serology</option>
                    <option value="Immunology & Hormones">Immunology & Hormones</option>
                    <option value="Clinical Pathology & Urine Routine">Clinical Pathology & Urine Routine</option>
                    <option value="Accession & Central Phlebotomy">Accession & Central Phlebotomy</option>
                    <option value="Histopathology & Cytology">Histopathology & Cytology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-SYS-9901"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Temperature Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20°C - 25°C"
                    value={formData.temperatureZone}
                    onChange={(e) => setFormData({ ...formData, temperatureZone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Calibration
                  </label>
                  <input
                    type="date"
                    value={formData.lastCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as EquipmentItem["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Calibration Due">Calibration Due</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    AMC Service Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Roche Direct Care"
                    value={formData.amcProvider}
                    onChange={(e) => setFormData({ ...formData, amcProvider: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    AMC Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.amcExpiryDate}
                    onChange={(e) => setFormData({ ...formData, amcExpiryDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Specifications & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Throughput, calibrators used, interface cable (RS232/LAN)..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 transition"
                >
                  {editingEquipment ? "Save Changes" : "Register Instrument"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

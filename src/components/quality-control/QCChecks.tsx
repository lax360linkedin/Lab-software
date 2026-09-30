import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredQCRuns,
  saveQCRuns,
  getStoredFailedQC,
  saveFailedQC,
  type QCRunRecord,
  type QCFailedItem,
} from "./qcData";
import "./qualityControl.css";

const QCChecks: React.FC = () => {
  const [qcRuns, setQcRuns] = useState<QCRunRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // New QC Run Modal
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState("Sysmex XN-1000");
  const [selectedTest, setSelectedTest] = useState("Complete Blood Count (CBC)");
  const selectedDepartment = selectedAnalyzer.includes("Sysmex")
    ? "Hematology"
    : selectedAnalyzer.includes("Cobas e411")
    ? "Endocrinology"
    : "Biochemistry";
  const [controlName, setControlName] = useState("Bio-Rad Liquichek Hematology Level 1");
  const [lotNumber, setLotNumber] = useState("LOT-HEM-8821");
  const [targetMean, setTargetMean] = useState(14.0);
  const [targetSD, setTargetSD] = useState(0.4);
  const [measuredValue, setMeasuredValue] = useState(14.2);
  const [unit, setUnit] = useState("g/dL");
  const [technicianName, setTechnicianName] = useState("Suresh Kumar");
  const [notes, setNotes] = useState("");

  const [viewRun, setViewRun] = useState<QCRunRecord | null>(null);
  const [editRun, setEditRun] = useState<QCRunRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setQcRuns(getStoredQCRuns());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Evaluate Westgard Rule
  const evaluateWestgard = (measured: number, mean: number, sd: number) => {
    const z = sd > 0 ? (measured - mean) / sd : 0;
    const absZ = Math.abs(z);

    if (absZ > 3.0) {
      return {
        rule: "1-3s (Rejection)" as const,
        status: "Failed" as const,
        zScore: Number(z.toFixed(2)),
      };
    } else if (absZ > 2.0) {
      return {
        rule: "1-2s (Warning)" as const,
        status: "Warning" as const,
        zScore: Number(z.toFixed(2)),
      };
    } else {
      return {
        rule: "1-SD (Normal)" as const,
        status: "Passed" as const,
        zScore: Number(z.toFixed(2)),
      };
    }
  };

  // Submit New Daily QC Run
  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const evaluation = evaluateWestgard(Number(measuredValue), Number(targetMean), Number(targetSD));

    const newRun: QCRunRecord = {
      id: `QC-RUN-${Date.now()}`,
      runNumber: `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      testName: selectedTest,
      department: selectedDepartment,
      analyzerId: "EQ-DEV-01",
      analyzerName: selectedAnalyzer,
      controlName,
      controlLevel: "Level 1 (Normal)",
      lotNumber,
      expiryDate: "28 Feb 2027",
      technician: technicianName,
      runDate: getFormattedCurrentDate(),
      runTime: getFormattedCurrentTime(),
      targetMean: Number(targetMean),
      targetSD: Number(targetSD),
      measuredValue: Number(measuredValue),
      zScore: evaluation.zScore,
      unit,
      westgardRule: evaluation.rule,
      status: evaluation.status,
      notes: notes || "Daily pre-analytical calibration check.",
    };

    const updatedList = [newRun, ...qcRuns];
    setQcRuns(updatedList);
    saveQCRuns(updatedList);

    // If failed, automatically create a triage item in Failed QC!
    if (evaluation.status === "Failed") {
      const currentFailed = getStoredFailedQC();
      const failedItem: QCFailedItem = {
        id: `FAIL-${Date.now()}`,
        qcRunId: newRun.id,
        testName: newRun.testName,
        analyzerName: newRun.analyzerName,
        controlLot: newRun.lotNumber,
        measuredValue: newRun.measuredValue,
        targetMean: newRun.targetMean,
        zScore: newRun.zScore,
        violationRule: `1-3s (Z-score: ${newRun.zScore} SD exceeds ±3.0 limit)`,
        failedDate: getFormattedCurrentDate(),
        failedTime: getFormattedCurrentTime(),
        technician: newRun.technician,
        affectedSamplesCount: 3,
        affectedSampleIds: ["SMP-HOLD-01", "SMP-HOLD-02", "SMP-HOLD-03"],
        status: "Action Required",
        severity: "Critical",
      };
      saveFailedQC([failedItem, ...currentFailed]);
    }

    // Call backend API asynchronously
    try {
      await fetch("http://127.0.0.1:8000/api/quality-control/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlId: lotNumber,
          instrumentId: selectedAnalyzer,
          measurements: {
            test: selectedTest,
            measured: measuredValue,
            zScore: evaluation.zScore,
            status: evaluation.status,
          },
        }),
      });
    } catch {
      // Backend fallback handled gracefully
    }

    setIsNewRunOpen(false);
    showToast(
      evaluation.status === "Passed"
        ? "Daily QC Run Recorded: PASSED (Analyzer cleared for verification)"
        : evaluation.status === "Warning"
        ? "Daily QC Run Recorded: WARNING (1-2s rule - monitor run)"
        : "Daily QC Run Recorded: FAILED (1-3s rule - routed to Failed QC for CAPA)"
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this QC run record?")) {
      const updated = qcRuns.filter((r) => r.id !== id);
      setQcRuns(updated);
      saveQCRuns(updated);
      showToast("QC run deleted.");
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRun) return;

    const evaluation = evaluateWestgard(editRun.measuredValue, editRun.targetMean, editRun.targetSD);
    const updatedRun: QCRunRecord = {
      ...editRun,
      zScore: evaluation.zScore,
      westgardRule: evaluation.rule,
      status: evaluation.status,
    };

    const updated = qcRuns.map((r) => (r.id === editRun.id ? updatedRun : r));
    setQcRuns(updated);
    saveQCRuns(updated);
    setEditRun(null);
    showToast("QC run record updated.");
  };

  const filteredRuns = useMemo(() => {
    return qcRuns.filter((item) => {
      const matchSearch =
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.analyzerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.technician.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchDept = departmentFilter === "All" || item.department === departmentFilter;

      return matchSearch && matchStatus && matchDept;
    });
  }, [qcRuns, searchTerm, statusFilter, departmentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRuns.slice(start, start + rowsPerPage);
  }, [filteredRuns, currentPage, rowsPerPage]);

  const columns = [
    "Run ID",
    "Test Name",
    "Analyzer",
    "Control Material",
    "Lot #",
    "Target Mean ± SD",
    "Measured",
    "Z-Score",
    "Westgard Rule",
    "Status",
    "Actions",
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <ScienceOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quality Control (QC) Checks
            </h1>
            <p className="text-sm text-slate-500">
              Determine whether analytical results can proceed safely to verification according to Westgard multirules
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewRunOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-700 transition"
        >
          <AddIcon fontSize="small" />
          Record Daily QC Run
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total QC Runs Today</p>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700 font-bold text-xs">{getFormattedCurrentDate()}</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{qcRuns.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Logged across all lab analyzers</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">QC Passed</p>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {qcRuns.filter((r) => r.status === "Passed").length}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Within &plusmn;2SD, cleared for verification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">QC Warnings (1-2s)</p>
            <span className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-700">
            {qcRuns.filter((r) => r.status === "Warning").length}
          </p>
          <p className="mt-1 text-xs text-amber-600 font-medium">Exceeds 2SD, monitored closely</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">QC Failed (Out of Control)</p>
            <span className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-rose-700">
            {qcRuns.filter((r) => r.status === "Failed").length}
          </p>
          <p className="mt-1 text-xs text-rose-600 font-medium">1-3s rejection, sample hold active</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search test, analyzer, lot #, or technician..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FilterListIcon className="text-slate-400" fontSize="small" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-teal-500"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="All">All QC Statuses</option>
              <option value="Passed">Passed (Normal)</option>
              <option value="Warning">Warning (1-2s)</option>
              <option value="Failed">Failed (1-3s Rejection)</option>
            </select>
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: QCRunRecord) => (
            <>
              {/* Run ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-semibold text-teal-700 text-xs">
                {item.runNumber}
              </td>

              {/* Test Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.testName}</div>
                <div className="text-[11px] text-slate-500">{item.department}</div>
              </td>

              {/* Analyzer */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-medium text-slate-800">
                {item.analyzerName}
              </td>

              {/* Control Material */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-700">
                <div>{item.controlName}</div>
                <div className="text-[11px] text-slate-400">{item.controlLevel}</div>
              </td>

              {/* Lot # */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-600">
                {item.lotNumber}
              </td>

              {/* Target Mean ± SD */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-mono text-slate-700">
                {item.targetMean} &plusmn; {item.targetSD} {item.unit}
              </td>

              {/* Measured Value */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold text-slate-900">
                {item.measuredValue} {item.unit}
              </td>

              {/* Z-Score */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-mono font-bold">
                <span
                  className={
                    Math.abs(item.zScore) > 3
                      ? "text-rose-600"
                      : Math.abs(item.zScore) > 2
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }
                >
                  {item.zScore > 0 ? `+${item.zScore}` : item.zScore} SD
                </span>
              </td>

              {/* Westgard Rule */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    item.status === "Passed"
                      ? "westgard-pass"
                      : item.status === "Warning"
                      ? "westgard-warning"
                      : "westgard-fail"
                  }`}
                >
                  {item.westgardRule}
                </span>
              </td>

              {/* Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    item.status === "Passed"
                      ? "text-emerald-700 bg-emerald-50"
                      : item.status === "Warning"
                      ? "text-amber-700 bg-amber-50"
                      : "text-rose-700 bg-rose-50"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewRun(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition"
                    title="View QC Run Details"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRun(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition"
                    title="Edit QC Measurements"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Run Record"
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </td>
            </>
          )}
        />

        {/* Standard Pagination with Default 5 Rows */}
        <div className="border-t border-slate-200 bg-white px-4 py-3.5">
          <Pagination
            totalItems={filteredRuns.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* New QC Run Right-Side Drawer */}
      {isNewRunOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsNewRunOpen(false)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <ScienceOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Daily Analyzer QC Run</h3>
                  <p className="text-xs text-slate-500">
                    Validate analytical precision before patient reporting
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRunOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleCreateRun} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Analyzer / Instrument</label>
                  <select
                    value={selectedAnalyzer}
                    onChange={(e) => setSelectedAnalyzer(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                  >
                    <option value="Sysmex XN-1000">Sysmex XN-1000 (Hematology)</option>
                    <option value="AU480 Chemistry Analyzer">AU480 Chemistry Analyzer (Biochemistry)</option>
                    <option value="Cobas c311">Cobas c311 (Biochemistry)</option>
                    <option value="Mindray BS-200E">Mindray BS-200E (Biochemistry)</option>
                    <option value="Cobas e411">Cobas e411 (Endocrinology)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investigation / Test</label>
                  <input
                    type="text"
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Control Material & Level</label>
                    <input
                      type="text"
                      value={controlName}
                      onChange={(e) => setControlName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lot Number</label>
                    <input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-mono font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Target & Measured Values */}
                <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Mean</label>
                    <input
                      type="number"
                      step="any"
                      value={targetMean}
                      onChange={(e) => setTargetMean(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border border-slate-300 px-2 font-mono font-bold text-slate-900 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Standard Dev (1-SD)</label>
                    <input
                      type="number"
                      step="any"
                      value={targetSD}
                      onChange={(e) => setTargetSD(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border border-slate-300 px-2 font-mono font-bold text-slate-900 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-teal-800 mb-1">Measured QC Value</label>
                    <input
                      type="number"
                      step="any"
                      value={measuredValue}
                      onChange={(e) => setMeasuredValue(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border-2 border-teal-500 px-2 font-mono font-black text-teal-900 bg-white outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Measurement Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Operating Technician</label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">QC Run Notes / Westgard Observation</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Standard morning run. Optical zero checked."
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsNewRunOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 font-semibold text-white shadow hover:bg-teal-700 transition"
                >
                  Save & Evaluate Westgard
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* View Run Modal */}
      {viewRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">QC Run Details: {viewRun.runNumber}</h3>
              <button
                type="button"
                onClick={() => setViewRun(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Analyzer:</span> <span className="font-semibold text-slate-800">{viewRun.analyzerName}</span></div>
              <div><span className="text-slate-400">Test:</span> <span className="font-semibold text-slate-800">{viewRun.testName}</span></div>
              <div><span className="text-slate-400">Control Lot:</span> <span className="font-mono font-semibold">{viewRun.lotNumber}</span></div>
              <div><span className="text-slate-400">Technician:</span> <span className="font-semibold">{viewRun.technician}</span></div>
              <div><span className="text-slate-400">Target Mean:</span> <span className="font-mono">{viewRun.targetMean} &plusmn; {viewRun.targetSD}</span></div>
              <div><span className="text-slate-400">Measured:</span> <span className="font-mono font-bold text-teal-700">{viewRun.measuredValue} {viewRun.unit}</span></div>
              <div><span className="text-slate-400">Z-Score:</span> <span className="font-mono font-bold">{viewRun.zScore} SD</span></div>
              <div><span className="text-slate-400">Westgard Rule:</span> <span className="font-bold">{viewRun.westgardRule}</span></div>
            </div>

            {viewRun.notes && (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                <span className="font-bold block text-slate-700 mb-0.5">Notes:</span>
                <p className="text-slate-600">{viewRun.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewRun(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Run Right-Side Drawer */}
      {editRun && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditRun(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit QC Run: {editRun.runNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editRun.testName} • {editRun.analyzerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditRun(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                {/* Meta details */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Control Material:</span>
                    <span className="font-semibold text-slate-800">{editRun.controlName} ({editRun.controlLevel})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lot Number:</span>
                    <span className="font-mono text-slate-700">{editRun.lotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Mean ± SD:</span>
                    <span className="font-mono text-slate-800">{editRun.targetMean} &plusmn; {editRun.targetSD} {editRun.unit}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Measured Value ({editRun.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editRun.measuredValue}
                    onChange={(e) => setEditRun({ ...editRun, measuredValue: Number(e.target.value) })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 font-mono font-bold text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Technician Remarks / Observations
                  </label>
                  <textarea
                    rows={4}
                    value={editRun.notes || ""}
                    onChange={(e) => setEditRun({ ...editRun, notes: e.target.value })}
                    placeholder="Enter technician remarks..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditRun(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 font-semibold text-white shadow hover:bg-teal-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default QCChecks;

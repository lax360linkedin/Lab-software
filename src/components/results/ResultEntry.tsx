import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  TEST_DEFINITIONS,
  getStoredResults,
  saveResultsStore,
  type TestResultItem,
  type ResultParameterValue,
} from "./resultsData";
import "./results.css";

const ResultEntry: React.FC = () => {
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("AWAITING_ENTRY");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal / Drawer state for Result Entry
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<TestResultItem | null>(null);
  const [paramInputs, setParamInputs] = useState<Record<string, number | string>>({});
  const [technicianNotes, setTechnicianNotes] = useState("");
  const [qcStatusSelection, setQcStatusSelection] = useState<"PASSED" | "FAILED">("PASSED");
  const [viewItem, setViewItem] = useState<TestResultItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TestResultItem | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    setResults(getStoredResults());
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Open entry modal
  const handleOpenEntry = (item: TestResultItem) => {
    setActiveItem(item);
    const def = TEST_DEFINITIONS[item.testName] || TEST_DEFINITIONS["Complete Blood Count (CBC)"];
    const initialInputs: Record<string, number | string> = {};

    if (item.parameters && item.parameters.length > 0) {
      item.parameters.forEach((p) => {
        initialInputs[p.code] = p.value;
      });
    } else {
      def.parameters.forEach((param) => {
        initialInputs[param.code] = param.defaultValue !== undefined ? param.defaultValue : "";
      });
    }

    setParamInputs(initialInputs);
    setTechnicianNotes(item.notes || `Analysis processed on ${item.analyzer}. Specimen intact.`);
    setQcStatusSelection(item.qcStatus === "FAILED" ? "FAILED" : "PASSED");
    setIsEntryOpen(true);
  };

  // Calculate high/low flag live
  const calculateFlag = (val: number, low: number, high: number): "Normal" | "High" | "Low" | "Critical" => {
    if (isNaN(val)) return "Normal";
    if (val < low * 0.7 || val > high * 1.4) return "Critical";
    if (val < low) return "Low";
    if (val > high) return "High";
    return "Normal";
  };

  // Save entered results
  const handleSaveResult = async (submitToVerification: boolean) => {
    if (!activeItem) return;

    const def = TEST_DEFINITIONS[activeItem.testName] || TEST_DEFINITIONS["Complete Blood Count (CBC)"];
    const parameters: ResultParameterValue[] = def.parameters.map((param) => {
      const entered = Number(paramInputs[param.code]);
      const flag = calculateFlag(entered, param.lowRef, param.highRef);
      return {
        name: param.name,
        code: param.code,
        value: isNaN(entered) ? String(paramInputs[param.code] || "") : entered,
        unit: param.unit,
        referenceRange: `${param.lowRef} - ${param.highRef}`,
        flag,
      };
    });

    let nextStatus: TestResultItem["status"] = "ENTERED";
    if (submitToVerification) {
      if (qcStatusSelection === "FAILED") {
        nextStatus = "QC_FAILED";
      } else {
        nextStatus = "PENDING_VERIFICATION";
      }
    }

    const updatedItem: TestResultItem = {
      ...activeItem,
      status: nextStatus,
      qcStatus: qcStatusSelection,
      parameters,
      notes: technicianNotes,
      completedDate: getFormattedCurrentDate(),
      completedTime: getFormattedCurrentTime(),
    };

    const updatedList = results.map((r) => (r.id === activeItem.id ? updatedItem : r));
    setResults(updatedList);
    saveResultsStore(updatedList);

    // Call backend API asynchronously
    try {
      await fetch("http://127.0.0.1:8000/api/results/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: activeItem.sampleId,
          testId: activeItem.testId,
          parameterValues: paramInputs,
          notes: technicianNotes,
        }),
      });
    } catch {
      // Backend fallback handled gracefully
    }

    setIsEntryOpen(false);
    setActiveItem(null);

    if (submitToVerification) {
      if (qcStatusSelection === "FAILED") {
        showToast(`QC Check Failed for ${activeItem.sampleId}! Sample held for Corrective Action.`);
      } else {
        showToast(`Results submitted successfully! Moved to Pending Verification.`);
      }
    } else {
      showToast(`Draft results saved as ENTERED for ${activeItem.sampleId}.`);
    }
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const updated = results.filter((r) => r.id !== deletingItem.id);
    setResults(updated);
    saveResultsStore(updated);
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  // Filtered dataset
  const filteredList = useMemo(() => {
    return results.filter((item) => {
      const matchSearch =
        item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = departmentFilter === "All" || item.department === departmentFilter;
      const matchStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "AWAITING_ENTRY"
          ? item.status === "AWAITING_ENTRY" || item.status === "ENTERED"
          : item.status === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [results, searchTerm, departmentFilter, statusFilter]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  const columns = [
    "Sample ID",
    "Accession ID",
    "Patient",
    "Test Name",
    "Department",
    "Analyzer",
    "Completed Date & Time",
    "Status",
    "Actions",
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <AssignmentTurnedInOutlinedIcon />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Result Entry
              </h1>
              <p className="text-sm text-slate-500">
                Receives completed laboratory analyses and captures test-specific parametric measurements
              </p>
            </div>
          </div>
        </div>

        {/* Workflow breadcrumb badge */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">
            Lifecycle: Completed Analysis &rarr; <span className="text-blue-600">Result Entry</span> &rarr; QC Check &rarr; Verification
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Result Entry</p>
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <PendingActionsOutlinedIcon />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {results.filter((r) => r.status === "AWAITING_ENTRY").length}
          </p>
          <p className="mt-1 text-xs text-amber-600 font-medium">Awaiting technician parameter entry</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Draft Results Entered</p>
            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <BiotechOutlinedIcon />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {results.filter((r) => r.status === "ENTERED").length}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-medium">Entered, ready for QC check</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Verification</p>
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircleOutlineOutlinedIcon />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {results.filter((r) => r.status === "PENDING_VERIFICATION").length}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">QC passed, with pathologist</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">QC Failed / On Hold</p>
            <span className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
              <ErrorOutlineOutlinedIcon />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {results.filter((r) => r.status === "QC_FAILED").length}
          </p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Held for corrective action & re-analysis</p>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search sample, patient, accession, or test..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
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
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
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
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="AWAITING_ENTRY">Pending & Entered Only</option>
              <option value="All">All Statuses</option>
              <option value="AWAITING_ENTRY">Awaiting Entry</option>
              <option value="ENTERED">Draft Entered</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="QC_FAILED">QC Failed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: TestResultItem) => (
            <>
              {/* Sample ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-semibold text-blue-600 text-xs">
                {item.sampleId}
              </td>

              {/* Accession ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-700">
                {item.accessionId}
              </td>

              {/* Patient */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.patientName}</div>
                <div className="text-[11px] text-slate-400">
                  {item.age} yrs • {item.gender} • {item.patientId}
                </div>
              </td>

              {/* Test Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="font-medium text-slate-800 text-xs">{item.testName}</span>
                <div className="text-[11px] text-slate-500">{item.sampleType}</div>
              </td>

              {/* Department */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {item.department}
                </span>
              </td>

              {/* Analyzer */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div className="font-medium text-slate-700">{item.analyzer}</div>
                <div className="text-[11px] text-slate-400">Tech: {item.technician}</div>
              </td>

              {/* Completed Date & Time */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div>{item.completedTime}</div>
                <div className="text-[11px] text-slate-400">{item.completedDate}</div>
              </td>

              {/* Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                {item.status === "AWAITING_ENTRY" && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                    Awaiting Entry
                  </span>
                )}
                {item.status === "ENTERED" && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                    Draft Entered
                  </span>
                )}
                {item.status === "PENDING_VERIFICATION" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Pending Verification
                  </span>
                )}
                {item.status === "QC_FAILED" && (
                  <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                    QC Failed
                  </span>
                )}
                {item.status === "VERIFIED" && (
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                    Verified
                  </span>
                )}
              </td>

              {/* Actions: View, Edit/Enter, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                    title="View Result Details"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEntry(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                    title={item.status === "AWAITING_ENTRY" ? "Enter Result Values" : "Edit Entered Results"}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Entry"
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
            totalItems={filteredList.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Result Entry Right-Side Drawer Panel */}
      {isEntryOpen && activeItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsEntryOpen(false)}
          />

          {/* Right-Side Drawer */}
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeItem.status === "AWAITING_ENTRY" ? "Enter Test Results" : "Modify Test Results"}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {activeItem.patientName} ({activeItem.patientId}) • Sample: {activeItem.sampleId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEntryOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Meta Card */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Accession Number</span>
                  <span className="font-semibold text-slate-800 font-mono">{activeItem.accessionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department</span>
                  <span className="font-semibold text-slate-800">{activeItem.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Analyzer / Instrument</span>
                  <span className="font-semibold text-slate-800">{activeItem.analyzer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sample Specimen</span>
                  <span className="font-semibold text-slate-800">{activeItem.sampleType}</span>
                </div>
              </div>

              {/* Dynamic Parameter Entry Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ScienceOutlinedIcon fontSize="small" className="text-blue-600" />
                    Test Parameter Measurements ({activeItem.testName})
                  </h4>
                  <span className="text-[11px] text-slate-400">Live clinical reference range check</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Parameter</th>
                        <th className="px-3.5 py-2.5">Observed Value</th>
                        <th className="px-3.5 py-2.5">Unit</th>
                        <th className="px-3.5 py-2.5">Reference Range</th>
                        <th className="px-3.5 py-2.5 text-center">Status Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(TEST_DEFINITIONS[activeItem.testName] || TEST_DEFINITIONS["Complete Blood Count (CBC)"]).parameters.map((p) => {
                        const val = Number(paramInputs[p.code]);
                        const flag = calculateFlag(val, p.lowRef, p.highRef);

                        return (
                          <tr key={p.code} className="hover:bg-slate-50 transition">
                            <td className="px-3.5 py-2 font-medium text-slate-800">
                              {p.name} <span className="font-mono text-[10px] text-slate-400">({p.code})</span>
                            </td>
                            <td className="px-3.5 py-2">
                              <input
                                type="number"
                                step="any"
                                value={paramInputs[p.code] !== undefined ? paramInputs[p.code] : ""}
                                onChange={(e) =>
                                  setParamInputs({
                                    ...paramInputs,
                                    [p.code]: e.target.value === "" ? "" : Number(e.target.value),
                                  })
                                }
                                className="w-28 h-8 rounded-lg border border-slate-300 px-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3.5 py-2 text-slate-500 font-medium">{p.unit}</td>
                            <td className="px-3.5 py-2 text-slate-600 font-mono text-[11px]">
                              {p.lowRef} - {p.highRef}
                            </td>
                            <td className="px-3.5 py-2 text-center">
                              {flag === "Normal" && (
                                <span className="flag-pill results-badge-normal">Normal</span>
                              )}
                              {flag === "High" && (
                                <span className="flag-pill results-badge-high">High &uarr;</span>
                              )}
                              {flag === "Low" && (
                                <span className="flag-pill results-badge-low">Low &darr;</span>
                              )}
                              {flag === "Critical" && (
                                <span className="flag-pill results-badge-critical">CRITICAL !</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician Notes & QC Link */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technician Observations / Smear Notes
                  </label>
                  <textarea
                    rows={2}
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="Enter technician remarks, repeat count confirmations, or specimen notes..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quality Control (QC) Rule Check
                  </label>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2">
                    <p className="text-[11px] text-slate-500">
                      Determine whether analytical results can proceed safely according to lab QC procedures.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-2 cursor-pointer text-emerald-700">
                        <input
                          type="radio"
                          name="qcStatus"
                          value="PASSED"
                          checked={qcStatusSelection === "PASSED"}
                          onChange={() => setQcStatusSelection("PASSED")}
                        />
                        <span>QC Passed (Normal Path)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-rose-700">
                        <input
                          type="radio"
                          name="qcStatus"
                          value="FAILED"
                          checked={qcStatusSelection === "FAILED"}
                          onChange={() => setQcStatusSelection("FAILED")}
                        />
                        <span>QC Failed (Hold for CAPA)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsEntryOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveResult(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 shadow-sm transition"
              >
                <SaveOutlinedIcon fontSize="small" />
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveResult(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                <CheckCircleOutlineOutlinedIcon fontSize="small" />
                Save &amp; Submit
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Details Right-Side Drawer */}
      {viewItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setViewItem(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Result Details: {viewItem.sampleId}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewItem.patientName} • {viewItem.testName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewItem(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div><span className="text-slate-400">Patient:</span> <span className="font-semibold text-slate-800">{viewItem.patientName}</span></div>
                <div><span className="text-slate-400">Sample ID:</span> <span className="font-semibold text-slate-800 font-mono">{viewItem.sampleId}</span></div>
                <div><span className="text-slate-400">Test:</span> <span className="font-semibold text-slate-800">{viewItem.testName}</span></div>
                <div><span className="text-slate-400">Analyzer:</span> <span className="font-semibold text-slate-800">{viewItem.analyzer}</span></div>
                <div><span className="text-slate-400">Technician:</span> <span className="font-semibold text-slate-800">{viewItem.technician}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-blue-600">{viewItem.status}</span></div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Parameter Measurements</h4>
                {viewItem.parameters && viewItem.parameters.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Parameter</th>
                          <th className="px-3 py-2">Value</th>
                          <th className="px-3 py-2">Unit</th>
                          <th className="px-3 py-2">Ref Range</th>
                          <th className="px-3 py-2 text-center">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewItem.parameters.map((p) => (
                          <tr key={p.code}>
                            <td className="px-3 py-2 font-medium">{p.name}</td>
                            <td className="px-3 py-2 font-bold">{p.value}</td>
                            <td className="px-3 py-2 text-slate-500">{p.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{p.referenceRange}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`flag-pill results-badge-${p.flag.toLowerCase()}`}>
                                {p.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No parameters entered yet.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Right-Side Drawer */}
      {deletingItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setDeletingItem(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Result Entry</h3>
                <p className="text-xs text-slate-500">Confirm deletion</p>
              </div>

              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <WarningAmberOutlinedIcon className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800">
                  <p className="font-semibold text-sm mb-1">Are you sure you want to delete this result entry?</p>
                  <p>This action cannot be undone. Any recorded values will be discarded.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sample ID:</span>
                  <span className="font-mono font-bold text-slate-900">{deletingItem.sampleId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="text-slate-700">{deletingItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analyzer:</span>
                  <span className="text-slate-700">{deletingItem.analyzer}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultEntry;

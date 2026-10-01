import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredResults,
  saveResultsStore,
  type TestResultItem,
} from "./resultsData";
import {
  getStoredNotifications,
  saveNotifications,
  type NotificationLogItem,
} from "../notifications/notificationsData";
import "./results.css";

const VerifiedResults: React.FC = () => {
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [printItem, setPrintItem] = useState<TestResultItem | null>(null);
  const [viewItem, setViewItem] = useState<TestResultItem | null>(null);
  const [editItem, setEditItem] = useState<TestResultItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TestResultItem | null>(null);
  const [amendmentNote, setAmendmentNote] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setResults(getStoredResults());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const verifiedList = useMemo(() => {
    return results.filter((r) => r.status === "VERIFIED");
  }, [results]);

  const filteredList = useMemo(() => {
    return verifiedList.filter((item) => {
      const matchSearch =
        item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.verifiedBy && item.verifiedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = departmentFilter === "All" || item.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [verifiedList, searchTerm, departmentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  const confirmDelete = () => {
    if (!deletingItem) return;
    const updated = results.filter((r) => r.id !== deletingItem.id);
    setResults(updated);
    saveResultsStore(updated);
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  // Dispatch Report Notification
  const handleDispatchNotification = (item: TestResultItem) => {
    const currentLogs = getStoredNotifications();
    const newLog: NotificationLogItem = {
      id: `NOTIF-${Date.now()}`,
      notificationCode: `NTF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventType: "Report Shared",
      channel: "WhatsApp",
      recipientType: "Patient",
      recipientName: item.patientName,
      recipientContact: item.phone,
      referenceId: item.id,
      subject: `Diagnostic Report: ${item.testName}`,
      messagePreview: `Dear ${item.patientName}, your verified report for ${item.testName} has been generated and dispatched by Lax360 Diagnostic Center. Access: https://lax360.med/report/${item.id}`,
      sentDate: getFormattedCurrentDate(),
      sentTime: getFormattedCurrentTime(),
      deliveryStatus: "Delivered",
      deliveredAt: getFormattedCurrentTime(),
    };

    saveNotifications([newLog, ...currentLogs]);
    showToast(`WhatsApp report notification sent to ${item.patientName} (${item.phone})!`);
  };

  const handleSaveAmendment = () => {
    if (!editItem) return;
    const updated = results.map((r) =>
      r.id === editItem.id
        ? {
            ...r,
            notes: amendmentNote ? `${r.notes || ""} | Addendum: ${amendmentNote}` : r.notes,
          }
        : r
    );
    setResults(updated);
    saveResultsStore(updated);
    setEditItem(null);
    setAmendmentNote("");
    showToast("Report addendum note saved successfully.");
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const columns = [
    "Sample ID",
    "Accession ID",
    "Patient Name",
    "Test Name",
    "Department",
    "Verified By",
    "Verified Date & Time",
    "Report Status",
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <CheckCircleOutlineOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verified Results
            </h1>
            <p className="text-sm text-slate-500">
              Repository of medically authorized, signed diagnostic reports ready for printing and dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2">
          <span className="text-xs font-semibold text-purple-800">
            Total Verified: {verifiedList.length} Reports
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search by sample ID, patient, test, verifier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-purple-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FilterListIcon className="text-slate-400" fontSize="small" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-purple-500"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
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

              {/* Patient Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.patientName}</div>
                <div className="text-[11px] text-slate-400">{item.age} yrs • {item.gender}</div>
              </td>

              {/* Test Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-medium text-slate-800 text-xs">
                {item.testName}
              </td>

              {/* Department */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {item.department}
                </span>
              </td>

              {/* Verified By */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-medium text-slate-800">
                {item.verifiedBy || "Dr. Ananya Swaminathan, MD"}
              </td>

              {/* Verified Date & Time */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                {item.verifiedAt || `${item.completedDate}, ${item.completedTime}`}
              </td>

              {/* Report Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                  {item.reportStatus || "Generated"}
                </span>
              </td>

              {/* Actions: View, Print, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrintItem(item)}
                    className="rounded-lg p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                    title="Print Diagnostic Report"
                  >
                    <PrintOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchNotification(item)}
                    className="rounded-lg p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                    title="Send WhatsApp Report Link"
                  >
                    <ShareOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                    title="View Parameters"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditItem(item);
                      setAmendmentNote("");
                    }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                    title="Add Clinical Addendum"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Verified Record"
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

      {/* Printable Report Modal */}
      {printItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl p-6 sm:p-8 space-y-6 my-6 print:m-0 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <span className="text-sm font-bold text-slate-900">Diagnostic Investigation Report Preview</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  <PrintOutlinedIcon fontSize="small" />
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintItem(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="border-2 border-slate-900 p-6 rounded-xl space-y-6 text-slate-950 font-medium">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-slate-950">LAX360 CLINICAL LABS</h2>
                  <p className="text-xs text-slate-700 font-semibold">NABL Accredited & ISO 15189 Certified Medical Laboratory</p>
                  <p className="text-xs text-slate-600">42, Healthcare Avenue, Guindy, Chennai - 600032 • Ph: +91 44 2233 4455</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 rounded">FINAL REPORT</span>
                  <p className="text-xs font-mono font-bold mt-1 text-slate-800">REF: {printItem.id}</p>
                </div>
              </div>

              {/* Patient Meta Block */}
              <div className="grid grid-cols-2 gap-4 border border-slate-400 p-3 rounded-lg text-xs bg-slate-50/50">
                <div>
                  <p><span className="font-bold text-slate-600">Patient Name:</span> <span className="font-black text-slate-950 text-sm">{printItem.patientName}</span></p>
                  <p><span className="font-bold text-slate-600">Patient ID:</span> <span className="font-mono font-bold">{printItem.patientId}</span></p>
                  <p><span className="font-bold text-slate-600">Age / Gender:</span> {printItem.age} Years / {printItem.gender}</p>
                  <p><span className="font-bold text-slate-600">Contact:</span> {printItem.phone}</p>
                </div>
                <div>
                  <p><span className="font-bold text-slate-600">Sample ID:</span> <span className="font-mono font-bold text-blue-700">{printItem.sampleId}</span></p>
                  <p><span className="font-bold text-slate-600">Accession No:</span> <span className="font-mono font-bold">{printItem.accessionId}</span></p>
                  <p><span className="font-bold text-slate-600">Sample Type:</span> {printItem.sampleType}</p>
                  <p><span className="font-bold text-slate-600">Report Date:</span> {printItem.verifiedAt || `${printItem.completedDate}, ${printItem.completedTime}`}</p>
                </div>
              </div>

              {/* Test Name Header */}
              <div className="border-b border-slate-400 pb-1">
                <h3 className="text-base font-black text-slate-950 uppercase">{printItem.testName} ({printItem.department})</h3>
                <p className="text-xs text-slate-600">Methodology: Automated Analyzers ({printItem.analyzer})</p>
              </div>

              {/* Parameter Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-950 font-black">
                    <th className="py-2 px-2">Investigation</th>
                    <th className="py-2 px-2 text-center">Result</th>
                    <th className="py-2 px-2 text-center">Unit</th>
                    <th className="py-2 px-2 text-center">Biological Reference</th>
                    <th className="py-2 px-2 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {printItem.parameters.map((p) => (
                    <tr key={p.code}>
                      <td className="py-2 px-2 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2 px-2 text-center font-black text-slate-950 text-sm">{p.value}</td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{p.unit}</td>
                      <td className="py-2 px-2 text-center font-mono font-semibold text-slate-700">{p.referenceRange}</td>
                      <td className="py-2 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                          p.flag === "Normal"
                            ? "text-emerald-800 bg-emerald-50"
                            : p.flag === "Critical"
                            ? "text-rose-900 bg-rose-100 font-extrabold"
                            : "text-amber-800 bg-amber-50 font-bold"
                        }`}>
                          {p.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Clinical Notes & Interpretation */}
              {printItem.notes && (
                <div className="border border-slate-300 p-3 rounded-lg text-xs bg-slate-50">
                  <span className="font-black text-slate-950 block">Clinical Interpretation / Notes:</span>
                  <p className="mt-0.5 text-slate-800">{printItem.notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-400 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-600">Sample Analyzed By:</p>
                  <p className="font-black text-slate-950">{printItem.technician}</p>
                  <p className="text-[11px] text-slate-500">Certified Medical Technologist</p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-emerald-700 text-xs font-black border border-emerald-500 bg-emerald-50 px-2 py-0.5 rounded inline-block mb-1">
                    DIGITALLY SIGNED & VERIFIED
                  </div>
                  <p className="font-black text-slate-950 text-sm">{printItem.verifiedBy || "Dr. Ananya Swaminathan, MD"}</p>
                  <p className="text-[11px] text-slate-600 font-semibold">Consultant Pathologist & Lab Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Addendum Right-Side Drawer */}
      {editItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditItem(null)}
          />

          {/* Right-Side Drawer */}
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Addendum Note
                </h3>
                <p className="text-xs text-slate-500">
                  Sample: {editItem.sampleId} • {editItem.patientName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditItem(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="font-semibold text-slate-800">{editItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium text-slate-700">{editItem.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-blue-600">{editItem.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status (By):</span>
                  <span className="font-medium text-purple-700">{editItem.verifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Report Status:</span>
                  <span className="font-medium text-emerald-600">{editItem.reportStatus || "Generated"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Addendum / Clinical Remark Notes
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Verified records cannot alter raw parameter measurements directly. Enter authorized clinical addendum notes below:
                </p>
                <textarea
                  rows={6}
                  value={amendmentNote}
                  onChange={(e) => setAmendmentNote(e.target.value)}
                  placeholder="e.g. Telephonically informed treating physician at 10:30 AM regarding observed values."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAmendment}
                className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Parameters Right-Side Drawer */}
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
                  Verified Record: {viewItem.sampleId}
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
                <div><span className="text-slate-400">Patient:</span> <span className="font-semibold text-slate-900">{viewItem.patientName}</span></div>
                <div><span className="text-slate-400">Verified By:</span> <span className="font-semibold text-purple-700">{viewItem.verifiedBy}</span></div>
                <div><span className="text-slate-400">Test:</span> <span className="font-semibold text-slate-900">{viewItem.testName}</span></div>
                <div><span className="text-slate-400">Verified At:</span> <span className="font-semibold text-slate-700">{viewItem.verifiedAt}</span></div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Parameter Measurements</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Parameter</th>
                        <th className="px-3 py-2 text-center">Value</th>
                        <th className="px-3 py-2 text-center">Unit</th>
                        <th className="px-3 py-2 text-center">Ref Range</th>
                        <th className="px-3 py-2 text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewItem.parameters.map((p) => (
                        <tr key={p.code}>
                          <td className="px-3 py-1.5 font-medium">{p.name}</td>
                          <td className="px-3 py-1.5 text-center font-bold">{p.value}</td>
                          <td className="px-3 py-1.5 text-center text-slate-500">{p.unit}</td>
                          <td className="px-3 py-1.5 text-center text-slate-500 font-mono">{p.referenceRange}</td>
                          <td className="px-3 py-1.5 text-right">
                            <span className={`flag-pill results-badge-${p.flag.toLowerCase()}`}>{p.flag}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <h3 className="text-base font-bold text-slate-900">Delete Verified Record</h3>
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
                  <p className="font-semibold text-sm mb-1">Are you sure you want to delete this verified result from archive?</p>
                  <p>This action will archive and delete the record permanently from the verified results list.</p>
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
                  <span className="text-slate-500">Verified By:</span>
                  <span className="text-slate-700">{deletingItem.verifiedBy}</span>
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

export default VerifiedResults;


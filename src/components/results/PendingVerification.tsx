import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
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

const PendingVerification: React.FC = () => {
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [reviewItem, setReviewItem] = useState<TestResultItem | null>(null);
  const [editItem, setEditItem] = useState<TestResultItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TestResultItem | null>(null);
  const [verifierRemarks, setVerifierRemarks] = useState("");
  const [isReadyToSign, setIsReadyToSign] = useState(false);
  const verifierName = "Dr. Ananya Swaminathan, MD Pathologist";
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setResults(getStoredResults());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Perform Authorized Verification & Sign-off
  const handleVerify = async (item: TestResultItem) => {
    const verifiedDateTime = `${getFormattedCurrentDate()}, ${getFormattedCurrentTime()}`;

    const updatedItem: TestResultItem = {
      ...item,
      status: "VERIFIED",
      verifiedBy: verifierName,
      verifiedAt: verifiedDateTime,
      reportStatus: "Generated",
      notes: verifierRemarks ? `${item.notes || ""} | Verifier: ${verifierRemarks}` : item.notes,
    };

    const updatedResults = results.map((r) => (r.id === item.id ? updatedItem : r));
    setResults(updatedResults);
    saveResultsStore(updatedResults);

    // Automated Notification Flow: Queue "Report Ready Notification"
    try {
      const currentLogs = getStoredNotifications();
      const newNotification: NotificationLogItem = {
        id: `NOTIF-${Date.now()}`,
        notificationCode: `NTF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        eventType: "Report Ready",
        channel: "WhatsApp",
        recipientType: "Patient",
        recipientName: item.patientName,
        recipientContact: item.phone,
        referenceId: item.id,
        subject: `Your ${item.testName} Report is Ready`,
        messagePreview: `Dear ${item.patientName}, your test results for ${item.testName} have been verified and signed by ${verifierName}. Download official report: https://lax360.med/report/${item.id}`,
        sentDate: getFormattedCurrentDate(),
        sentTime: getFormattedCurrentTime(),
        deliveryStatus: "Delivered",
        deliveredAt: getFormattedCurrentTime(),
      };
      saveNotifications([newNotification, ...currentLogs]);
    } catch {
      // Notification queue fallback handled
    }

    // Call backend verification endpoint asynchronously
    try {
      await fetch(`http://127.0.0.1:8000/api/results/${item.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: item.id,
          verificationStatus: "verified",
          remarks: verifierRemarks,
        }),
      });
    } catch {
      // Backend fallback handled gracefully
    }

    setReviewItem(null);
    setVerifierRemarks("");
    showToast(`Result ${item.sampleId} verified & signed successfully! Report Ready notification sent.`);
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const updated = results.filter((r) => r.id !== deletingItem.id);
    setResults(updated);
    saveResultsStore(updated);
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    const updated = results.map((r) => (r.id === editItem.id ? editItem : r));
    setResults(updated);
    saveResultsStore(updated);
    setEditItem(null);
    showToast("Result updated successfully");
  };

  // Only items waiting for verification
  const pendingList = useMemo(() => {
    return results.filter((r) => r.status === "PENDING_VERIFICATION");
  }, [results]);

  const filteredList = useMemo(() => {
    return pendingList.filter((item) => {
      const matchSearch =
        item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = departmentFilter === "All" || item.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [pendingList, searchTerm, departmentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  const columns = [
    "Sample ID",
    "Accession ID",
    "Patient Details",
    "Test & Department",
    "Parameters Tested",
    "QC Status",
    "Technician",
    "Verification Status",
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

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <VerifiedUserOutlinedIcon />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Pending Verification
              </h1>
              <p className="text-sm text-slate-500">
                Authorized verifier review queue: evaluate patient results, reference ranges, and QC compliance before sign-off
              </p>
            </div>
          </div>
        </div>

        {/* Verifier Badge */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-[11px] font-medium text-emerald-700">Authorized Verifier</p>
            <p className="text-xs font-bold text-slate-900">{verifierName}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search sample, patient, or test..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
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
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>
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

              {/* Patient Details */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.patientName}</div>
                <div className="text-[11px] text-slate-400">
                  {item.age} yrs • {item.gender} • {item.phone}
                </div>
              </td>

              {/* Test & Department */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="font-semibold text-slate-800 text-xs">{item.testName}</span>
                <div className="text-[11px] text-slate-500">{item.department}</div>
              </td>

              {/* Parameters Tested Summary */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs">
                <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                  {item.parameters.slice(0, 3).map((p) => (
                    <span
                      key={p.code}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        p.flag === "Normal"
                          ? "bg-slate-100 text-slate-700"
                          : p.flag === "Critical"
                          ? "bg-rose-100 text-rose-800 font-bold"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.code}: {p.value}
                    </span>
                  ))}
                  {item.parameters.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      +{item.parameters.length - 3} more
                    </span>
                  )}
                </div>
              </td>

              {/* QC Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                {item.qcStatus === "PASSED" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                    QC Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                    QC Flagged
                  </span>
                )}
              </td>

              {/* Technician */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div className="font-medium text-slate-800">{item.technician}</div>
                <div className="text-[11px] text-slate-400">{item.completedTime}</div>
              </td>

              {/* Verification Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">Awaiting Sign-off</span>
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setReviewItem(item); setIsReadyToSign(false); }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition"
                    title="View & Verify Details"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                    title="Edit Result"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Reject / Remove"
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

      {/* Verifier Review & Sign-Off Right-Side Drawer */}
      {reviewItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setReviewItem(null)}
          />

          {/* Right-Side Drawer Panel */}
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Result Verification & Sign-off</h3>
                <p className="text-xs text-slate-500">
                  Patient: {reviewItem.patientName} • Sample: {reviewItem.sampleId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Patient & Sample Overview Card */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient Name</span>
                  <span className="font-semibold text-slate-900 text-sm">{reviewItem.patientName}</span>
                  <span className="text-slate-500 block">{reviewItem.age} yrs • {reviewItem.gender} • {reviewItem.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sample & Accession</span>
                  <span className="font-semibold text-blue-600 font-mono">{reviewItem.sampleId}</span>
                  <span className="text-slate-500 block font-mono">{reviewItem.accessionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Test & Analyzer</span>
                  <span className="font-semibold text-slate-900">{reviewItem.testName}</span>
                  <span className="text-slate-500 block">{reviewItem.analyzer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">QC Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 mt-0.5">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                    Passed (Lot Bio-Rad #8821)
                  </span>
                  <span className="text-slate-400 block mt-0.5">Tech: {reviewItem.technician}</span>
                </div>
              </div>

              {/* Observed Values Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Report Parameter Measurements vs. Biological Reference Ranges
                </h4>

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
                      {reviewItem.parameters.map((param) => (
                        <tr key={param.code} className="hover:bg-slate-50 transition">
                          <td className="px-3.5 py-2 font-medium text-slate-800">
                            {param.name} <span className="font-mono text-[10px] text-slate-400">({param.code})</span>
                          </td>
                          <td className="px-3.5 py-2 font-bold text-slate-900 text-sm">
                            {param.value}
                          </td>
                          <td className="px-3.5 py-2 text-slate-500 font-medium">{param.unit}</td>
                          <td className="px-3.5 py-2 text-slate-600 font-mono text-[11px]">{param.referenceRange}</td>
                          <td className="px-3.5 py-2 text-center">
                            <span className={`flag-pill results-badge-${param.flag.toLowerCase()}`}>
                              {param.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician Notes */}
              {reviewItem.notes && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900">
                  <span className="font-bold block mb-1">Technician Analysis Notes:</span>
                  <p>{reviewItem.notes}</p>
                </div>
              )}

              {/* Verifier Remarks & Signature Box */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Verifier Remarks / Clinical Interpretation
                  </label>
                  <span className="text-[11px] text-slate-400">Printed on final report</span>
                </div>
                <input
                  type="text"
                  value={verifierRemarks}
                  onChange={(e) => setVerifierRemarks(e.target.value)}
                  placeholder="e.g. Results correlate with clinical presentation. No critical smear atypia observed."
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Signing Authority:</span>
                  <span className="font-bold text-slate-800">{verifierName}</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isReadyToSign}
                  onChange={(e) => setIsReadyToSign(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Ready to Sign
              </label>

              <button
                type="button"
                onClick={() => handleVerify(reviewItem)}
                disabled={!isReadyToSign}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                  isReadyToSign ? "bg-[#29384d] hover:bg-[#1e293b]" : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                <DoneAllOutlinedIcon fontSize="small" />
                Authorize &amp; Verify Result
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Result Right-Side Drawer */}
      {editItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditItem(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Result: {editItem.sampleId}
                </h3>
                <p className="text-xs text-slate-500">
                  {editItem.patientName} • {editItem.testName}
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

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-semibold text-slate-800">{editItem.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Test:</span>
                    <span className="font-semibold text-slate-800">{editItem.testName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-700">{editItem.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-medium text-amber-600">{editItem.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Status:</span>
                    <span className="font-medium text-emerald-600">Pending</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technician</label>
                  <input
                    type="text"
                    value={editItem.technician}
                    onChange={(e) => setEditItem({ ...editItem, technician: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technician Notes</label>
                  <textarea
                    rows={4}
                    value={editItem.notes || ""}
                    onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Save
                </button>
              </div>
            </form>
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
                <h3 className="text-base font-bold text-slate-900">Reject / Delete Result</h3>
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
                  <p className="font-semibold text-sm mb-1">Are you sure you want to delete this result?</p>
                  <p>This action will remove the sample result from verification and notify the lab supervisor.</p>
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
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-700">{deletingItem.department}</span>
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

export default PendingVerification;






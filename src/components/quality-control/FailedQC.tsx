import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredFailedQC,
  saveFailedQC,
  getStoredCAPA,
  saveCAPA,
  type QCFailedItem,
  type CorrectiveActionRecord,
} from "./qcData";
import "./qualityControl.css";

const FailedQC: React.FC = () => {
  const navigate = useNavigate();
  const [failedList, setFailedList] = useState<QCFailedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewItem, setViewItem] = useState<QCFailedItem | null>(null);
  const [editItem, setEditItem] = useState<QCFailedItem | null>(null);
  const [editRootCause, setEditRootCause] = useState<CorrectiveActionRecord["rootCauseCategory"]>("Calibration Drift");
  const [editActionTaken, setEditActionTaken] = useState("Analyzer inspection & recalibration completed.");
  const [deletingItem, setDeletingItem] = useState<QCFailedItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setFailedList(getStoredFailedQC());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const updated = failedList.filter((f) => f.id !== deletingItem.id);
    setFailedList(updated);
    saveFailedQC(updated);
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  // Correct status and move to Corrective Actions (CAPA)
  const handleCorrectAndMove = (
    item: QCFailedItem,
    rootCauseCategory?: CorrectiveActionRecord["rootCauseCategory"],
    actionNotes?: string
  ) => {
    const newCapa: CorrectiveActionRecord = {
      id: `CAPA-${Date.now()}`,
      capaNumber: `CAPA-2026-0${Math.floor(10 + Math.random() * 90)}`,
      failedQcId: item.id,
      qcRunId: item.qcRunId,
      analyzerName: item.analyzerName,
      testName: item.testName,
      identifiedIssue: item.violationRule,
      rootCauseCategory: rootCauseCategory || "Calibration Drift",
      rootCauseDetails: `Corrected incident ${item.id} from Failed QC. Target mean: ${item.targetMean}, Measured: ${item.measuredValue} (Deviation: ${item.zScore} SD).`,
      actionTaken: actionNotes || "Analyzer recalibration performed. Corrective action in progress.",
      repeatRunValue: Number(item.targetMean),
      repeatRunStatus: "Retest Required",
      reanalysisAuthorized: false,
      releasedSampleIds: item.affectedSampleIds && item.affectedSampleIds.length > 0 ? item.affectedSampleIds : ["SMP-HOLD-01"],
      investigatedBy: item.technician || "Quality Manager",
      actionDate: getFormattedCurrentDate(),
      actionTime: getFormattedCurrentTime(),
      approvalStatus: "Pending Review",
    };

    const currentCapa = getStoredCAPA();
    saveCAPA([newCapa, ...currentCapa]);

    const updated = failedList.filter((f) => f.id !== item.id);
    setFailedList(updated);
    saveFailedQC(updated);

    if (editItem) setEditItem(null);

    showToast(`Status corrected! Incident ${item.id} moved to Corrective Actions (${newCapa.capaNumber}).`);
    setTimeout(() => {
      navigate("/quality-control/corrective-actions");
    }, 600);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    if (editItem.status !== "Action Required") {
      // Status was corrected! Move to Corrective Actions
      handleCorrectAndMove(editItem, editRootCause, editActionTaken);
      return;
    }

    const updated = failedList.map((f) => (f.id === editItem.id ? editItem : f));
    setFailedList(updated);
    saveFailedQC(updated);
    setEditItem(null);
    showToast("Incident status updated.");
  };

  const filteredData = useMemo(() => {
    return failedList.filter((item) => {
      return (
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.analyzerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.controlLot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.violationRule.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [failedList, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const columns = [
    "Incident ID",
    "Test & Investigation",
    "Analyzer Affected",
    "Control Lot",
    "Violation Rule",
    "Z-Score Deviation",
    "Samples on Hold",
    "Reported At",
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <ReportProblemOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Failed QC Incidents (Sample Hold)
            </h1>
            <p className="text-sm text-slate-500">
              Analytical runs that violated Westgard rejection limits: sample verification is locked until CAPA resolution
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/quality-control/corrective-actions")}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
        >
          <BuildCircleOutlinedIcon fontSize="small" />
          View Corrective Actions (CAPA)
        </button>
      </div>

      {/* Information Banner */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
        <ReportProblemOutlinedIcon className="text-rose-600 mt-0.5" />
        <div className="text-xs text-rose-900">
          <p className="font-bold">Quality Control Policy: Analytical Lock Active</p>
          <p className="mt-0.5 text-rose-700">
            When an analyzer fails QC (e.g. 1-3s or 2-2s rule), patient sample results cannot proceed to verification. Complete root cause analysis, perform repeat QC, and authorize re-analysis in Corrective Actions.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search by test, analyzer, or rule violation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: QCFailedItem) => (
            <>
              {/* Incident ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-semibold text-rose-700 text-xs">
                {item.id}
              </td>

              {/* Test Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-semibold text-slate-900 text-xs">
                {item.testName}
              </td>

              {/* Analyzer */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-800 font-medium">
                {item.analyzerName}
              </td>

              {/* Control Lot */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-600">
                {item.controlLot}
              </td>

              {/* Violation Rule */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-rose-800">
                {item.violationRule}
              </td>

              {/* Z-Score */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-black text-rose-600 text-xs">
                {item.zScore > 0 ? `+${item.zScore}` : item.zScore} SD
              </td>

              {/* Samples on Hold */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                  {item.affectedSamplesCount} Samples Held
                </span>
              </td>

              {/* Reported At */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div>{item.failedTime}</div>
                <div className="text-[11px] text-slate-400">{item.failedDate}</div>
              </td>

              {/* Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    item.status === "Action Required"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                    onClick={() => handleCorrectAndMove(item)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-300 shadow-sm transition"
                    title="Correct status and move to Corrective Actions (CAPA)"
                  >
                    <BuildCircleOutlinedIcon sx={{ fontSize: 14 }} />
                    Correct &rarr; CAPA
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                    title="View Incident Details"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Edit Status"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Dismiss Incident"
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
            totalItems={filteredData.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* View Incident Right-Side Drawer */}
      {viewItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setViewItem(null)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">QC Failure Incident: {viewItem.id}</h3>
                  <p className="text-xs text-slate-500">{viewItem.testName} • {viewItem.analyzerName}</p>
                </div>
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
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="font-semibold text-slate-800">{viewItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analyzer:</span>
                  <span className="font-semibold text-slate-800">{viewItem.analyzerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Control Lot:</span>
                  <span className="font-mono text-slate-800">{viewItem.controlLot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician:</span>
                  <span className="text-slate-800 font-medium">{viewItem.technician}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Mean vs Measured:</span>
                  <span className="font-bold text-rose-700">{viewItem.targetMean} vs {viewItem.measuredValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Z-Score:</span>
                  <span className="font-mono font-bold text-rose-600">{viewItem.zScore > 0 ? `+${viewItem.zScore}` : viewItem.zScore} SD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported At:</span>
                  <span className="text-slate-700">{viewItem.failedDate} {viewItem.failedTime}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Violation Rule</label>
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 font-semibold">{viewItem.violationRule}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Samples on Hold</label>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-slate-800">{viewItem.affectedSampleIds.join(", ")}</p>
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

      {/* Edit Incident Right-Side Drawer */}
      {editItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditItem(null)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Update Incident: {editItem.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editItem.testName} • {editItem.analyzerName}
                  </p>
                </div>
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
                {/* Meta details */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Violation Rule:</span>
                    <span className="font-semibold text-rose-700">{editItem.violationRule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target vs Measured:</span>
                    <span className="font-mono text-slate-800">{editItem.targetMean} vs <strong className="text-rose-600">{editItem.measuredValue}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affected Samples:</span>
                    <span className="font-mono text-slate-800">{editItem.affectedSampleIds.join(", ")}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incident Status</label>
                  <select
                    value={editItem.status}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-semibold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Action Required">Action Required (Keep in Failed QC)</option>
                    <option value="Under Investigation">Under Investigation (Move to Corrective Actions)</option>
                    <option value="Resolved">Resolved / Corrected (Move to Corrective Actions)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Correcting status will automatically route this incident to Corrective Actions (CAPA) for recalibration and repeat QC.
                  </p>
                </div>

                {editItem.status !== "Action Required" && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Root Cause Category</label>
                      <select
                        value={editRootCause}
                        onChange={(e) => setEditRootCause(e.target.value as any)}
                        className="w-full h-10 rounded-xl border border-slate-300 px-3 font-semibold text-slate-800 outline-none focus:border-teal-500"
                      >
                        <option value="Calibration Drift">Calibration Drift</option>
                        <option value="Reagent Deterioration">Reagent Deterioration</option>
                        <option value="Optical / Lamp Error">Optical / Lamp Error</option>
                        <option value="Temperature Fluctuation">Temperature Fluctuation</option>
                        <option value="Pipette Calibration">Pipette Calibration</option>
                        <option value="Mechanical Alignment">Mechanical Alignment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Corrective Action Details</label>
                      <textarea
                        rows={2}
                        value={editActionTaken}
                        onChange={(e) => setEditActionTaken(e.target.value)}
                        placeholder="Action taken to correct this issue..."
                        className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800 outline-none focus:border-teal-500"
                      />
                    </div>
                  </>
                )}
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
                  {editItem.status !== "Action Required" ? "Correct & Move to Corrective" : "Save"}
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

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dismiss QC Incident</h3>
                  <p className="text-xs text-slate-500">Confirm deletion</p>
                </div>
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
                  <p className="font-semibold text-sm mb-1">Are you sure you want to dismiss this failed QC item?</p>
                  <p>This action cannot be undone. Any held sample verification locks will be audited.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Incident ID:</span>
                  <span className="font-mono font-bold text-slate-900">{deletingItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analyzer:</span>
                  <span className="text-slate-700">{deletingItem.analyzerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Violation:</span>
                  <span className="text-rose-700 font-semibold">{deletingItem.violationRule}</span>
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

export default FailedQC;

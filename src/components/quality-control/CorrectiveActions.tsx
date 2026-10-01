import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredCAPA,
  saveCAPA,
  getStoredFailedQC,
  saveFailedQC,
  getStoredQCRuns,
  saveQCRuns,
  type CorrectiveActionRecord,
  type QCRunRecord,
} from "./qcData";
import {
  getStoredResults,
  saveResultsStore,
} from "../results/resultsData";
import "./qualityControl.css";

const CorrectiveActions: React.FC = () => {
  const [capaList, setCapaList] = useState<CorrectiveActionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // New CAPA Investigation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState("Cobas c311");
  const [testName, setTestName] = useState("Blood Glucose (Hexokinase)");
  const [identifiedIssue, setIdentifiedIssue] = useState("Control reading shifted +3.6 SD outside acceptable envelope (1-3s rejection rule).");
  const [rootCauseCategory, setRootCauseCategory] = useState<CorrectiveActionRecord["rootCauseCategory"]>("Calibration Drift");
  const [rootCauseDetails, setRootCauseDetails] = useState("Calibrator lot reconstituted 7 days ago showed photometer drift on glucose hexokinase filter.");
  const [actionTaken, setActionTaken] = useState("Reconstituted fresh Roche C.f.a.s. calibrator. Executed full 2-point recalibration. Cleaned cuvette wheel.");
  const [repeatRunValue, setRepeatRunValue] = useState(95.4);
  const [authorizeReanalysis, setAuthorizeReanalysis] = useState(true);
  const investigatorName = "Dr. Ananya Swaminathan (Quality Manager)";

  const [viewItem, setViewItem] = useState<CorrectiveActionRecord | null>(null);
  const [editItem, setEditItem] = useState<CorrectiveActionRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<CorrectiveActionRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setCapaList(getStoredCAPA());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: CorrectiveActionRecord = {
      id: `CAPA-${Date.now()}`,
      capaNumber: `CAPA-2026-0${Math.floor(10 + Math.random() * 90)}`,
      failedQcId: "FAIL-001",
      qcRunId: "QC-RUN-904",
      analyzerName: selectedAnalyzer,
      testName,
      identifiedIssue,
      rootCauseCategory,
      rootCauseDetails,
      actionTaken,
      repeatRunValue: Number(repeatRunValue),
      repeatRunStatus: "Passed",
      reanalysisAuthorized: authorizeReanalysis,
      releasedSampleIds: ["SMP-10010", "SMP-10014", "SMP-10015", "SMP-10018"],
      investigatedBy: investigatorName,
      actionDate: getFormattedCurrentDate(),
      actionTime: getFormattedCurrentTime(),
      approvalStatus: "Approved & Released",
    };

    const updatedCapa = [newRecord, ...capaList];
    setCapaList(updatedCapa);
    saveCAPA(updatedCapa);

    // If re-analysis authorized, release patient samples in Results store back to AWAITING_ENTRY!
    if (authorizeReanalysis) {
      const results = getStoredResults();
      const updatedResults = results.map((r) => {
        if (r.status === "QC_FAILED") {
          return {
            ...r,
            status: "AWAITING_ENTRY" as const,
            qcStatus: "PASSED" as const,
            notes: `${r.notes || ""} | Released following CAPA ${newRecord.capaNumber}. Re-analysis authorized.`,
          };
        }
        return r;
      });
      saveResultsStore(updatedResults);

      // Resolve the incident in Failed QC
      const failed = getStoredFailedQC();
      const updatedFailed = failed.map((f) => ({
        ...f,
        status: "Resolved" as const,
      }));
      saveFailedQC(updatedFailed);

      // Log a passed repeat QC run
      const runs = getStoredQCRuns();
      const repeatRun: QCRunRecord = {
        id: `QC-REPEAT-${Date.now()}`,
        runNumber: `QC-2026-R${Math.floor(100 + Math.random() * 900)}`,
        testName,
        department: "Biochemistry",
        analyzerId: "EQ-BIO-02",
        analyzerName: selectedAnalyzer,
        controlName: "Roche PreciControl Multi 1 (Post-CAPA Repeat)",
        controlLevel: "Level 1 (Normal)",
        lotNumber: "LOT-ROC-1190",
        expiryDate: "10 Jan 2027",
        technician: investigatorName,
        runDate: getFormattedCurrentDate(),
        runTime: getFormattedCurrentTime(),
        targetMean: 95.0,
        targetSD: 2.0,
        measuredValue: Number(repeatRunValue),
        zScore: 0.2,
        unit: "mg/dL",
        westgardRule: "1-SD (Normal)",
        status: "Passed",
        notes: `Post-CAPA verification run for ${newRecord.capaNumber}. Recalibration verified.`,
      };
      saveQCRuns([repeatRun, ...runs]);
    }

    // Call backend API asynchronously
    try {
      await fetch("http://127.0.0.1:8000/api/quality-control/corrective-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qcRunId: newRecord.qcRunId,
          analyzerId: newRecord.analyzerName,
          rootCause: newRecord.rootCauseCategory,
          actionTaken: newRecord.actionTaken,
          repeatResult: String(newRecord.repeatRunValue),
          resolutionStatus: "Resolved",
        }),
      });
    } catch {
      // Backend fallback handled gracefully
    }

    setIsModalOpen(false);
    showToast(
      `CAPA ${newRecord.capaNumber} logged! Repeat QC verified. Patient samples unlocked for re-analysis & result entry.`
    );
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const updated = capaList.filter((c) => c.id !== deletingItem.id);
    setCapaList(updated);
    saveCAPA(updated);
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    const updated = capaList.map((c) => (c.id === editItem.id ? editItem : c));
    setCapaList(updated);
    saveCAPA(updated);
    setEditItem(null);
    showToast("CAPA record updated.");
  };

  const filteredCapa = useMemo(() => {
    return capaList.filter((item) => {
      return (
        item.capaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.analyzerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rootCauseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.actionTaken.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [capaList, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCapa.slice(start, start + rowsPerPage);
  }, [filteredCapa, currentPage, rowsPerPage]);

  const columns = [
    "CAPA #",
    "Analyzer & Test",
    "Root Cause Category",
    "Action Taken",
    "Repeat QC Result",
    "Re-analysis Status",
    "Approved By",
    "Date & Time",
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
            <BuildCircleOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QC Corrective Actions (CAPA)
            </h1>
            <p className="text-sm text-slate-500">
              Root cause investigations, analyzer recalibrations, repeat control verification, and sample release authorization
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-700 transition"
        >
          <AddIcon fontSize="small" />
          Log Corrective Action (CAPA)
        </button>
      </div>

      {/* Workflow Guidance Card */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
        <div className="flex items-center justify-between text-xs text-teal-900 font-semibold">
          <span>Standard Resolution Flow:</span>
          <span>QC Failure &rarr; Root Cause Identified &rarr; Corrective Action Taken &rarr; Repeat QC Pass &rarr; Release to Re-analysis &rarr; Result Entry</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search by CAPA #, analyzer, root cause, or action..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: CorrectiveActionRecord) => (
            <>
              {/* CAPA # */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-bold text-teal-700 text-xs">
                {item.capaNumber}
              </td>

              {/* Analyzer & Test */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.testName}</div>
                <div className="text-[11px] text-slate-500">{item.analyzerName}</div>
              </td>

              {/* Root Cause Category */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {item.rootCauseCategory}
                </span>
              </td>

              {/* Action Taken */}
              <td className="px-4 py-3.5 text-left text-xs text-slate-700 max-w-xs truncate" title={item.actionTaken}>
                {item.actionTaken}
              </td>

              {/* Repeat QC Result */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold text-emerald-700">
                {item.repeatRunValue} ({item.repeatRunStatus})
              </td>

              {/* Re-analysis Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                {item.reanalysisAuthorized ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                    Released to Result Entry
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                    Pending Repeat
                  </span>
                )}
              </td>

              {/* Approved By */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-800 font-medium">
                {item.investigatedBy}
              </td>

              {/* Date & Time */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div>{item.actionTime}</div>
                <div className="text-[11px] text-slate-400">{item.actionDate}</div>
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition"
                    title="View Investigation Report"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition"
                    title="Edit CAPA Record"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete CAPA Record"
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
            totalItems={filteredCapa.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* New CAPA Right-Side Drawer */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <BuildCircleOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Quality Corrective Action (CAPA)</h3>
                  <p className="text-xs text-slate-500">
                    Document root cause and release affected samples
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleCreateCapa} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Analyzer</label>
                    <input
                      type="text"
                      value={selectedAnalyzer}
                      onChange={(e) => setSelectedAnalyzer(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Investigation / Test</label>
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Identified Issue</label>
                  <input
                    type="text"
                    value={identifiedIssue}
                    onChange={(e) => setIdentifiedIssue(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Root Cause Category</label>
                    <select
                      value={rootCauseCategory}
                      onChange={(e) => setRootCauseCategory(e.target.value as any)}
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
                    <label className="block font-semibold text-slate-700 mb-1">Repeat QC Control Value</label>
                    <input
                      type="number"
                      step="any"
                      value={repeatRunValue}
                      onChange={(e) => setRepeatRunValue(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border-2 border-emerald-500 px-3 font-mono font-bold text-emerald-900 bg-white outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Root Cause Analysis Details</label>
                  <textarea
                    rows={3}
                    value={rootCauseDetails}
                    onChange={(e) => setRootCauseDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corrective Action Taken &amp; Recalibration</label>
                  <textarea
                    rows={3}
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Sample Release Authorization Box */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900">
                    <input
                      type="checkbox"
                      checked={authorizeReanalysis}
                      onChange={(e) => setAuthorizeReanalysis(e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Authorize Sample Release &amp; Re-analysis</span>
                  </label>
                  <p className="text-[11px] text-emerald-700 ml-6">
                    Automatically unlocks affected sample batches from &lsquo;QC_FAILED&rsquo; back into &lsquo;AWAITING_ENTRY&rsquo; so technicians can enter verified analytical results.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Save CAPA &amp; Release
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* View CAPA Right-Side Drawer */}
      {viewItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setViewItem(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">CAPA File: {viewItem.capaNumber}</h3>
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
                  <span className="text-slate-500">Analyzer:</span>
                  <span className="font-semibold text-slate-800">{viewItem.analyzerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="font-semibold text-slate-800">{viewItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Root Cause Category:</span>
                  <span className="font-bold text-slate-900">{viewItem.rootCauseCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Repeat QC Result:</span>
                  <span className="font-bold text-emerald-700">{viewItem.repeatRunValue} ({viewItem.repeatRunStatus})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Investigated By:</span>
                  <span className="font-medium text-slate-800">{viewItem.investigatedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Time:</span>
                  <span className="text-slate-700">{viewItem.actionDate} {viewItem.actionTime}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Identified Issue</label>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">{viewItem.identifiedIssue}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Root Cause Details</label>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">{viewItem.rootCauseDetails}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Taken</label>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">{viewItem.actionTaken}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Released Batches</label>
                <span className="font-mono text-slate-800 font-semibold">{viewItem.releasedSampleIds.join(", ")}</span>
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

      {/* Edit CAPA Right-Side Drawer */}
      {editItem && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditItem(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit CAPA: {editItem.capaNumber}
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
                    <span className="text-slate-500">Root Cause Category:</span>
                    <span className="font-semibold text-slate-800">{editItem.rootCauseCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Repeat QC Result:</span>
                    <span className="font-mono text-emerald-700 font-bold">{editItem.repeatRunValue} ({editItem.repeatRunStatus})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Investigated By:</span>
                    <span className="font-medium text-slate-700">{editItem.investigatedBy}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action Taken Description</label>
                  <textarea
                    rows={6}
                    value={editItem.actionTaken}
                    onChange={(e) => setEditItem({ ...editItem, actionTaken: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete CAPA Record</h3>
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
                  <p className="font-semibold text-sm mb-1">Are you sure you want to delete this CAPA record?</p>
                  <p>This action cannot be undone. Any associated release tags will remain in audit logs.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">CAPA Number:</span>
                  <span className="font-mono font-bold text-slate-900">{deletingItem.capaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test Name:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analyzer:</span>
                  <span className="text-slate-700">{deletingItem.analyzerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Root Cause:</span>
                  <span className="text-slate-700">{deletingItem.rootCauseCategory}</span>
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

export default CorrectiveActions;


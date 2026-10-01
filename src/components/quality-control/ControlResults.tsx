import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { INITIAL_QC_LOTS, type QCControlLot } from "./qcData";
import "./qualityControl.css";

const ControlResults: React.FC = () => {
  const [lots, setLots] = useState<QCControlLot[]>(INITIAL_QC_LOTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedLotForChart, setSelectedLotForChart] = useState<QCControlLot>(INITIAL_QC_LOTS[0]);
  const [viewLot, setViewLot] = useState<QCControlLot | null>(null);
  const [editLot, setEditLot] = useState<QCControlLot | null>(null);
  const [deletingLot, setDeletingLot] = useState<QCControlLot | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDelete = (lot: QCControlLot) => {
    setDeletingLot(lot);
  };

  const handleConfirmDelete = () => {
    if (deletingLot) {
      setLots((prev) => prev.filter((l) => l.id !== deletingLot.id));
      setDeletingLot(null);
      showToast("Deleted successfully");
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLot) return;
    setLots(lots.map((l) => (l.id === editLot.id ? editLot : l)));
    setEditLot(null);
    showToast("Control lot details updated.");
  };

  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchSearch =
        lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.controlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = departmentFilter === "All" || lot.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [lots, searchTerm, departmentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLots.slice(start, start + rowsPerPage);
  }, [filteredLots, currentPage, rowsPerPage]);

  const columns = [
    "Lot Number",
    "Control Name",
    "Manufacturer",
    "Department",
    "Matrix Type",
    "Assigned Analyzers",
    "Expiry Date",
    "Runs Logged",
    "Mean CV %",
    "Status",
    "Actions",
  ];

  // Levey-Jennings simulated run data points across days 1 to 10
  const ljDataPoints = [
    { day: "D1", z: 0.2 },
    { day: "D2", z: -0.4 },
    { day: "D3", z: 0.8 },
    { day: "D4", z: -0.1 },
    { day: "D5", z: 1.2 },
    { day: "D6", z: 0.5 },
    { day: "D7", z: -1.1 },
    { day: "D8", z: 0.3 },
    { day: "D9", z: 0.7 },
    { day: "D10", z: 0.25 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Toast */}
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
            <AssessmentOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Control Results &amp; Levey-Jennings Analysis
            </h1>
            <p className="text-sm text-slate-500">
              Control lot stability monitoring, coefficient of variation (CV%) tracking, and statistical deviation charts
            </p>
          </div>
        </div>
      </div>

      {/* Levey-Jennings Chart Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Levey-Jennings Chart: {selectedLotForChart.controlName}
            </h3>
            <p className="text-xs text-slate-500">
              Lot: <span className="font-mono font-bold text-teal-700">{selectedLotForChart.lotNumber}</span> • Department: {selectedLotForChart.department} • Expiry: {selectedLotForChart.expiryDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Active Lot:</span>
            <select
              value={selectedLotForChart.id}
              onChange={(e) => {
                const found = lots.find((l) => l.id === e.target.value);
                if (found) setSelectedLotForChart(found);
              }}
              className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lotNumber} - {l.controlName.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Levey Jennings Visual Graphic */}
        <div className="relative h-64 w-full rounded-xl bg-slate-50 border border-slate-200 p-4 qc-chart-grid overflow-hidden">
          {/* Guide Lines */}
          <div className="absolute inset-x-4 top-4 border-b border-dashed border-rose-300 flex justify-between text-[10px] text-rose-500 font-mono">
            <span>+3 SD (Rejection Limit)</span>
            <span>+3.0</span>
          </div>

          <div className="absolute inset-x-4 top-16 border-b border-dashed border-amber-300 flex justify-between text-[10px] text-amber-500 font-mono">
            <span>+2 SD (Warning Limit)</span>
            <span>+2.0</span>
          </div>

          <div className="absolute inset-x-4 top-28 border-b border-dashed border-emerald-200 flex justify-between text-[10px] text-emerald-600 font-mono">
            <span>+1 SD</span>
            <span>+1.0</span>
          </div>

          {/* MEAN (Center Line) */}
          <div className="absolute inset-x-4 top-36 border-b-2 border-emerald-600 flex justify-between text-[10px] text-emerald-800 font-bold font-mono">
            <span>TARGET MEAN (&plusmn;0 SD)</span>
            <span>0.0</span>
          </div>

          <div className="absolute inset-x-4 top-44 border-b border-dashed border-emerald-200 flex justify-between text-[10px] text-emerald-600 font-mono">
            <span>-1 SD</span>
            <span>-1.0</span>
          </div>

          <div className="absolute inset-x-4 top-52 border-b border-dashed border-amber-300 flex justify-between text-[10px] text-amber-500 font-mono">
            <span>-2 SD (Warning Limit)</span>
            <span>-2.0</span>
          </div>

          {/* Plotted Data Points */}
          <div className="absolute inset-x-12 bottom-4 top-4 flex items-center justify-between">
            {ljDataPoints.map((pt, idx) => {
              // Convert z (-3 to +3) to height percentage: z=0 is 50%, z=+3 is 90%, z=-3 is 10%
              const topPercent = 50 - (pt.z / 3.5) * 45;

              return (
                <div key={idx} className="flex flex-col items-center group relative">
                  <div
                    style={{ top: `${topPercent}%` }}
                    className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-600 shadow-md group-hover:scale-125 transition"
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    <span>{pt.day}: {pt.z > 0 ? `+${pt.z}` : pt.z} SD</span>
                  </div>
                  <span className="absolute bottom-0 text-[10px] font-mono text-slate-500">{pt.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> &plusmn;1-SD (Optimal)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> &plusmn;2-SD (1-2s Warning)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> &plusmn;3-SD (1-3s Rejection)</span>
          </div>
          <span className="font-semibold text-slate-700">Mean CV%: {selectedLotForChart.meanCv}</span>
        </div>
      </div>

      {/* Control Lots Registry Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search by lot number, control, or manufacturer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
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
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-teal-500"
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
          renderRow={(item: QCControlLot) => (
            <>
              {/* Lot Number */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-semibold text-teal-700 text-xs">
                {item.lotNumber}
              </td>

              {/* Control Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-semibold text-slate-900 text-xs">
                {item.controlName}
              </td>

              {/* Manufacturer */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-700">
                {item.manufacturer}
              </td>

              {/* Department */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {item.department}
                </span>
              </td>

              {/* Matrix Type */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                {item.matrixType}
              </td>

              {/* Assigned Analyzers */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-700">
                {item.assignedAnalyzers.join(", ")}
              </td>

              {/* Expiry Date */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-600">
                {item.expiryDate}
              </td>

              {/* Runs Logged */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold text-slate-800">
                {item.runsCompleted} runs
              </td>

              {/* Mean CV % */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-mono font-bold text-teal-700">
                {item.meanCv}
              </td>

              {/* Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
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
                    onClick={() => {
                      setSelectedLotForChart(item);
                      setViewLot(item);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition"
                    title="View Lot & Plot Levey-Jennings"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditLot(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition"
                    title="Edit Lot Parameters"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete / Retire Lot"
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
            totalItems={filteredLots.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* View Lot Right-Side Drawer */}
      {viewLot && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Control Lot Details</h3>
                    <p className="text-xs text-slate-500">{viewLot.lotNumber} • {viewLot.controlName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewLot(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Control Name</span> <span className="font-semibold text-slate-800">{viewLot.controlName}</span></div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span> <span className="font-semibold text-slate-800">{viewLot.manufacturer}</span></div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span> <span className="font-semibold text-slate-800">{viewLot.department}</span></div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span> <span className="font-mono font-semibold text-slate-800">{viewLot.expiryDate}</span></div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Open Stability</span> <span className="text-slate-700">{viewLot.openStability}</span></div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Mean CV%</span> <span className="font-bold text-teal-700">{viewLot.meanCv}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px] uppercase font-bold">Covered Tests</span> <span className="text-slate-800 font-medium">{viewLot.testsCovered.join(", ")}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewLot(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lot Right-Side Drawer */}
      {editLot && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditLot(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Control Lot: {editLot.lotNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editLot.controlName} • {editLot.department}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditLot(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                {/* Readonly info */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Manufacturer:</span>
                    <span className="font-semibold text-slate-800">{editLot.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className="font-mono text-slate-800">{editLot.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Mean CV%:</span>
                    <span className="font-mono text-teal-700 font-bold">{editLot.meanCv}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Open Vial Stability</label>
                  <input
                    type="text"
                    value={editLot.openStability}
                    onChange={(e) => setEditLot({ ...editLot, openStability: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lot Status</label>
                  <select
                    value={editLot.status}
                    onChange={(e) => setEditLot({ ...editLot, status: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-semibold outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Exhausted">Exhausted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditLot(null)}
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

      {/* Delete Lot Right-Side Drawer */}
      {deletingLot && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Retire Control Lot</h3>
                    <p className="text-xs text-rose-600 font-medium">Confirm Permanent Action</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingLot(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} className="text-rose-600" />
                    Are you sure you want to retire this control lot?
                  </p>
                  <p className="text-rose-600">
                    This action will permanently retire this control lot from the active analyzer calibration registry.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lot Number</span>
                    <span className="text-sm font-bold text-slate-900">{deletingLot.lotNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Control Name</span>
                    <span className="font-semibold text-slate-800">{deletingLot.controlName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                      <span className="font-semibold text-slate-800">{deletingLot.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                      <span className="font-semibold text-slate-800">{deletingLot.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setDeletingLot(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ControlResults;

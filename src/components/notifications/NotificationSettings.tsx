import React, { useState, useMemo } from "react";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import {
  INITIAL_GATEWAY_SETTINGS,
  type NotificationGatewaySetting,
} from "./notificationsData";
import "./notifications.css";

const NotificationSettings: React.FC = () => {
  const [gateways, setGateways] = useState<NotificationGatewaySetting[]>(INITIAL_GATEWAY_SETTINGS);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Trigger automation toggles
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [autoReportReady, setAutoReportReady] = useState(true);
  const [autoCriticalAlert, setAutoCriticalAlert] = useState(true);
  const [autoPaymentReminder, setAutoPaymentReminder] = useState(true);

  const [editGateway, setEditGateway] = useState<NotificationGatewaySetting | null>(null);
  const [viewGateway, setViewGateway] = useState<NotificationGatewaySetting | null>(null);
  const [deletingGateway, setDeletingGateway] = useState<NotificationGatewaySetting | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingGateway) return;
    setGateways(gateways.filter((g) => g.id !== deletingGateway.id));
    setDeletingGateway(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGateway) return;
    setGateways(gateways.map((g) => (g.id === editGateway.id ? editGateway : g)));
    setEditGateway(null);
    showToast("Gateway settings updated.");
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return gateways.slice(start, start + rowsPerPage);
  }, [gateways, currentPage, rowsPerPage]);

  const columns = [
    "Gateway Channel",
    "Service Provider",
    "Sender ID / Originator",
    "Account / User ID",
    "Daily Usage / Quota",
    "Trigger Status",
    "Connection Status",
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <SettingsOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Notification &amp; Channel Gateway Settings
            </h1>
            <p className="text-sm text-slate-500">
              Configure multi-channel communication gateways, automated event triggers, and quota allocation
            </p>
          </div>
        </div>
      </div>

      {/* Automated Event Trigger Toggles Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Automated Event Trigger Rules</h3>
          <p className="text-xs text-slate-500">
            When enabled, backend services automatically dispatch multi-channel messages upon life-cycle events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Registration Welcome Notification</span>
              <p className="text-slate-500">Dispatches WhatsApp/SMS welcome message on patient enrollment</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoWelcome}
                onChange={(e) => {
                  setAutoWelcome(e.target.checked);
                  showToast(`Registration auto-trigger ${e.target.checked ? "enabled" : "disabled"}.`);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Report Ready &amp; Verified Alert</span>
              <p className="text-slate-500">Sends download link when pathologist signs off diagnostic report</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReportReady}
                onChange={(e) => {
                  setAutoReportReady(e.target.checked);
                  showToast(`Report Ready auto-trigger ${e.target.checked ? "enabled" : "disabled"}.`);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Critical Panic Value Alert</span>
              <p className="text-slate-500">Urgent automated SMS &amp; In-App alert to doctor when values exceed panic threshold</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoCriticalAlert}
                onChange={(e) => {
                  setAutoCriticalAlert(e.target.checked);
                  showToast(`Critical Panic auto-trigger ${e.target.checked ? "enabled" : "disabled"}.`);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Payment Pending Reminder</span>
              <p className="text-slate-500">Automated SMS reminder with UPI payment link when invoice balance &gt; 0</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPaymentReminder}
                onChange={(e) => {
                  setAutoPaymentReminder(e.target.checked);
                  showToast(`Payment reminder auto-trigger ${e.target.checked ? "enabled" : "disabled"}.`);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Gateway Status Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900">Communication Service Gateways</h3>
          <p className="text-xs text-slate-500">Live API connectivity, daily quota usage, and credentials</p>
        </div>

        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: NotificationGatewaySetting) => (
            <>
              {/* Channel */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-semibold text-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  {item.channel === "WhatsApp" && <WhatsAppIcon className="text-emerald-600" sx={{ fontSize: 18 }} />}
                  {item.channel === "SMS" && <SmsOutlinedIcon className="text-blue-600" sx={{ fontSize: 18 }} />}
                  {item.channel === "Email" && <EmailOutlinedIcon className="text-purple-600" sx={{ fontSize: 18 }} />}
                  {item.channel === "In-App" && <PushPinOutlinedIcon className="text-amber-600" sx={{ fontSize: 18 }} />}
                  <span>{item.name}</span>
                </div>
              </td>

              {/* Provider */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-700">
                {item.provider}
              </td>

              {/* Sender ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-bold text-slate-800 text-xs">
                {item.senderId || "-"}
              </td>

              {/* Account / User ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-600">
                {item.accountSidOrUser || "-"}
              </td>

              {/* Daily Usage / Quota */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-mono">
                <span className="font-bold text-slate-800">{item.dailyUsed}</span>
                <span className="text-slate-400"> / {item.dailyQuota}</span>
              </td>

              {/* Trigger Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.isAutoTriggerEnabled
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.isAutoTriggerEnabled ? "Auto-Enabled" : "Manual Only"}
                </span>
              </td>

              {/* Connection Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {item.status}
                </span>
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewGateway(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                    title="View Gateway Configuration"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditGateway(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    title="Edit Credentials & Quota"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingGateway(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Gateway"
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
            totalItems={gateways.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* View Gateway Right-Side Drawer */}
      {viewGateway && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setViewGateway(null)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewGateway.name}</h3>
                  <p className="text-xs text-slate-500">{viewGateway.provider} ({viewGateway.channel})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewGateway(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-slate-400 font-medium block">Provider</span> <span className="font-semibold text-slate-800">{viewGateway.provider}</span></div>
                  <div><span className="text-slate-400 font-medium block">Channel</span> <span className="font-bold text-indigo-700">{viewGateway.channel}</span></div>
                  <div><span className="text-slate-400 font-medium block">Sender ID</span> <span className="font-mono font-bold text-slate-800">{viewGateway.senderId || "-"}</span></div>
                  <div><span className="text-slate-400 font-medium block">Account ID</span> <span className="font-mono text-slate-800">{viewGateway.accountSidOrUser}</span></div>
                  <div><span className="text-slate-400 font-medium block">Daily Quota</span> <span className="font-bold text-slate-800">{viewGateway.dailyQuota} msgs/day</span></div>
                  <div><span className="text-slate-400 font-medium block">Status</span> <span className="font-bold text-emerald-700">{viewGateway.status}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewGateway(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gateway Right-Side Drawer */}
      {editGateway && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditGateway(null)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Gateway: {editGateway.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editGateway.provider} ({editGateway.channel})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditGateway(null)}
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
                    <span className="text-slate-500">Account ID:</span>
                    <span className="font-mono text-slate-800">{editGateway.accountSidOrUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Today's Usage:</span>
                    <span className="font-mono text-slate-700">{editGateway.dailyUsed} sent</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sender ID / Originator Header</label>
                  <input
                    type="text"
                    value={editGateway.senderId || ""}
                    onChange={(e) => setEditGateway({ ...editGateway, senderId: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Message Quota</label>
                  <input
                    type="number"
                    value={editGateway.dailyQuota}
                    onChange={(e) => setEditGateway({ ...editGateway, dailyQuota: Number(e.target.value) })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Connection State</label>
                  <select
                    value={editGateway.status}
                    onChange={(e) => setEditGateway({ ...editGateway, status: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                  >
                    <option value="Connected">Connected</option>
                    <option value="Testing">Testing</option>
                    <option value="Disconnected">Disconnected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditGateway(null)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Right-Side Drawer */}
      {deletingGateway && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDeletingGateway(null)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2 text-rose-600">
                <WarningAmberOutlinedIcon />
                <h3 className="text-lg font-bold text-slate-900">Delete Gateway</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingGateway(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold text-amber-900">
                  Are you sure you want to permanently remove this gateway configuration?
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Automated dispatch channels routed through this provider will be disabled.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Gateway Name</span>
                  <span className="font-semibold text-slate-800">{deletingGateway.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Provider</span>
                  <span className="font-medium text-slate-800">{deletingGateway.provider} ({deletingGateway.channel})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingGateway(null)}
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
    </div>
  );
};

export default NotificationSettings;

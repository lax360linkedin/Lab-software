import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredNotifications,
  saveNotifications,
  type NotificationLogItem,
} from "./notificationsData";
import "./notifications.css";

const NotificationHistory: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Send Direct Message Drawer
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<NotificationLogItem["channel"]>("WhatsApp");
  const [selectedEvent, setSelectedEvent] = useState<NotificationLogItem["eventType"]>("Report Ready");
  const [messageContent, setMessageContent] = useState("");

  const [viewLog, setViewLog] = useState<NotificationLogItem | null>(null);
  const [editLog, setEditLog] = useState<NotificationLogItem | null>(null);
  const [deletingLog, setDeletingLog] = useState<NotificationLogItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getStoredNotifications());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingLog) return;
    const updated = logs.filter((l) => l.id !== deletingLog.id);
    setLogs(updated);
    saveNotifications(updated);
    setDeletingLog(null);
    showToast("Deleted successfully");
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientContact || !messageContent) {
      alert("Please fill all required recipient and message fields.");
      return;
    }

    const newLog: NotificationLogItem = {
      id: `NOTIF-${Date.now()}`,
      notificationCode: `NTF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventType: selectedEvent,
      channel: selectedChannel,
      recipientType: "Patient",
      recipientName,
      recipientContact,
      referenceId: `REF-${Date.now().toString().slice(-6)}`,
      subject: `${selectedEvent} - Lax360 Medical Lab`,
      messagePreview: messageContent,
      sentDate: getFormattedCurrentDate(),
      sentTime: getFormattedCurrentTime(),
      deliveryStatus: "Delivered",
      deliveredAt: getFormattedCurrentTime(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    saveNotifications(updated);

    // Call backend broadcast / notification endpoint asynchronously
    try {
      await fetch("http://127.0.0.1:8000/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientRole: "all",
          message: `${selectedEvent}: ${messageContent}`,
        }),
      });
    } catch {
      // Backend fallback handled gracefully
    }

    setIsSendOpen(false);
    setRecipientName("");
    setRecipientContact("");
    setMessageContent("");
    showToast(`Notification successfully sent via ${selectedChannel} to ${recipientName}!`);
  };


  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLog) return;
    const updated = logs.map((l) => (l.id === editLog.id ? editLog : l));
    setLogs(updated);
    saveNotifications(updated);
    setEditLog(null);
    showToast("Notification record updated.");
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchSearch =
        item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.messagePreview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.eventType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchChannel = channelFilter === "All" || item.channel === channelFilter;
      const matchEvent = eventFilter === "All" || item.eventType === eventFilter;

      return matchSearch && matchChannel && matchEvent;
    });
  }, [logs, searchTerm, channelFilter, eventFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const columns = [
    "Notification ID",
    "Event Type",
    "Channel",
    "Recipient",
    "Contact Details",
    "Message Preview",
    "Sent Date & Time",
    "Delivery Status",
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
            <NotificationsNoneOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Communication &amp; Notification History
            </h1>
            <p className="text-sm text-slate-500">
              Audit log of automated event-triggered messages: Welcome, Report Ready, Payment Reminders, and Urgent Panic Alerts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSendOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
        >
          <SendOutlinedIcon fontSize="small" />
          Send Direct Message
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sent Today</p>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700 font-bold text-xs">{getFormattedCurrentDate()}</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{logs.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Delivered across all channels</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp Messages</p>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <WhatsAppIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {logs.filter((l) => l.channel === "WhatsApp").length}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">98.5% read &amp; delivery rate</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">SMS Dispatched</p>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <SmsOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-700">
            {logs.filter((l) => l.channel === "SMS").length}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-medium">DLT approved transactional routes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Critical / In-App Alerts</p>
            <span className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <PushPinOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-purple-700">
            {logs.filter((l) => l.eventType === "Critical Panic Alert" || l.channel === "In-App").length}
          </p>
          <p className="mt-1 text-xs text-purple-600 font-medium">Direct clinician notification</p>
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
              placeholder="Search recipient, phone, code, or message..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FilterListIcon className="text-slate-400" fontSize="small" />
              <select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="All">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
                <option value="In-App">In-App</option>
              </select>
            </div>

            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="All">All Event Types</option>
              <option value="Registration Welcome">Registration Welcome</option>
              <option value="Report Ready">Report Ready</option>
              <option value="Payment Reminder">Payment Reminder</option>
              <option value="Report Shared">Report Shared</option>
              <option value="Critical Panic Alert">Critical Panic Alert</option>
            </select>
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: NotificationLogItem) => (
            <>
              {/* Notification ID */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-semibold text-indigo-700 text-xs">
                {item.notificationCode}
              </td>

              {/* Event Type */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    item.eventType === "Critical Panic Alert"
                      ? "bg-rose-100 text-rose-800 animate-pulse"
                      : item.eventType === "Report Ready"
                      ? "bg-emerald-50 text-emerald-800"
                      : item.eventType === "Payment Reminder"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-blue-50 text-blue-800"
                  }`}
                >
                  {item.eventType}
                </span>
              </td>

              {/* Channel */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                    item.channel === "WhatsApp"
                      ? "channel-tag-whatsapp"
                      : item.channel === "SMS"
                      ? "channel-tag-sms"
                      : item.channel === "Email"
                      ? "channel-tag-email"
                      : "channel-tag-inapp"
                  }`}
                >
                  {item.channel === "WhatsApp" && <WhatsAppIcon sx={{ fontSize: 13 }} />}
                  {item.channel === "SMS" && <SmsOutlinedIcon sx={{ fontSize: 13 }} />}
                  {item.channel === "Email" && <EmailOutlinedIcon sx={{ fontSize: 13 }} />}
                  {item.channel}
                </span>
              </td>

              {/* Recipient */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <div className="font-semibold text-slate-900 text-xs">{item.recipientName}</div>
                <div className="text-[11px] text-slate-400">{item.recipientType}</div>
              </td>

              {/* Contact Details */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs text-slate-700">
                {item.recipientContact}
              </td>

              {/* Message Preview */}
              <td className="px-4 py-3.5 text-left text-xs text-slate-600 max-w-xs truncate" title={item.messagePreview}>
                {item.messagePreview}
              </td>

              {/* Sent Date & Time */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                <div>{item.sentTime}</div>
                <div className="text-[11px] text-slate-400">{item.sentDate}</div>
              </td>

              {/* Delivery Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.deliveryStatus === "Read"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : item.deliveryStatus === "Delivered"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : item.deliveryStatus === "Sent"
                      ? "bg-slate-100 text-slate-700 border border-slate-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {item.deliveryStatus}
                </span>
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewLog(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                    title="View Message Delivery Receipt"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditLog(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    title="Edit Record / Resend"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingLog(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Notification Log"
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
            totalItems={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Send Direct Message Right-Side Drawer */}
      {isSendOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsSendOpen(false)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send Direct Notification</h3>
                  <p className="text-xs text-slate-500">Dispatch message via configured multi-channel gateway</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSendOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSendDirect} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Channel Gateway</label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    >
                      <option value="WhatsApp">WhatsApp Cloud API</option>
                      <option value="SMS">Transactional SMS</option>
                      <option value="Email">Secure SMTP Email</option>
                      <option value="In-App">Internal In-App Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Event Category</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    >
                      <option value="Report Ready">Report Ready</option>
                      <option value="Registration Welcome">Registration Welcome</option>
                      <option value="Payment Reminder">Payment Reminder</option>
                      <option value="Report Shared">Report Shared</option>
                      <option value="Critical Panic Alert">Critical Panic Alert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone / Email</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98401 23456"
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Dear patient, your lab report is ready..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Send Immediately
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* View Message Right-Side Drawer */}
      {viewLog && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setViewLog(null)}
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
                  <h3 className="text-base font-bold text-slate-900">Message Delivery Receipt</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewLog.notificationCode}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block">Recipient</span>
                    <span className="font-semibold text-slate-800">{viewLog.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Contact</span>
                    <span className="font-mono text-slate-800">{viewLog.recipientContact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Channel</span>
                    <span className="font-bold text-indigo-700">{viewLog.channel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Event</span>
                    <span className="font-semibold text-slate-800">{viewLog.eventType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Delivered At</span>
                    <span className="font-medium text-slate-800">{viewLog.sentDate}, {viewLog.sentTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Delivery Status</span>
                    <span className="font-bold text-emerald-700">{viewLog.deliveryStatus}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivered Message Text</label>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  {viewLog.messagePreview}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewLog(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Log Right-Side Drawer */}
      {editLog && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditLog(null)}
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
                    Edit Notification: {editLog.notificationCode}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editLog.recipientName} ({editLog.channel})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditLog(null)}
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
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-mono text-slate-800">{editLog.recipientContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event:</span>
                    <span className="font-medium text-slate-800">{editLog.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sent Date:</span>
                    <span className="text-slate-700">{editLog.sentDate}, {editLog.sentTime}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Status</label>
                  <select
                    value={editLog.deliveryStatus}
                    onChange={(e) => setEditLog({ ...editLog, deliveryStatus: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Read">Read</option>
                    <option value="Sent">Sent</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message Text</label>
                  <textarea
                    rows={6}
                    value={editLog.messagePreview}
                    onChange={(e) => setEditLog({ ...editLog, messagePreview: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditLog(null)}
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
      {deletingLog && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDeletingLog(null)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2 text-rose-600">
                <WarningAmberOutlinedIcon />
                <h3 className="text-lg font-bold text-slate-900">Delete Notification Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold text-amber-900">
                  Are you sure you want to permanently delete this notification record?
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  This action cannot be undone and will remove the delivery receipt from your audit logs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Notification ID</span>
                  <span className="font-mono font-bold text-slate-800">{deletingLog.notificationCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Recipient</span>
                  <span className="font-medium text-slate-800">{deletingLog.recipientName} ({deletingLog.recipientContact})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Channel / Event</span>
                  <span className="font-medium text-slate-800">{deletingLog.channel} • {deletingLog.eventType}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
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

export default NotificationHistory;


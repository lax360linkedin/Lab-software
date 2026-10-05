import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";
import {
  getStoredNotifications,
  saveNotifications,
  type NotificationLogItem,
} from "./notificationsData";
import "./notifications.css";

export interface FinalReportItem {
  id: string;
  reportId: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  phone: string;
  email: string;
  doctorReferral: string;
  sampleId: string;
  accessionNumber: string;
  reportDate: string;
  reportTime: string;
  status: "Ready to Send" | "Delivered via WhatsApp" | "Delivered via SMS" | "Delivered via Email";
  tests: {
    testCode: string;
    testName: string;
    category: string;
    sampleType: string;
    price: number;
  }[];
  testTotal: number;
}

const FINAL_REPORTS_STORAGE_KEY = "lax_final_reports_dispatch";

const INITIAL_FINAL_REPORTS: FinalReportItem[] = [
  {
    id: "REP-1001",
    reportId: "REP-2026-1001",
    patientId: "PAT-10001",
    registrationId: "REG-10001",
    patientName: "Arun Kumar",
    phone: "9876543210",
    email: "arun.kumar@gmail.com",
    doctorReferral: "Dr. John Smith",
    sampleId: "SMP-10001",
    accessionNumber: "ACC-2026-1001",
    reportDate: "25 Sep 2026",
    reportTime: "11:30 AM",
    status: "Ready to Send",
    tests: [
      { testCode: "CBC", testName: "Complete Blood Count", category: "Hematology", sampleType: "Whole Blood", price: 400 },
      { testCode: "FBS", testName: "Fasting Blood Sugar", category: "Biochemistry", sampleType: "Serum", price: 120 },
      { testCode: "LFT", testName: "Liver Function Test", category: "Biochemistry", sampleType: "Serum", price: 700 },
      { testCode: "ALIAS LABORIOSAM CU", testName: "Sit tenetur dolore", category: "Immunology", sampleType: "Plasma", price: 65 },
    ],
    testTotal: 1285,
  },
  {
    id: "REP-1002",
    reportId: "REP-2026-1002",
    patientId: "PAT-10002",
    registrationId: "REG-10002",
    patientName: "Priya Sharma",
    phone: "9876543211",
    email: "priya.sharma@gmail.com",
    doctorReferral: "Dr. Sarah Wilson",
    sampleId: "SMP-10002",
    accessionNumber: "ACC-2026-1002",
    reportDate: "25 Sep 2026",
    reportTime: "12:15 PM",
    status: "Delivered via WhatsApp",
    tests: [
      { testCode: "LFT", testName: "Liver Function Test", category: "Biochemistry", sampleType: "Serum", price: 700 },
      { testCode: "LIPID", testName: "Lipid Profile Panel", category: "Biochemistry", sampleType: "Serum", price: 850 },
    ],
    testTotal: 1550,
  },
  {
    id: "REP-1003",
    reportId: "REP-2026-1003",
    patientId: "PAT-10004",
    registrationId: "REG-10004",
    patientName: "Divya Menon",
    phone: "9876543213",
    email: "divya.menon@gmail.com",
    doctorReferral: "Dr. John Smith",
    sampleId: "SMP-10004",
    accessionNumber: "ACC-2026-1004",
    reportDate: "24 Sep 2026",
    reportTime: "03:45 PM",
    status: "Ready to Send",
    tests: [
      { testCode: "CBC", testName: "Complete Blood Count", category: "Hematology", sampleType: "Whole Blood", price: 400 },
      { testCode: "LFT", testName: "Liver Function Test", category: "Biochemistry", sampleType: "Serum", price: 700 },
      { testCode: "THYROID", testName: "Thyroid Profile (T3, T4, TSH)", category: "Endocrinology", sampleType: "Serum", price: 600 },
    ],
    testTotal: 1700,
  },
  {
    id: "REP-1004",
    reportId: "REP-2026-1004",
    patientId: "PAT-10003",
    registrationId: "REG-10003",
    patientName: "Rajesh Kumar",
    phone: "9876543212",
    email: "rajesh.kumar@gmail.com",
    doctorReferral: "Dr. Michael Brown",
    sampleId: "SMP-10003",
    accessionNumber: "ACC-2026-1003",
    reportDate: "24 Sep 2026",
    reportTime: "04:30 PM",
    status: "Ready to Send",
    tests: [
      { testCode: "KFT", testName: "Kidney Function Test", category: "Biochemistry", sampleType: "Serum", price: 650 },
      { testCode: "HBA1C", testName: "Glycated Hemoglobin (HbA1c)", category: "Biochemistry", sampleType: "Whole Blood", price: 450 },
    ],
    testTotal: 1100,
  },
];

const NotificationHistory: React.FC = () => {
  // Main Tab State: "reports" = Generated Reports (Ready to Send), "history" = Notification History
  const [activeTab, setActiveTab] = useState<"reports" | "history">("reports");

  // Generated Reports state
  const [finalReports, setFinalReports] = useState<FinalReportItem[]>(() => {
    try {
      const stored = localStorage.getItem(FINAL_REPORTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(FINAL_REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_FINAL_REPORTS));
      return INITIAL_FINAL_REPORTS;
    } catch {
      return INITIAL_FINAL_REPORTS;
    }
  });

  // Selected report for the 3-dots drawer
  const [selectedReport, setSelectedReport] = useState<FinalReportItem | null>(null);

  // Notification History logs state
  const [logs, setLogs] = useState<NotificationLogItem[]>(() => getStoredNotifications());
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
  const [deletingLog, setDeletingLog] = useState<NotificationLogItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const updateReportStatus = (reportId: string, status: FinalReportItem["status"]) => {
    setFinalReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, status } : r));
      localStorage.setItem(FINAL_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const logSentNotification = (
    report: FinalReportItem,
    channel: "WhatsApp" | "SMS" | "Email",
    preview: string
  ) => {
    const contact = channel === "Email" ? report.email : report.phone;
    const newLog: NotificationLogItem = {
      id: `NOTIF-${Date.now()}`,
      notificationCode: `NTF-${Date.now().toString().slice(-4)}`,
      eventType: "Report Ready",
      channel,
      recipientType: "Patient",
      recipientName: report.patientName,
      recipientContact: contact,
      referenceId: report.reportId,
      subject: `Laboratory Report - ${report.reportId}`,
      messagePreview: preview,
      sentDate: getFormattedCurrentDate(),
      sentTime: getFormattedCurrentTime(),
      deliveryStatus: "Delivered",
      deliveredAt: getFormattedCurrentTime(),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveNotifications(updatedLogs);
  };

  // WhatsApp click handler
  const handleSendWhatsApp = (report: FinalReportItem) => {
    const testList = report.tests.map((t) => `${t.testCode} (${t.testName})`).join(", ");
    const text = `*Lax Lab - Laboratory Report Ready*
Dear ${report.patientName},

Your diagnostic laboratory report (${report.reportId}) has been finalized and verified.

📋 *Tests Included:*
${testList}

💰 *Test Total:* ₹${report.testTotal.toLocaleString("en-IN")}
📅 *Report Date:* ${report.reportDate}
🏥 *Doctor / Referral:* ${report.doctorReferral || "Self"}
✅ *Status:* Final Verified Report

Your full report is ready for download. Thank you for choosing Lax Lab!`;

    const cleanPhone = report.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");

    updateReportStatus(report.id, "Delivered via WhatsApp");
    logSentNotification(report, "WhatsApp", text);
    showToast(`Report sent via WhatsApp to ${report.patientName} (${report.phone}) successfully`);
  };

  // SMS click handler
  const handleSendSMS = (report: FinalReportItem) => {
    const text = `Lax Lab: Dear ${report.patientName}, your test report ${report.reportId} is ready. Total: Rs.${report.testTotal}. Status: Verified. Thank you.`;
    const cleanPhone = report.phone.replace(/[^0-9]/g, "");
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(text)}`, "_self");

    updateReportStatus(report.id, "Delivered via SMS");
    logSentNotification(report, "SMS", text);
    showToast(`Report sent via SMS to ${report.patientName} (${report.phone}) successfully`);
  };

  // Email click handler
  const handleSendEmail = (report: FinalReportItem) => {
    const subject = `Laboratory Report - ${report.reportId} | Lax Lab`;
    const body = `Dear ${report.patientName},

Your laboratory test report (${report.reportId}) has been finalized and verified by Lax Lab.

Patient ID: ${report.patientId}
Registration ID: ${report.registrationId}
Doctor Referral: ${report.doctorReferral || "Self"}
Report Date: ${report.reportDate}

Tests Included:
${report.tests.map((t) => `- ${t.testCode} — ${t.testName} (${t.category} • ${t.sampleType}): ₹${t.price}`).join("\n")}

Test Total: ₹${report.testTotal.toLocaleString("en-IN")}

Status: Final & Verified

Please contact Lax Lab if you require any assistance.

Warm regards,
Lax Lab Diagnostic Center`;

    window.open(`mailto:${report.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");

    updateReportStatus(report.id, "Delivered via Email");
    logSentNotification(report, "Email", body);
    showToast(`Report sent via Email to ${report.patientName} (${report.email}) successfully`);
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
      showToast("Please fill all required recipient and message fields.");
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
      subject: `${selectedEvent} - Lax Lab`,
      messagePreview: messageContent,
      sentDate: getFormattedCurrentDate(),
      sentTime: getFormattedCurrentTime(),
      deliveryStatus: "Delivered",
      deliveredAt: getFormattedCurrentTime(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    saveNotifications(updated);

    setIsSendOpen(false);
    setRecipientName("");
    setRecipientContact("");
    setMessageContent("");
    showToast("Notification dispatched successfully");
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return finalReports;
    return finalReports.filter(
      (r) =>
        r.reportId.toLowerCase().includes(query) ||
        r.patientName.toLowerCase().includes(query) ||
        r.patientId.toLowerCase().includes(query) ||
        r.phone.includes(query) ||
        r.tests.some((t) => t.testName.toLowerCase().includes(query) || t.testCode.toLowerCase().includes(query))
    );
  }, [finalReports, searchTerm]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.messagePreview.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel =
        channelFilter === "All" || item.channel === channelFilter;

      const matchesEvent =
        eventFilter === "All" || item.eventType === eventFilter;

      return matchesSearch && matchesChannel && matchesEvent;
    });
  }, [logs, searchTerm, channelFilter, eventFilter]);

  const reportColumns = [
    "Report ID",
    "Patient",
    "Contact Details",
    "Tests & Total",
    "Generated Date",
    "Delivery Status",
    "Actions",
  ];

  const logColumns = [
    "Notification Code",
    "Event Type",
    "Channel",
    "Recipient",
    "Contact Details",
    "Message Preview",
    "Sent Date & Time",
    "Delivery Status",
    "Actions",
  ];

  // FULL PAGE VIEW (EXACTLY MATCHING IMAGE 1) - NOT A POPUP/MODAL
  if (selectedReport) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Back navigation button */}
        <div className="max-w-4xl mx-auto mb-6">
          <button
            type="button"
            onClick={() => setSelectedReport(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back to Report Notifications</span>
          </button>
        </div>

        {/* Centered Page Card - EXACTLY MATCHING IMAGE 1 */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white p-8 sm:p-12 shadow-sm border border-slate-100 space-y-7">
          {/* Top Success Badge */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 42 }} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Patient Registered Successfully
            </h2>
            <p className="text-sm text-slate-500">
              Patient and referral records have been created.
            </p>
          </div>

          {/* 2x2 Details Grid matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <span className="block text-xs font-semibold text-slate-400">Patient ID</span>
              <strong className="block text-base font-bold text-slate-900 mt-1">{selectedReport.patientId}</strong>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <span className="block text-xs font-semibold text-slate-400">Registration ID</span>
              <strong className="block text-base font-bold text-slate-900 mt-1">{selectedReport.registrationId || selectedReport.reportId}</strong>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <span className="block text-xs font-semibold text-slate-400">Patient Name</span>
              <strong className="block text-base font-bold text-slate-900 mt-1">{selectedReport.patientName}</strong>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <span className="block text-xs font-semibold text-slate-400">Concerned Doctor</span>
              <strong className="block text-base font-bold text-slate-900 mt-1">{selectedReport.doctorReferral || "Dr. Meena Raj"}</strong>
            </div>
          </div>

          {/* Required Tests Box matching Image 1 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div>
                <span className="block text-xs font-semibold text-slate-400">Required Tests</span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedReport.tests.length} test{selectedReport.tests.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-semibold text-slate-400">Test Total</span>
                <span className="text-2xl font-bold text-slate-900">
                  ₹{selectedReport.testTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-200/60 pt-2">
              {selectedReport.tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {test.testCode} — {test.testName}
                    </h4>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {test.category} • {test.sampleType}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{test.price.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Action Boxes (WhatsApp, SMS, Email) - EXACTLY matching Image 1's 3 boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Box 1: WhatsApp */}
            <button
              type="button"
              onClick={() => handleSendWhatsApp(selectedReport)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 py-3.5 px-4 text-sm font-semibold text-slate-700 hover:text-emerald-700 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Box 2: SMS (Solid Blue like View Referral in Image 1) */}
            <button
              type="button"
              onClick={() => handleSendSMS(selectedReport)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 px-4 text-sm font-semibold text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              <SmsOutlinedIcon />
              <span>SMS</span>
            </button>

            {/* Box 3: Email */}
            <button
              type="button"
              onClick={() => handleSendEmail(selectedReport)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:border-purple-500 hover:bg-purple-50/50 py-3.5 px-4 text-sm font-semibold text-slate-700 hover:text-purple-700 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <EmailOutlinedIcon className="text-purple-600" />
              <span>Email</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
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
              Report Notifications &amp; Delivery
            </h1>
            <p className="text-sm text-slate-500">
              Send finalized laboratory reports directly to patient WhatsApp, SMS, and Email
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSendOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition cursor-pointer"
        >
          <SendOutlinedIcon fontSize="small" />
          Send Direct Message
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Generated Reports</p>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700 font-bold text-xs">{finalReports.length}</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{finalReports.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Ready for multi-channel dispatch</p>
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
          <p className="mt-1 text-xs text-emerald-600 font-medium">Direct WhatsApp delivery</p>
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
          <p className="mt-1 text-xs text-blue-600 font-medium">Mobile transactional SMS</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Dispatched</p>
            <span className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <EmailOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-purple-700">
            {logs.filter((l) => l.channel === "Email").length}
          </p>
          <p className="mt-1 text-xs text-purple-600 font-medium">Digital PDF &amp; result emails</p>
        </div>
      </div>

      {/* Tab Switcher: Generated Reports vs Delivery History */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("reports");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === "reports"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
          Generated Reports (Ready to Share)
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
            activeTab === "reports" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
          }`}>
            {finalReports.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("history");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
          Delivery History &amp; Logs
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
            activeTab === "history" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
          }`}>
            {logs.length}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder={activeTab === "reports" ? "Search patient, report ID, phone or test..." : "Search recipient, contact, code..."}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {activeTab === "history" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <FilterListIcon className="text-slate-400" fontSize="small" />
                <select
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none"
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Events</option>
                <option value="Report Ready">Report Ready</option>
                <option value="Registration Welcome">Registration Welcome</option>
                <option value="Payment Reminder">Payment Reminder</option>
                <option value="Critical Panic Alert">Critical Alert</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: GENERATED REPORTS (READY TO SEND) */}
        {activeTab === "reports" && (
          <div className="p-4 sm:p-5">
            <Table
              columns={reportColumns}
              data={filteredReports.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
              emptyMessage="No generated reports found"
              renderRow={(report: FinalReportItem) => (
                <>
                  <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-blue-600">
                    {report.reportId}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div>
                      <strong className="text-xs font-bold text-slate-800">{report.patientName}</strong>
                      <span className="text-[11px] text-slate-400 block">{report.patientId}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-slate-700 block">{report.phone}</span>
                      <span className="text-slate-400 text-[11px] block">{report.email}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {report.tests.map((t) => t.testCode).join(", ")}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        Total: ₹{report.testTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                    {report.reportDate} • {report.reportTime}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        report.status === "Ready to Send"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      title="View Report & Share Options"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                    >
                      <MoreVertIcon fontSize="small" />
                      <span>View &amp; Share</span>
                    </button>
                  </td>
                </>
              )}
            />

            {filteredReports.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <Pagination
                  totalItems={filteredReports.length}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DELIVERY HISTORY & LOGS */}
        {activeTab === "history" && (
          <div className="p-4 sm:p-5">
            <Table
              columns={logColumns}
              data={filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
              emptyMessage="No communication logs found"
              renderRow={(item: NotificationLogItem) => (
                <>
                  <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-800">
                    {item.notificationCode}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        item.eventType === "Report Ready"
                          ? "bg-blue-50 text-blue-700"
                          : item.eventType === "Critical Panic Alert"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.eventType}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {item.channel === "WhatsApp" ? (
                        <WhatsAppIcon className="text-emerald-600" sx={{ fontSize: 16 }} />
                      ) : item.channel === "SMS" ? (
                        <SmsOutlinedIcon className="text-blue-600" sx={{ fontSize: 16 }} />
                      ) : (
                        <EmailOutlinedIcon className="text-purple-600" sx={{ fontSize: 16 }} />
                      )}
                      <span className="text-xs font-semibold text-slate-700">{item.channel}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs">
                    <div>
                      <strong className="text-slate-800">{item.recipientName}</strong>
                      <span className="text-[11px] text-slate-400 block">{item.recipientType}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs font-mono text-slate-600">
                    {item.recipientContact}
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-600 max-w-[200px] truncate">
                    {item.messagePreview}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                    {item.sentDate} • {item.sentTime}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {item.deliveryStatus}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewLog(item)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="View Details"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingLog(item)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Delete Log"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            />

            {filteredLogs.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <Pagination
                  totalItems={filteredLogs.length}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEND DIRECT MESSAGE MODAL */}
      {isSendOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsSendOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col justify-between bg-white shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900">Send Direct Message</h3>
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <form onSubmit={handleSendDirect} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact (Phone / Email)</label>
                  <input
                    type="text"
                    required
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder="Phone number or email"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as NotificationLogItem["channel"])}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-700"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value as NotificationLogItem["eventType"])}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-700"
                    >
                      <option value="Report Ready">Report Ready</option>
                      <option value="Registration Welcome">Registration Welcome</option>
                      <option value="Payment Reminder">Payment Reminder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type notification message..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSendOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow cursor-pointer"
                  >
                    Send Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LOG DETAILS MODAL */}
      {viewLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setViewLog(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Notification Dispatch Details</h3>
              <button
                type="button"
                onClick={() => setViewLog(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Code</span>
                  <strong className="text-slate-800">{viewLog.notificationCode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Channel</span>
                  <strong className="text-slate-800">{viewLog.channel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Recipient</span>
                  <span className="text-slate-700">{viewLog.recipientName} ({viewLog.recipientContact})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Timestamp</span>
                  <span className="text-slate-700">{viewLog.sentDate} {viewLog.sentTime}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Message Content</span>
                <p className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewLog.messagePreview}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewLog(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setDeletingLog(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-600">
              <WarningAmberOutlinedIcon />
              <h3 className="text-sm font-bold text-slate-900">Delete Notification Log?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove log <strong>{deletingLog.notificationCode}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow cursor-pointer"
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

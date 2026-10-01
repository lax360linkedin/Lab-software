import { useState, useMemo } from "react";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PhoneCallbackOutlinedIcon from "@mui/icons-material/PhoneCallbackOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { getTodayLabel, getFormattedCurrentDate } from "../../../common components/dateUtils";

import "./pendingPayments.css";

export type AgingCategory = "Due Today" | "1-3 Days" | "4-7 Days" | "Over 7 Days";
export type FollowupAction = "SMS Sent" | "Call Scheduled" | "Under Review" | "Escalated";

export interface PendingPaymentItem {
  id: string;
  invoiceNumber: string;
  billingDate: string;
  dueDate: string;
  patientName: string;
  patientId: string;
  phone: string;
  sponsorOrDoctor: string;
  testsOrdered: string;
  totalBill: number;
  paidAmount: number;
  balanceDue: number;
  daysAging: number;
  agingCategory: AgingCategory;
  followupStatus: FollowupAction;
}

const todayDate = getFormattedCurrentDate();

const PENDING_PAYMENT_DATA: PendingPaymentItem[] = [
  {
    id: "PEND-01",
    invoiceNumber: "BILL-2026-1046",
    billingDate: todayDate,
    dueDate: todayDate,
    patientName: "Farhana Begum",
    patientId: "PID-4418",
    phone: "9876543214",
    sponsorOrDoctor: "Dr. M. Senthil",
    testsOrdered: "Thyroid Profile + Vitamin D3",
    totalBill: 2200,
    paidAmount: 1000,
    balanceDue: 1200,
    daysAging: 0,
    agingCategory: "Due Today",
    followupStatus: "SMS Sent",
  },
  {
    id: "PEND-02",
    invoiceNumber: "BILL-2026-1050",
    billingDate: todayDate,
    dueDate: "26 Sep 2026",
    patientName: "Kavitha Natarajan",
    patientId: "PID-4416",
    phone: "9876543216",
    sponsorOrDoctor: "TechPark Corporate Tie-up",
    testsOrdered: "Annual Pre-Employment Lab Panel",
    totalBill: 1500,
    paidAmount: 500,
    balanceDue: 1000,
    daysAging: 0,
    agingCategory: "Due Today",
    followupStatus: "Under Review",
  },
  {
    id: "PEND-03",
    invoiceNumber: "BILL-2026-1051",
    billingDate: todayDate,
    dueDate: todayDate,
    patientName: "Senthil Nathan",
    patientId: "PID-4412",
    phone: "9876543218",
    sponsorOrDoctor: "Dr. Anita Desai",
    testsOrdered: "Liver Function Test + Lipid Screen",
    totalBill: 1500,
    paidAmount: 0,
    balanceDue: 1500,
    daysAging: 1,
    agingCategory: "1-3 Days",
    followupStatus: "Call Scheduled",
  },
  {
    id: "PEND-04",
    invoiceNumber: "BILL-2026-1038",
    billingDate: "23 Sep 2026",
    dueDate: "24 Sep 2026",
    patientName: "Dharmalingam V.",
    patientId: "PID-4398",
    phone: "9876543220",
    sponsorOrDoctor: "Walk-in Outpatient",
    testsOrdered: "Glycated Hemoglobin (HbA1c) + Serum Creatinine",
    totalBill: 950,
    paidAmount: 200,
    balanceDue: 750,
    daysAging: 2,
    agingCategory: "1-3 Days",
    followupStatus: "SMS Sent",
  },
  {
    id: "PEND-05",
    invoiceNumber: "BILL-2026-1032",
    billingDate: "22 Sep 2026",
    dueDate: "23 Sep 2026",
    patientName: "Archana Sundar",
    patientId: "PID-4392",
    phone: "9876543222",
    sponsorOrDoctor: "Dr. John Smith",
    testsOrdered: "Serum Ferritin, Iron & TIBC",
    totalBill: 1800,
    paidAmount: 600,
    balanceDue: 1200,
    daysAging: 3,
    agingCategory: "1-3 Days",
    followupStatus: "Call Scheduled",
  },
  {
    id: "PEND-06",
    invoiceNumber: "BILL-2026-1025",
    billingDate: "20 Sep 2026",
    dueDate: "21 Sep 2026",
    patientName: "Naveen Chandran",
    patientId: "PID-4385",
    phone: "9876543224",
    sponsorOrDoctor: "Apex Corporate Desk",
    testsOrdered: "Executive Complete Health Panel",
    totalBill: 4500,
    paidAmount: 1500,
    balanceDue: 3000,
    daysAging: 5,
    agingCategory: "4-7 Days",
    followupStatus: "Under Review",
  },
  {
    id: "PEND-07",
    invoiceNumber: "BILL-2026-1020",
    billingDate: "19 Sep 2026",
    dueDate: "20 Sep 2026",
    patientName: "Manjula Krishnan",
    patientId: "PID-4380",
    phone: "9876543226",
    sponsorOrDoctor: "Dr. Sarah Wilson",
    testsOrdered: "Culture & Sensitivity (Blood + Urine)",
    totalBill: 2100,
    paidAmount: 500,
    balanceDue: 1600,
    daysAging: 6,
    agingCategory: "4-7 Days",
    followupStatus: "Call Scheduled",
  },
  {
    id: "PEND-08",
    invoiceNumber: "BILL-2026-1014",
    billingDate: "18 Sep 2026",
    dueDate: "19 Sep 2026",
    patientName: "Venkatesan R.",
    patientId: "PID-4374",
    phone: "9876543228",
    sponsorOrDoctor: "Dr. K. Ramanathan",
    testsOrdered: "Cardiac Troponin I + ECG Panel",
    totalBill: 2800,
    paidAmount: 800,
    balanceDue: 2000,
    daysAging: 7,
    agingCategory: "4-7 Days",
    followupStatus: "Escalated",
  },
  {
    id: "PEND-09",
    invoiceNumber: "BILL-2026-1008",
    billingDate: "16 Sep 2026",
    dueDate: "17 Sep 2026",
    patientName: "Sharmila Banu",
    patientId: "PID-4368",
    phone: "9876543230",
    sponsorOrDoctor: "Direct Walk-in",
    testsOrdered: "Thyroid Panel + Vitamin B12 + D3",
    totalBill: 3400,
    paidAmount: 1000,
    balanceDue: 2400,
    daysAging: 9,
    agingCategory: "Over 7 Days",
    followupStatus: "Call Scheduled",
  },
  {
    id: "PEND-10",
    invoiceNumber: "BILL-2026-0995",
    billingDate: "14 Sep 2026",
    dueDate: "15 Sep 2026",
    patientName: "Karthikeyan M.",
    patientId: "PID-4355",
    phone: "9876543232",
    sponsorOrDoctor: "Dr. Anita Desai",
    testsOrdered: "Histopathology Biopsy Examination",
    totalBill: 3800,
    paidAmount: 1000,
    balanceDue: 2800,
    daysAging: 11,
    agingCategory: "Over 7 Days",
    followupStatus: "Escalated",
  },
  {
    id: "PEND-11",
    invoiceNumber: "BILL-2026-0988",
    billingDate: "12 Sep 2026",
    dueDate: "13 Sep 2026",
    patientName: "Geetha Govindaraj",
    patientId: "PID-4348",
    phone: "9876543234",
    sponsorOrDoctor: "Global IT Corporate Billing",
    testsOrdered: "Full Body Diagnostic Package",
    totalBill: 5200,
    paidAmount: 2000,
    balanceDue: 3200,
    daysAging: 13,
    agingCategory: "Over 7 Days",
    followupStatus: "Under Review",
  },
  {
    id: "PEND-12",
    invoiceNumber: "BILL-2026-0982",
    billingDate: "10 Sep 2026",
    dueDate: "11 Sep 2026",
    patientName: "Prabhu Deva",
    patientId: "PID-4342",
    phone: "9876543236",
    sponsorOrDoctor: "Dr. John Smith",
    testsOrdered: "Dengue & Typhoid Rapid Screen",
    totalBill: 1950,
    paidAmount: 400,
    balanceDue: 1550,
    daysAging: 15,
    agingCategory: "Over 7 Days",
    followupStatus: "Escalated",
  },
];

const columns = [
  "Invoice ID",
  "Patient Details",
  "Doctor / Sponsor",
  "Tests Ordered",
  "Bill / Paid",
  "Balance Due",
  "Aging Status",
  "Follow-up",
  "Actions",
];

const PendingPayments = () => {
  const [items, setItems] = useState<PendingPaymentItem[]>(PENDING_PAYMENT_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAging, setSelectedAging] = useState<string>("All");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewingItem, setViewingItem] = useState<PendingPaymentItem | null>(null);
  const [editingItem, setEditingItem] = useState<PendingPaymentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PendingPaymentItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
    showToast("Pending payment updated successfully");
  };

  // KPI calculations
  const totalBalanceDue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.balanceDue, 0);
  }, [items]);

  const totalOverdueInvoices = items.length;

  const averageAgingDays = useMemo(() => {
    if (totalOverdueInvoices === 0) return 0;
    const sumDays = items.reduce((sum, item) => sum + item.daysAging, 0);
    return (sumDays / totalOverdueInvoices).toFixed(1);
  }, [items, totalOverdueInvoices]);

  const criticalOverdueCount = useMemo(() => {
    return items.filter((item) => item.daysAging > 7).length;
  }, [items]);

  // Aging brackets summary
  const agingBrackets = useMemo(() => {
    const brackets: AgingCategory[] = [
      "Due Today",
      "1-3 Days",
      "4-7 Days",
      "Over 7 Days",
    ];

    return brackets.map((bracket) => {
      const bItems = items.filter((i) => i.agingCategory === bracket);
      const totalAmount = bItems.reduce((sum, i) => sum + i.balanceDue, 0);
      const percentage =
        totalBalanceDue > 0 ? Math.round((totalAmount / totalBalanceDue) * 100) : 0;

      let color = "bg-blue-600";
      if (bracket === "1-3 Days") color = "bg-amber-500";
      if (bracket === "4-7 Days") color = "bg-orange-500";
      if (bracket === "Over 7 Days") color = "bg-rose-600";

      return {
        bracket,
        count: bItems.length,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [items, totalBalanceDue]);

  // Filtered list
  const filteredList = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.sponsorOrDoctor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAging =
        selectedAging === "All" || item.agingCategory === selectedAging;

      const matchesAction =
        selectedAction === "All" || item.followupStatus === selectedAction;

      return matchesSearch && matchesAging && matchesAction;
    });
  }, [items, searchTerm, selectedAging, selectedAction]);

  const currentList = useMemo(() => {
    return filteredList.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredList, currentPage, rowsPerPage]);


  return (
    <div className="pending-payments-page space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Receivables Management
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Pending Payments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Aging analysis of overdue patient invoices, unpaid credit accounts, and payment reminder tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <CalendarTodayOutlinedIcon className="text-sm text-blue-600" />
            <span>{getTodayLabel()}</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <PrintOutlinedIcon className="text-base text-slate-500" />
            <span>Print Aging Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Outstanding Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Outstanding
              </p>
              <h3 className="mt-2 text-2xl font-bold text-rose-600">
                ₹{totalBalanceDue.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Pending patient receivables
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AccountBalanceWalletOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Unpaid Accounts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overdue Accounts
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalOverdueInvoices}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Active follow-ups in queue
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <HourglassEmptyOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Aging Days */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average Aging
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {averageAgingDays} <span className="text-sm font-normal text-slate-500">Days</span>
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                From initial invoice date
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarTodayOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Critical Overdue Accounts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Critical (&gt;7 Days)
              </p>
              <h3 className="mt-2 text-2xl font-bold text-rose-600">
                {criticalOverdueCount}
              </h3>
              <p className="mt-2 text-xs text-rose-600 font-medium">
                Immediate call escalation
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <WarningAmberOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Aging Brackets Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Receivables Aging Analysis
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribution of pending balances by overdue time brackets.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agingBrackets.map((bracket, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {bracket.bracket}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {bracket.percentage}%
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800">
                ₹{bracket.totalAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                {bracket.count} pending bills
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${bracket.color}`}
                  style={{ width: `${bracket.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Payments Ledger Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Outstanding Dues Ledger
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Detailed tracking of patient balance receivables and scheduled follow-ups.
            </p>
          </div>

          {/* Search, Aging, and Action Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <SearchOutlinedIcon className="absolute left-3 top-2.5 text-slate-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search patient, invoice, phone..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedAging}
                onChange={(e) => {
                  setSelectedAging(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Aging Brackets</option>
                <option value="Due Today">Due Today</option>
                <option value="1-3 Days">1-3 Days</option>
                <option value="4-7 Days">4-7 Days</option>
                <option value="Over 7 Days">Over 7 Days</option>
              </select>
            </div>

            <div>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Follow-up Status</option>
                <option value="SMS Sent">SMS Sent</option>
                <option value="Call Scheduled">Call Scheduled</option>
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentList}
            minWidth="1200px"
            emptyMessage="No pending payment records match your search criteria."
            renderRow={(item: PendingPaymentItem) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-blue-600">
                    {item.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-400">
                    Billed: {item.billingDate}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-slate-800">
                    {item.patientName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.patientId} • {item.phone}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {item.sponsorOrDoctor}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm text-slate-700 max-w-[220px] truncate">
                    {item.testsOrdered}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="text-sm text-slate-600">
                    Total: ₹{item.totalBill.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">
                    Paid: ₹{item.paidAmount.toLocaleString("en-IN")}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <span className="font-bold text-sm text-rose-600">
                    ₹{item.balanceDue.toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.agingCategory === "Due Today"
                        ? "bg-blue-50 text-blue-700"
                        : item.agingCategory === "1-3 Days"
                        ? "bg-amber-50 text-amber-700"
                        : item.agingCategory === "4-7 Days"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.agingCategory} ({item.daysAging}d)
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-700">
                    <PhoneCallbackOutlinedIcon className="text-slate-400 text-sm" />
                    <span>{item.followupStatus}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                      title="View Details"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setEditingItem({ ...item })}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                      title="Edit Payment"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Record"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        {/* Pagination Controls */}
        {filteredList.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredList.length}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={(value) => {
                setRowsPerPage(value);
                setCurrentPage(1);
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </section>

      {/* View Drawer */}
      {viewingItem && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setViewingItem(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Pending Payment Details</h3>
                <p className="text-xs text-gray-500">{viewingItem.invoiceNumber} • {viewingItem.patientId}</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Patient Name</span>
                  <span className="font-semibold text-slate-800">{viewingItem.patientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Phone</span>
                  <span className="text-slate-700">{viewingItem.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Doctor / Sponsor</span>
                  <span className="text-slate-800 font-medium">{viewingItem.sponsorOrDoctor}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="text-xs font-medium text-slate-500">Tests Ordered</div>
                <div className="font-semibold text-slate-800 text-xs">{viewingItem.testsOrdered}</div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Total Billed</span>
                  <span className="font-semibold text-slate-800">₹{viewingItem.totalBill.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Amount Paid</span>
                  <span className="font-semibold text-emerald-600">₹{viewingItem.paidAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Balance Overdue</span>
                  <span className="font-bold text-rose-600 text-base">₹{viewingItem.balanceDue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Aging Category</span>
                  <span className="rounded-full bg-rose-50 px-3 py-0.5 text-xs font-semibold text-rose-700">
                    {viewingItem.agingCategory} ({viewingItem.daysAging} days)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Follow-up Status</span>
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                    {viewingItem.followupStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Billing Date</span>
                  <span className="text-slate-700">{viewingItem.billingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Due Date</span>
                  <span className="text-slate-700">{viewingItem.dueDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Drawer */}
      {editingItem && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setEditingItem(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Edit Pending Payment</h3>
                <p className="text-xs text-gray-500">{editingItem.invoiceNumber} • {editingItem.patientName}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={editingItem.patientName}
                    onChange={(e) => setEditingItem({ ...editingItem, patientName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={editingItem.phone}
                      onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Doctor / Sponsor</label>
                    <input
                      type="text"
                      value={editingItem.sponsorOrDoctor}
                      onChange={(e) => setEditingItem({ ...editingItem, sponsorOrDoctor: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Tests Ordered</label>
                  <input
                    type="text"
                    value={editingItem.testsOrdered}
                    onChange={(e) => setEditingItem({ ...editingItem, testsOrdered: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Total Bill (₹)</label>
                    <input
                      type="number"
                      value={editingItem.totalBill}
                      onChange={(e) => {
                        const total = Number(e.target.value) || 0;
                        setEditingItem({
                          ...editingItem,
                          totalBill: total,
                          balanceDue: Math.max(0, total - editingItem.paidAmount),
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={editingItem.paidAmount}
                      onChange={(e) => {
                        const paid = Number(e.target.value) || 0;
                        setEditingItem({
                          ...editingItem,
                          paidAmount: paid,
                          balanceDue: Math.max(0, editingItem.totalBill - paid),
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="text-slate-500">Calculated Balance Due:</span>
                  <div className="font-bold text-rose-600 text-sm">₹{editingItem.balanceDue.toLocaleString("en-IN")}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Aging Days</label>
                    <input
                      type="number"
                      value={editingItem.daysAging}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 0;
                        let cat: AgingCategory = "Due Today";
                        if (days >= 1 && days <= 3) cat = "1-3 Days";
                        else if (days >= 4 && days <= 7) cat = "4-7 Days";
                        else if (days > 7) cat = "Over 7 Days";
                        setEditingItem({
                          ...editingItem,
                          daysAging: days,
                          agingCategory: cat,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Follow-up Status</label>
                    <select
                      value={editingItem.followupStatus}
                      onChange={(e) => setEditingItem({ ...editingItem, followupStatus: e.target.value as FollowupAction })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="SMS Sent">SMS Sent</option>
                      <option value="Call Scheduled">Call Scheduled</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Drawer */}
      {deletingItem && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setDeletingItem(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Pending Payment</h3>
                <p className="text-xs text-gray-500">{deletingItem.invoiceNumber} • {deletingItem.patientName}</p>
              </div>
              <button onClick={() => setDeletingItem(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                <WarningAmberOutlinedIcon className="mt-0.5 text-rose-600 shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Warning: Destructive Action</div>
                  <p className="text-xs text-rose-700">
                    Are you sure you want to delete this pending payment record? This will remove the overdue balance from the accounts receivable ledger.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.patientName} ({deletingItem.patientId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tests:</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{deletingItem.testsOrdered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance Overdue:</span>
                  <span className="font-bold text-rose-600">₹{deletingItem.balanceDue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aging:</span>
                  <span className="font-medium text-slate-700">{deletingItem.agingCategory} ({deletingItem.daysAging}d)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
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
        </>
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

export default PendingPayments;


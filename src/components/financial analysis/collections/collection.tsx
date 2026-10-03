import { useState, useMemo } from "react";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";

import { getTodayLabel, getCurrentISODate } from "../../../common components/dateUtils";
import "./collection.css";

export type PaymentMethod = "Cash" | "UPI" | "Card" | "Online Payment";

export interface CollectionTransaction {
  id: string;
  invoiceId: string;
  patientName: string;
  patientId: string;
  testName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  timestamp: string;
  time: string;
  counter: string;
  status: "Completed" | "Pending" | "Refunded";
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  amount: number;
  count: number;
  percentage: number;
  badgeClass: string;
  barColor: string;
}

export interface ShiftCollection {
  shift: string;
  timeRange: string;
  staff: string;
  amount: number;
  billsCount: number;
}

const todayDateStr = getCurrentISODate();

// Local realistic mock data for Today's Collections
const INITIAL_TRANSACTIONS: CollectionTransaction[] = [
  {
    id: "TXN-801",
    invoiceId: "INV-2026-0891",
    patientName: "Rajesh Kannan",
    patientId: "PID-4421",
    testName: "Complete Blood Count (CBC) + ESR",
    amount: 650,
    paymentMethod: "UPI",
    transactionRef: "UPI/3948291048",
    timestamp: `${todayDateStr} 12:45 PM`,
    time: "12:45 PM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-802",
    invoiceId: "INV-2026-0890",
    patientName: "Sunita Verma",
    patientId: "PID-4420",
    testName: "Liver Function Test (LFT) & Lipid Profile",
    amount: 2200,
    paymentMethod: "Card",
    transactionRef: "POS/AUTH-88219",
    timestamp: `${todayDateStr} 12:30 PM`,
    time: "12:30 PM",
    counter: "Desk 2 (Cash Counter)",
    status: "Completed",
  },
  {
    id: "TXN-803",
    invoiceId: "INV-2026-0889",
    patientName: "Arunachalam Murugan",
    patientId: "PID-4419",
    testName: "Thyroid Profile Total (T3, T4, TSH)",
    amount: 950,
    paymentMethod: "Cash",
    transactionRef: "CASH-REC-104",
    timestamp: `${todayDateStr} 12:15 PM`,
    time: "12:15 PM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-804",
    invoiceId: "INV-2026-0888",
    patientName: "Farhana Begum",
    patientId: "PID-4418",
    testName: "Fasting Blood Sugar & HbA1c",
    amount: 850,
    paymentMethod: "UPI",
    transactionRef: "UPI/9928172635",
    timestamp: `${todayDateStr} 11:50 AM`,
    time: "11:50 AM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-805",
    invoiceId: "INV-2026-0887",
    patientName: "Vikram Malhotra",
    patientId: "PID-4417",
    testName: "Comprehensive Health Checkup Package",
    amount: 4500,
    paymentMethod: "Card",
    transactionRef: "POS/AUTH-99120",
    timestamp: `${todayDateStr} 11:25 AM`,
    time: "11:25 AM",
    counter: "Desk 2 (Cash Counter)",
    status: "Completed",
  },
  {
    id: "TXN-806",
    invoiceId: "INV-2026-0886",
    patientName: "Kavitha Natarajan",
    patientId: "PID-4416",
    testName: "Kidney Function Test (KFT / RFT)",
    amount: 1200,
    paymentMethod: "Online Payment",
    transactionRef: "PG/RAZ-771829",
    timestamp: `${todayDateStr} 11:00 AM`,
    time: "11:00 AM",
    counter: "Online Portal",
    status: "Completed",
  },
  {
    id: "TXN-807",
    invoiceId: "INV-2026-0885",
    patientName: "Gopalakrishnan S.",
    patientId: "PID-4415",
    testName: "Urine Routine & Microscopic Examination",
    amount: 300,
    paymentMethod: "Cash",
    transactionRef: "CASH-REC-103",
    timestamp: `${todayDateStr} 10:40 AM`,
    time: "10:40 AM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-808",
    invoiceId: "INV-2026-0884",
    patientName: "Deepa Ananth",
    patientId: "PID-4414",
    testName: "Vitamin D3 (25-OH) & Vitamin B12",
    amount: 2800,
    paymentMethod: "UPI",
    transactionRef: "UPI/7718290192",
    timestamp: `${todayDateStr} 10:15 AM`,
    time: "10:15 AM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-809",
    invoiceId: "INV-2026-0883",
    patientName: "Mohammed Rizwan",
    patientId: "PID-4413",
    testName: "Dengue Duo (NS1 Antigen + IgG/IgM)",
    amount: 1600,
    paymentMethod: "UPI",
    transactionRef: "UPI/1092837465",
    timestamp: `${todayDateStr} 09:50 AM`,
    time: "09:50 AM",
    counter: "Desk 2 (Cash Counter)",
    status: "Completed",
  },
  {
    id: "TXN-810",
    invoiceId: "INV-2026-0882",
    patientName: "Ananya Deshmukh",
    patientId: "PID-4412",
    testName: "Serum Electrolytes (Na+, K+, Cl-)",
    amount: 750,
    paymentMethod: "Cash",
    transactionRef: "CASH-REC-102",
    timestamp: `${todayDateStr} 09:20 AM`,
    time: "09:20 AM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
  {
    id: "TXN-811",
    invoiceId: "INV-2026-0881",
    patientName: "Sanjay Singhania",
    patientId: "PID-4411",
    testName: "Cardiac Risk Biomarkers (Troponin I + HsCRP)",
    amount: 3200,
    paymentMethod: "Card",
    transactionRef: "POS/AUTH-77312",
    timestamp: `${todayDateStr} 08:55 AM`,
    time: "08:55 AM",
    counter: "Desk 2 (Cash Counter)",
    status: "Completed",
  },
  {
    id: "TXN-812",
    invoiceId: "INV-2026-0880",
    patientName: "Bhavana Patel",
    patientId: "PID-4410",
    testName: "Beta HCG Qualitative & Ultrasound Pelvis",
    amount: 1800,
    paymentMethod: "UPI",
    transactionRef: "UPI/8827364510",
    timestamp: `${todayDateStr} 08:30 AM`,
    time: "08:30 AM",
    counter: "Desk 1 (Reception)",
    status: "Completed",
  },
];

const SHIFTS_DATA: ShiftCollection[] = [
  {
    shift: "Morning Shift (07:00 AM - 01:00 PM)",
    timeRange: "Active Shift",
    staff: "Pooja Hegde (Cashier) & Desk 1",
    amount: 20900,
    billsCount: 12,
  },
  {
    shift: "Afternoon Shift (01:00 PM - 07:00 PM)",
    timeRange: "Upcoming Shift",
    staff: "Vikas Rao (Reception)",
    amount: 0,
    billsCount: 0,
  },
  {
    shift: "Night / Emergency (07:00 PM - 07:00 AM)",
    timeRange: "Scheduled",
    staff: "Night Duty Technician",
    amount: 0,
    billsCount: 0,
  },
];

const columns = [
  "Bill / Invoice ID",
  "Patient Details",
  "Test / Investigation",
  "Payment Method",
  "Date / Time",
  "Amount",
  "Status",
  "Actions",
];

const Collection = () => {
  const [transactions, setTransactions] = useState<CollectionTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewingTx, setViewingTx] = useState<CollectionTransaction | null>(null);
  const [editingTx, setEditingTx] = useState<CollectionTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<CollectionTransaction | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingTx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== deletingTx.id));
    setDeletingTx(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTx.id ? editingTx : t))
    );
    setEditingTx(null);
    showToast("Transaction updated successfully");
  };

  // Calculate high-level summary from transactions
  const totalCollection = useMemo(() => {
    return transactions.reduce((sum, item) => sum + item.amount, 0);
  }, [transactions]);

  const totalBills = transactions.length;

  const averageBillValue = useMemo(() => {
    return totalBills > 0 ? Math.round(totalCollection / totalBills) : 0;
  }, [totalCollection, totalBills]);

  // Payment methods breakdown calculations
  const paymentBreakdown = useMemo<PaymentMethodBreakdown[]>(() => {
    const methods: PaymentMethod[] = ["UPI", "Card", "Cash", "Online Payment"];
    return methods.map((method) => {
      const filtered = transactions.filter((t) => t.paymentMethod === method);
      const amount = filtered.reduce((acc, t) => acc + t.amount, 0);
      const count = filtered.length;
      const percentage = totalCollection > 0 ? Math.round((amount / totalCollection) * 100) : 0;

      let badgeClass = "method-upi";
      let barColor = "bg-blue-600";

      if (method === "Cash") {
        badgeClass = "method-cash";
        barColor = "bg-emerald-500";
      } else if (method === "Card") {
        badgeClass = "method-card";
        barColor = "bg-purple-600";
      } else if (method === "Online Payment") {
        badgeClass = "method-online";
        barColor = "bg-amber-500";
      }

      return {
        method,
        amount,
        count,
        percentage,
        badgeClass,
        barColor,
      };
    });
  }, [transactions, totalCollection]);

  // Digital vs Cash ratio
  const digitalShare = useMemo(() => {
    const cashTotal = transactions
      .filter((t) => t.paymentMethod === "Cash")
      .reduce((acc, t) => acc + t.amount, 0);
    const digitalTotal = totalCollection - cashTotal;
    return totalCollection > 0 ? Math.round((digitalTotal / totalCollection) * 100) : 0;
  }, [transactions, totalCollection]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod =
        selectedMethod === "All" || item.paymentMethod === selectedMethod;

      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchTerm, selectedMethod]);

  const currentTransactions = useMemo(() => {
    return filteredTransactions.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredTransactions, currentPage, rowsPerPage]);


  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "UPI":
        return <QrCode2OutlinedIcon className="text-base" />;
      case "Card":
        return <CreditCardOutlinedIcon className="text-base" />;
      case "Cash":
        return <LocalAtmOutlinedIcon className="text-base" />;
      case "Online Payment":
        return <LanguageOutlinedIcon className="text-base" />;
      default:
        return <PaymentsOutlinedIcon className="text-base" />;
    }
  };

  return (
    <div className="collection-page space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Daily Cashflow
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Today's Collection
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time tracking of patient fee collections, payment methods, and counter settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <CalendarTodayOutlinedIcon className="text-sm text-blue-600" />
            <span>{getTodayLabel()}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <PrintOutlinedIcon className="text-base text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Today's Collection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Today's Total Collection
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalCollection.toLocaleString("en-IN")}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUpOutlinedIcon className="text-sm" />
                <span>+12.8% from yesterday</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PaymentsOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Total Paid Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Paid Bills / Invoices
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalBills}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                100% cleared settlement today
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ReceiptLongOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Transaction Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average Bill Value
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{averageBillValue.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Per patient transaction average
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <AccountBalanceWalletOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Digital vs Cash Split */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Digital Collection Ratio
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {digitalShare}%
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                ₹{(totalCollection - 2000).toLocaleString("en-IN")} via UPI & Card
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <QrCode2OutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown Cards */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Revenue distribution across lab collection counters and digital gateways.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Channels: 4
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paymentBreakdown.map((item) => (
            <div
              key={item.method}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {item.method}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.badgeClass}`}>
                    {getMethodIcon(item.method)}
                    {item.percentage}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-bold text-slate-900">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {item.count} {item.count === 1 ? "transaction" : "transactions"}
                  </div>
                </div>
              </div>

              {/* Share Progress Bar */}
              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${item.barColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Counter Shift Summary & Collection Highlights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Counters / Shift Settlement */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Shift-wise Collection Summary
              </h3>
              <p className="text-xs text-slate-500">
                Staff duty batches and counter collection handover status.
              </p>
            </div>
            <AccessTimeOutlinedIcon className="text-slate-400 text-lg" />
          </div>

          <div className="space-y-3">
            {SHIFTS_DATA.map((shift, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {shift.shift}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        idx === 0
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {shift.timeRange}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Staff: {shift.staff}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ₹{shift.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {shift.billsCount} bills processed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Audit / Safety Summary */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Settlement Checklist
              </h3>
              <CheckCircleOutlineOutlinedIcon className="text-emerald-500 text-lg" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              End-of-day counter reconciliation metrics.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Physical Cash in Drawer</span>
                <span className="font-bold text-slate-900">₹2,000</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">UPI Payments Settled</span>
                <span className="font-bold text-emerald-600">Verified</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">POS Card Machine Batch</span>
                <span className="font-bold text-emerald-600">Reconciled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Discrepancy / Shortage</span>
                <span className="font-bold text-slate-400">₹0.00 (Nil)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900">
            <strong>Daily Note:</strong> All cashier receipts match patient accession numbers. No pending unbilled walk-in samples.
          </div>
        </section>
      </div>

      {/* Recent Collection Transactions Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Collection Transactions
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing detailed receipts generated for laboratory tests today.
            </p>
          </div>

          {/* Search & Filter Controls */}
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
                placeholder="Search patient, invoice..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Methods</option>
                <option value="UPI">UPI Only</option>
                <option value="Cash">Cash Only</option>
                <option value="Card">Card Only</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table using Common Table Component */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentTransactions}
            minWidth="1200px"
            emptyMessage="No transactions match your search criteria."
            renderRow={(tx: CollectionTransaction) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-blue-600">
                    {tx.invoiceId}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {tx.transactionRef}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-semibold text-slate-800">
                    {tx.patientName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {tx.patientId}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 min-w-[200px]">
                  {tx.testName}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      tx.paymentMethod === "UPI"
                        ? "bg-blue-50 text-blue-600"
                        : tx.paymentMethod === "Cash"
                        ? "bg-emerald-50 text-emerald-600"
                        : tx.paymentMethod === "Card"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {getMethodIcon(tx.paymentMethod)}
                    {tx.paymentMethod}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                  {tx.time}
                  <span className="block text-xs text-slate-400">
                    {tx.counter}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-sm text-slate-900">
                  ₹{tx.amount.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {tx.status}
                  </span>
                </td>

                {/* Actions: View, Edit, Delete */}
                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingTx(tx)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                      title="View Receipt"
                    >
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTx({ ...tx })}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="Edit Transaction"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTx(tx)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Transaction"
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredTransactions.length}
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

      {/* View Transaction Right-Side Drawer */}
      {viewingTx && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setViewingTx(null)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Collection Receipt Details</h3>
                <p className="text-xs text-blue-600 font-mono font-semibold">{viewingTx.invoiceId}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTx(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block">Patient Name</span>
                    <span className="font-semibold text-slate-800 text-sm">{viewingTx.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Patient ID</span>
                    <span className="font-mono text-slate-800">{viewingTx.patientId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Payment Method</span>
                    <span className="font-semibold text-slate-800">{viewingTx.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Transaction Ref</span>
                    <span className="font-mono text-slate-800">{viewingTx.transactionRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Collection Counter</span>
                    <span className="font-medium text-slate-800">{viewingTx.counter}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Timestamp</span>
                    <span className="font-medium text-slate-800">{viewingTx.timestamp}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test / Investigation Details</label>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">
                  {viewingTx.testName}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Settled Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">₹{viewingTx.amount.toLocaleString("en-IN")}</span>
                </div>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {viewingTx.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewingTx(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Right-Side Drawer */}
      {editingTx && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setEditingTx(null)}
          />
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Collection Entry</h3>
                <p className="text-xs text-blue-600 font-mono font-semibold">{editingTx.invoiceId}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={editingTx.patientName}
                  onChange={(e) => setEditingTx({ ...editingTx, patientName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  value={editingTx.testName}
                  onChange={(e) => setEditingTx({ ...editingTx, testName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Collection Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={editingTx.paymentMethod}
                    onChange={(e) => setEditingTx({ ...editingTx, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Counter</label>
                  <input
                    type="text"
                    required
                    value={editingTx.counter}
                    onChange={(e) => setEditingTx({ ...editingTx, counter: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingTx.status}
                    onChange={(e) => setEditingTx({ ...editingTx, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
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
      )}

      {/* Delete Confirmation Right-Side Drawer */}
      {deletingTx && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDeletingTx(null)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Transaction</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold text-amber-900">
                  Are you sure you want to delete this collection entry?
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  This transaction will be voided from the daily cash settlement summary.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Invoice ID</span>
                  <span className="font-mono font-bold text-slate-800">{deletingTx.invoiceId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Patient Name</span>
                  <span className="font-semibold text-slate-800">{deletingTx.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Amount &amp; Method</span>
                  <span className="font-medium text-slate-800">₹{deletingTx.amount.toLocaleString("en-IN")} via {deletingTx.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
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

export default Collection;

import { useState, useMemo } from "react";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { getCurrentMonthYear } from "../../../common components/dateUtils";

import "./paymentStatistics.css";

export type ChannelCategory = "UPI" | "Card" | "Cash" | "Online PG" | "TPA Insurance";
export type SettlementStatus = "Settled" | "Reconciled" | "Pending Settlement";

export interface PaymentChannelStat {
  id: string;
  channelName: string;
  provider: string;
  terminalId: string;
  category: ChannelCategory;
  transactionCount: number;
  totalVolume: number;
  sharePercent: number;
  avgTicketSize: number;
  successRate: number;
  status: SettlementStatus;
}

const PAYMENT_STATS_DATA: PaymentChannelStat[] = [
  {
    id: "CH-01",
    channelName: "UPI - PhonePe QR",
    provider: "Yes Bank / PhonePe",
    terminalId: "QR-DESK1-01",
    category: "UPI",
    transactionCount: 840,
    totalVolume: 714000,
    sharePercent: 24.5,
    avgTicketSize: 850,
    successRate: 99.8,
    status: "Reconciled",
  },
  {
    id: "CH-02",
    channelName: "UPI - Google Pay",
    provider: "HDFC Bank / GPay",
    terminalId: "QR-DESK2-02",
    category: "UPI",
    transactionCount: 710,
    totalVolume: 639000,
    sharePercent: 21.9,
    avgTicketSize: 900,
    successRate: 99.7,
    status: "Reconciled",
  },
  {
    id: "CH-03",
    channelName: "POS Card Swipe (Debit)",
    provider: "HDFC POS Terminal #1",
    terminalId: "POS-TID-9921",
    category: "Card",
    transactionCount: 460,
    totalVolume: 598000,
    sharePercent: 20.5,
    avgTicketSize: 1300,
    successRate: 99.4,
    status: "Settled",
  },
  {
    id: "CH-04",
    channelName: "Physical Cash Drawer",
    provider: "Cash Counter Desk 1 & 2",
    terminalId: "CASH-REGISTER-01",
    category: "Cash",
    transactionCount: 520,
    totalVolume: 416000,
    sharePercent: 14.3,
    avgTicketSize: 800,
    successRate: 100.0,
    status: "Reconciled",
  },
  {
    id: "CH-05",
    channelName: "POS Card Swipe (Credit)",
    provider: "ICICI POS Terminal #2",
    terminalId: "POS-TID-8842",
    category: "Card",
    transactionCount: 240,
    totalVolume: 360000,
    sharePercent: 12.4,
    avgTicketSize: 1500,
    successRate: 98.9,
    status: "Settled",
  },
  {
    id: "CH-06",
    channelName: "Online Patient Portal",
    provider: "Razorpay Payment Gateway",
    terminalId: "WEB-GATEWAY-01",
    category: "Online PG",
    transactionCount: 180,
    totalVolume: 270000,
    sharePercent: 9.3,
    avgTicketSize: 1500,
    successRate: 99.2,
    status: "Reconciled",
  },
  {
    id: "CH-07",
    channelName: "Star Health Insurance TPA",
    provider: "MediAssist / Star Health",
    terminalId: "TPA-STAR-04",
    category: "TPA Insurance",
    transactionCount: 45,
    totalVolume: 180000,
    sharePercent: 6.2,
    avgTicketSize: 4000,
    successRate: 97.8,
    status: "Pending Settlement",
  },
  {
    id: "CH-08",
    channelName: "UPI - Paytm Dynamic QR",
    provider: "Paytm Payments Bank",
    terminalId: "QR-DESK1-03",
    category: "UPI",
    transactionCount: 220,
    totalVolume: 165000,
    sharePercent: 5.7,
    avgTicketSize: 750,
    successRate: 99.5,
    status: "Reconciled",
  },
  {
    id: "CH-09",
    channelName: "HDFC ERGO Cashless TPA",
    provider: "Vidal Health TPA",
    terminalId: "TPA-HDFC-02",
    category: "TPA Insurance",
    transactionCount: 35,
    totalVolume: 147000,
    sharePercent: 5.0,
    avgTicketSize: 4200,
    successRate: 96.5,
    status: "Pending Settlement",
  },
  {
    id: "CH-10",
    channelName: "Mobile Home Collection POS",
    provider: "PineLabs mPOS Android",
    terminalId: "MPOS-PHLEBO-01",
    category: "Card",
    transactionCount: 95,
    totalVolume: 133000,
    sharePercent: 4.6,
    avgTicketSize: 1400,
    successRate: 98.6,
    status: "Settled",
  },
  {
    id: "CH-11",
    channelName: "Direct NEFT / Corporate IMPS",
    provider: "State Bank of India Corporate",
    terminalId: "BANK-NEFT-CORP",
    category: "Online PG",
    transactionCount: 28,
    totalVolume: 112000,
    sharePercent: 3.8,
    avgTicketSize: 4000,
    successRate: 100.0,
    status: "Reconciled",
  },
  {
    id: "CH-12",
    channelName: "Bajaj Allianz TPA Desk",
    provider: "Paramount TPA Pvt Ltd",
    terminalId: "TPA-BAJAJ-01",
    category: "TPA Insurance",
    transactionCount: 22,
    totalVolume: 92400,
    sharePercent: 3.2,
    avgTicketSize: 4200,
    successRate: 95.8,
    status: "Pending Settlement",
  },
];

const columns = [
  "Payment Channel",
  "Provider & Terminal",
  "Category",
  "Transactions",
  "Gross Volume",
  "Avg Ticket",
  "Success Rate",
  "Settlement Status",
  "Actions",
];

const PaymentStatistics = () => {
  const [channels, setChannels] = useState<PaymentChannelStat[]>(PAYMENT_STATS_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewingChannel, setViewingChannel] = useState<PaymentChannelStat | null>(null);
  const [editingChannel, setEditingChannel] = useState<PaymentChannelStat | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<PaymentChannelStat | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingChannel) return;
    setChannels((prev) => prev.filter((item) => item.id !== deletingChannel.id));
    setDeletingChannel(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    setChannels((prev) =>
      prev.map((item) => (item.id === editingChannel.id ? editingChannel : item))
    );
    setEditingChannel(null);
    showToast("Payment channel updated successfully");
  };

  // KPI calculations
  const totalVolumeOverall = useMemo(() => {
    return channels.reduce((sum, item) => sum + item.totalVolume, 0);
  }, [channels]);

  const totalTransactionsOverall = useMemo(() => {
    return channels.reduce((sum, item) => sum + item.transactionCount, 0);
  }, [channels]);

  const overallAvgTicket = useMemo(() => {
    return totalTransactionsOverall > 0
      ? Math.round(totalVolumeOverall / totalTransactionsOverall)
      : 0;
  }, [totalVolumeOverall, totalTransactionsOverall]);

  const digitalVolume = useMemo(() => {
    return channels
      .filter((item) => item.category !== "Cash")
      .reduce((sum, item) => sum + item.totalVolume, 0);
  }, [channels]);

  const digitalShareRate = useMemo(() => {
    return totalVolumeOverall > 0
      ? ((digitalVolume / totalVolumeOverall) * 100).toFixed(1)
      : "0";
  }, [digitalVolume, totalVolumeOverall]);

  // Category breakdown
  const categorySummary = useMemo(() => {
    const cats: ChannelCategory[] = ["UPI", "Card", "Cash", "Online PG", "TPA Insurance"];
    return cats.map((cat) => {
      const items = channels.filter((i) => i.category === cat);
      const totalAmount = items.reduce((sum, i) => sum + i.totalVolume, 0);
      const totalTxns = items.reduce((sum, i) => sum + i.transactionCount, 0);
      const percentage =
        totalVolumeOverall > 0 ? Math.round((totalAmount / totalVolumeOverall) * 100) : 0;

      let color = "bg-blue-600";
      if (cat === "Card") color = "bg-purple-600";
      if (cat === "Cash") color = "bg-emerald-600";
      if (cat === "Online PG") color = "bg-amber-600";
      if (cat === "TPA Insurance") color = "bg-cyan-600";

      return {
        category: cat,
        count: totalTxns,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [channels, totalVolumeOverall]);

  // Filtered List
  const filteredChannels = useMemo(() => {
    return channels.filter((item) => {
      const matchesSearch =
        item.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.terminalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [channels, searchTerm, selectedCategory, selectedStatus]);

  const currentChannels = useMemo(() => {
    return filteredChannels.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredChannels, currentPage, rowsPerPage]);


  const getCategoryIcon = (category: ChannelCategory) => {
    switch (category) {
      case "UPI":
        return <QrCode2OutlinedIcon className="text-base" />;
      case "Card":
        return <CreditCardOutlinedIcon className="text-base" />;
      case "Cash":
        return <LocalAtmOutlinedIcon className="text-base" />;
      case "Online PG":
        return <LanguageOutlinedIcon className="text-base" />;
      case "TPA Insurance":
        return <HealthAndSafetyOutlinedIcon className="text-base" />;
      default:
        return <PaymentsOutlinedIcon className="text-base" />;
    }
  };

  return (
    <div className="payment-statistics-page space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Gateway & Channel Analytics
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Payment Statistics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive audit of collection modes, POS terminal transactions, digital gateways, and settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <CalendarTodayOutlinedIcon className="text-sm text-blue-600" />
            <span>Fiscal Month: {getCurrentMonthYear(new Date(), false)}</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Settled Volume */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Gross Payment Volume
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalVolumeOverall.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Across {PAYMENT_STATS_DATA.length} terminal endpoints
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PaymentsOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Digital / Cashless Adoption */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Digital Adoption
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {digitalShareRate}%
              </h3>
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                High cashless intake
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <QrCode2OutlinedIcon />
            </div>
          </div>
        </div>

        {/* Total Transactions Processed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Transactions
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalTransactionsOverall.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Cleared cashier payments
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CreditCardOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average Ticket Size
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{overallAvgTicket.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Per transaction volume
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <LocalAtmOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Channel Share Breakdown */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Payment Modes Contribution
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Percentage volume processed across individual gateway channels.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categorySummary.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {item.percentage}%
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800">
                ₹{item.totalAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                {item.count} payments
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Channels Ledger Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Gateway Channels & Terminal Ledger
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Transaction volumes, settlement reconciliations, and terminal success statistics.
            </p>
          </div>

          {/* Search, Category, and Settlement Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <SearchOutlinedIcon className="absolute left-3 top-2.5 text-slate-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search channel, terminal..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Channels</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Online PG">Online PG</option>
                <option value="TPA Insurance">TPA Insurance</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Reconciled">Reconciled</option>
                <option value="Settled">Settled</option>
                <option value="Pending Settlement">Pending Settlement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentChannels}
            minWidth="1200px"
            emptyMessage="No payment channels match your search criteria."
            renderRow={(item: PaymentChannelStat) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-slate-900">
                    {item.channelName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ID: {item.id}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm text-slate-800 font-medium">
                    {item.provider}
                  </div>
                  <div className="text-xs text-blue-600 font-mono">
                    {item.terminalId}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.category === "UPI"
                        ? "bg-blue-50 text-blue-700"
                        : item.category === "Card"
                        ? "bg-purple-50 text-purple-700"
                        : item.category === "Cash"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.category === "Online PG"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-800 font-semibold">
                  {item.transactionCount.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 font-bold text-sm text-slate-900">
                  ₹{item.totalVolume.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  ₹{item.avgTicketSize.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {item.successRate}%
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Reconciled"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "Settled"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewingChannel(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                      title="View Details"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setEditingChannel({ ...item })}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                      title="Edit Channel"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setDeletingChannel(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Channel"
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
        {filteredChannels.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredChannels.length}
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
      {viewingChannel && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setViewingChannel(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payment Channel Details</h3>
                <p className="text-xs text-gray-500">{viewingChannel.channelName} • {viewingChannel.terminalId}</p>
              </div>
              <button onClick={() => setViewingChannel(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-800">{viewingChannel.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Terminal ID</span>
                  <span className="font-mono text-xs text-blue-600 font-semibold">{viewingChannel.terminalId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Category</span>
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                    {viewingChannel.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Settlement Status</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                    {viewingChannel.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Transactions Count</span>
                  <span className="font-bold text-slate-900">{viewingChannel.transactionCount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Avg Ticket Size</span>
                  <span className="font-semibold text-slate-800">₹{viewingChannel.avgTicketSize.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Success Rate</span>
                  <span className="font-bold text-emerald-600">{viewingChannel.successRate}%</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Total Volume Settled</span>
                  <span className="font-bold text-slate-900 text-base">₹{viewingChannel.totalVolume.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Volume Share</span>
                  <span className="font-semibold text-blue-600">{viewingChannel.sharePercent}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewingChannel(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Drawer */}
      {editingChannel && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setEditingChannel(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Edit Payment Channel</h3>
                <p className="text-xs text-gray-500">{editingChannel.channelName}</p>
              </div>
              <button onClick={() => setEditingChannel(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Channel Name</label>
                  <input
                    type="text"
                    value={editingChannel.channelName}
                    onChange={(e) => setEditingChannel({ ...editingChannel, channelName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Provider</label>
                    <input
                      type="text"
                      value={editingChannel.provider}
                      onChange={(e) => setEditingChannel({ ...editingChannel, provider: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Terminal ID</label>
                    <input
                      type="text"
                      value={editingChannel.terminalId}
                      onChange={(e) => setEditingChannel({ ...editingChannel, terminalId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Category</label>
                  <select
                    value={editingChannel.category}
                    onChange={(e) => setEditingChannel({ ...editingChannel, category: e.target.value as ChannelCategory })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Online PG">Online PG</option>
                    <option value="TPA Insurance">TPA Insurance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Transactions Count</label>
                    <input
                      type="number"
                      value={editingChannel.transactionCount}
                      onChange={(e) => {
                        const count = Number(e.target.value) || 0;
                        const avg = count > 0 ? Math.round(editingChannel.totalVolume / count) : 0;
                        setEditingChannel({
                          ...editingChannel,
                          transactionCount: count,
                          avgTicketSize: avg,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Total Volume (₹)</label>
                    <input
                      type="number"
                      value={editingChannel.totalVolume}
                      onChange={(e) => {
                        const vol = Number(e.target.value) || 0;
                        const avg = editingChannel.transactionCount > 0 ? Math.round(vol / editingChannel.transactionCount) : 0;
                        setEditingChannel({
                          ...editingChannel,
                          totalVolume: vol,
                          avgTicketSize: avg,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="text-slate-500">Calculated Avg Ticket Size:</span>
                  <div className="font-bold text-slate-800 text-sm">₹{editingChannel.avgTicketSize.toLocaleString("en-IN")}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Success Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingChannel.successRate}
                      onChange={(e) => setEditingChannel({ ...editingChannel, successRate: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Settlement Status</label>
                    <select
                      value={editingChannel.status}
                      onChange={(e) => setEditingChannel({ ...editingChannel, status: e.target.value as SettlementStatus })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Reconciled">Reconciled</option>
                      <option value="Settled">Settled</option>
                      <option value="Pending Settlement">Pending Settlement</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
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
      {deletingChannel && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setDeletingChannel(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Payment Channel</h3>
                <p className="text-xs text-gray-500">{deletingChannel.channelName}</p>
              </div>
              <button onClick={() => setDeletingChannel(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                <WarningAmberOutlinedIcon className="mt-0.5 text-rose-600 shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Warning: Destructive Action</div>
                  <p className="text-xs text-rose-700">
                    Are you sure you want to delete this payment channel? This will remove terminal tracking and collection records from statistics.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel Name:</span>
                  <span className="font-semibold text-slate-800">{deletingChannel.channelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider & Terminal:</span>
                  <span className="font-semibold text-slate-800">{deletingChannel.provider} ({deletingChannel.terminalId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-blue-600">{deletingChannel.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Volume:</span>
                  <span className="font-bold text-rose-600">₹{deletingChannel.totalVolume.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-slate-700">{deletingChannel.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingChannel(null)}
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

export default PaymentStatistics;


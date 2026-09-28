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
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";

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
];

const PaymentStatistics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // KPI calculations
  const totalVolumeOverall = useMemo(() => {
    return PAYMENT_STATS_DATA.reduce((sum, item) => sum + item.totalVolume, 0);
  }, []);

  const totalTransactionsOverall = useMemo(() => {
    return PAYMENT_STATS_DATA.reduce((sum, item) => sum + item.transactionCount, 0);
  }, []);

  const overallAvgTicket = useMemo(() => {
    return totalTransactionsOverall > 0
      ? Math.round(totalVolumeOverall / totalTransactionsOverall)
      : 0;
  }, [totalVolumeOverall, totalTransactionsOverall]);

  const digitalVolume = useMemo(() => {
    return PAYMENT_STATS_DATA
      .filter((item) => item.category !== "Cash")
      .reduce((sum, item) => sum + item.totalVolume, 0);
  }, []);

  const digitalShareRate = useMemo(() => {
    return totalVolumeOverall > 0
      ? ((digitalVolume / totalVolumeOverall) * 100).toFixed(1)
      : "0";
  }, [digitalVolume, totalVolumeOverall]);

  // Category breakdown
  const categorySummary = useMemo(() => {
    const cats: ChannelCategory[] = ["UPI", "Card", "Cash", "Online PG", "TPA Insurance"];
    return cats.map((cat) => {
      const items = PAYMENT_STATS_DATA.filter((i) => i.category === cat);
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
  }, [totalVolumeOverall]);

  // Filtered List
  const filteredChannels = useMemo(() => {
    return PAYMENT_STATS_DATA.filter((item) => {
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
  }, [searchTerm, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredChannels.length / rowsPerPage);

  const currentChannels = useMemo(() => {
    return filteredChannels.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredChannels, currentPage, rowsPerPage]);

  const filteredTotalVolume = useMemo(() => {
    return filteredChannels.reduce((sum, item) => sum + item.totalVolume, 0);
  }, [filteredChannels]);

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
            <span>Fiscal Month: Sep 2026</span>
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
        <div className="w-full overflow-x-auto p-4 sm:p-5">
          <Table
            columns={columns}
            data={currentChannels}
            maxHeight="520px"
            emptyMessage="No payment channels match your search criteria."
            renderRow={(item: PaymentChannelStat) => (
              <>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="font-semibold text-xs text-slate-900">
                    {item.channelName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="text-xs text-slate-800 font-medium">
                    {item.provider}
                  </div>
                  <div className="text-[10px] text-blue-600 font-mono">
                    {item.terminalId}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
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

                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-800 font-semibold">
                  {item.transactionCount.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 font-bold text-xs text-slate-900">
                  ₹{item.totalVolume.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                  ₹{item.avgTicketSize.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                    {item.successRate}%
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
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
              </>
            )}
          />
        </div>

        {/* Pagination Controls */}
        {filteredChannels.length > 0 && totalPages > 1 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Table Summary Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <div>
            Showing <strong>{currentChannels.length}</strong> of{" "}
            <strong>{filteredChannels.length}</strong> channels (Total: {PAYMENT_STATS_DATA.length})
          </div>
          <div className="font-semibold text-slate-800">
            Filtered Processed Volume:{" "}
            <span className="text-blue-600 text-sm font-bold">
              ₹{filteredTotalVolume.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentStatistics;

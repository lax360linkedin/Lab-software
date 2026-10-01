import { useState, useMemo } from "react";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { getCurrentMonthYear } from "../../../common components/dateUtils";

import "./monthlyRevenue.css";

export type QuarterType = "Q1" | "Q2" | "Q3" | "Q4";
export type MonthStatus = "Completed" | "Current Month" | "Projected";

export interface MonthlyRevenueItem {
  id: string;
  monthCode: string;
  monthName: string;
  year: number;
  quarter: QuarterType;
  testsConducted: number;
  grossBilling: number;
  discounts: number;
  netRevenue: number;
  growthRate: number; // percentage vs previous month
  status: MonthStatus;
}

const MONTHLY_DATA: MonthlyRevenueItem[] = [
  {
    id: "M-2026-09",
    monthCode: "2026-09",
    monthName: "September 2026",
    year: 2026,
    quarter: "Q3",
    testsConducted: 1420,
    grossBilling: 475000,
    discounts: 28000,
    netRevenue: 447000,
    growthRate: 4.2,
    status: "Current Month",
  },
  {
    id: "M-2026-08",
    monthCode: "2026-08",
    monthName: "August 2026",
    year: 2026,
    quarter: "Q3",
    testsConducted: 1390,
    grossBilling: 456000,
    discounts: 27000,
    netRevenue: 429000,
    growthRate: 6.8,
    status: "Completed",
  },
  {
    id: "M-2026-07",
    monthCode: "2026-07",
    monthName: "July 2026",
    year: 2026,
    quarter: "Q3",
    testsConducted: 1280,
    grossBilling: 428000,
    discounts: 26500,
    netRevenue: 401500,
    growthRate: 3.5,
    status: "Completed",
  },
  {
    id: "M-2026-06",
    monthCode: "2026-06",
    monthName: "June 2026",
    year: 2026,
    quarter: "Q2",
    testsConducted: 1240,
    grossBilling: 412000,
    discounts: 24000,
    netRevenue: 388000,
    growthRate: -1.2,
    status: "Completed",
  },
  {
    id: "M-2026-05",
    monthCode: "2026-05",
    monthName: "May 2026",
    year: 2026,
    quarter: "Q2",
    testsConducted: 1260,
    grossBilling: 418000,
    discounts: 25200,
    netRevenue: 392800,
    growthRate: 5.1,
    status: "Completed",
  },
  {
    id: "M-2026-04",
    monthCode: "2026-04",
    monthName: "April 2026",
    year: 2026,
    quarter: "Q2",
    testsConducted: 1190,
    grossBilling: 398000,
    discounts: 24100,
    netRevenue: 373900,
    growthRate: 2.8,
    status: "Completed",
  },
  {
    id: "M-2026-03",
    monthCode: "2026-03",
    monthName: "March 2026",
    year: 2026,
    quarter: "Q1",
    testsConducted: 1160,
    grossBilling: 389000,
    discounts: 25400,
    netRevenue: 363600,
    growthRate: 8.4,
    status: "Completed",
  },
  {
    id: "M-2026-02",
    monthCode: "2026-02",
    monthName: "February 2026",
    year: 2026,
    quarter: "Q1",
    testsConducted: 1080,
    grossBilling: 358000,
    discounts: 22600,
    netRevenue: 335400,
    growthRate: 1.5,
    status: "Completed",
  },
  {
    id: "M-2026-01",
    monthCode: "2026-01",
    monthName: "January 2026",
    year: 2026,
    quarter: "Q1",
    testsConducted: 1060,
    grossBilling: 352000,
    discounts: 21500,
    netRevenue: 330500,
    growthRate: 3.1,
    status: "Completed",
  },
  {
    id: "M-2025-12",
    monthCode: "2025-12",
    monthName: "December 2025",
    year: 2025,
    quarter: "Q4",
    testsConducted: 1040,
    grossBilling: 342000,
    discounts: 21500,
    netRevenue: 320500,
    growthRate: 4.8,
    status: "Completed",
  },
  {
    id: "M-2025-11",
    monthCode: "2025-11",
    monthName: "November 2025",
    year: 2025,
    quarter: "Q4",
    testsConducted: 990,
    grossBilling: 326000,
    discounts: 20200,
    netRevenue: 305800,
    growthRate: 2.2,
    status: "Completed",
  },
  {
    id: "M-2025-10",
    monthCode: "2025-10",
    monthName: "October 2025",
    year: 2025,
    quarter: "Q4",
    testsConducted: 970,
    grossBilling: 319000,
    discounts: 19800,
    netRevenue: 299200,
    growthRate: 1.8,
    status: "Completed",
  },
];

const columns = [
  "Month & Year",
  "Quarter",
  "Tests Done",
  "Gross Billing",
  "Discounts",
  "Net Revenue",
  "Growth (MoM)",
  "Status",
  "Actions",
];

const MonthlyRevenue = () => {
  const [dataList, setDataList] = useState<MonthlyRevenueItem[]>(MONTHLY_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewingItem, setViewingItem] = useState<MonthlyRevenueItem | null>(null);
  const [editingItem, setEditingItem] = useState<MonthlyRevenueItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MonthlyRevenueItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    setDataList((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setDataList((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
    showToast("Monthly revenue updated successfully");
  };

  // KPI Calculations
  const totalNetTurnover = useMemo(() => {
    return dataList.reduce((sum, item) => sum + item.netRevenue, 0);
  }, [dataList]);

  const totalGrossTurnover = useMemo(() => {
    return dataList.reduce((sum, item) => sum + item.grossBilling, 0);
  }, [dataList]);

  const totalTestsOverall = useMemo(() => {
    return dataList.reduce((sum, item) => sum + item.testsConducted, 0);
  }, [dataList]);

  const averageMonthlyRevenue = useMemo(() => {
    return dataList.length > 0
      ? Math.round(totalNetTurnover / dataList.length)
      : 0;
  }, [dataList, totalNetTurnover]);

  // Quarterly Summary
  const quarterlyBreakdown = useMemo(() => {
    const quarters: QuarterType[] = ["Q3", "Q2", "Q1", "Q4"];
    return quarters.map((q) => {
      const items = dataList.filter((m) => m.quarter === q);
      const totalAmount = items.reduce((sum, m) => sum + m.netRevenue, 0);
      const percentage =
        totalNetTurnover > 0 ? Math.round((totalAmount / totalNetTurnover) * 100) : 0;

      let color = "bg-blue-600";
      if (q === "Q2") color = "bg-emerald-600";
      if (q === "Q1") color = "bg-purple-600";
      if (q === "Q4") color = "bg-amber-600";

      return {
        quarter: q,
        monthsCount: items.length,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [dataList, totalNetTurnover]);

  // Filtered List
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const matchesSearch =
        item.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.toString().includes(searchTerm);

      const matchesQuarter =
        selectedQuarter === "All" || item.quarter === selectedQuarter;

      const matchesYear =
        selectedYear === "All" || item.year.toString() === selectedYear;

      return matchesSearch && matchesQuarter && matchesYear;
    });
  }, [dataList, searchTerm, selectedQuarter, selectedYear]);

  const currentData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredData, currentPage, rowsPerPage]);


  return (
    <div className="monthly-revenue-page space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Annual & Quarterly Performance
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Monthly Revenue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Month-on-month laboratory revenue progression, test volume throughput, and quarterly fiscal trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <CalendarTodayOutlinedIcon className="text-sm text-blue-600" />
            <span>Fiscal Year 2025–2026</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <PrintOutlinedIcon className="text-base text-slate-500" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Annual Net Turnover */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Net Turnover (12M)
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalNetTurnover.toLocaleString("en-IN")}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUpOutlinedIcon className="text-sm" />
                <span>Gross: ₹{totalGrossTurnover.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <AccountBalanceWalletOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Monthly Run Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg. Monthly Turnover
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{averageMonthlyRevenue.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Per month diagnostic revenue
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <EventRepeatOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Total Test Volume */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Annual Test Volume
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalTestsOverall.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Investigations processed
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BarChartOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Highest Revenue Month */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Peak Month
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {getCurrentMonthYear(new Date(), false)}
              </h3>
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                ₹4,47,000 net collection
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarTodayOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Performance Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Quarterly Financial Overview
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Aggregate earnings and proportion per calendar quarter.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quarterlyBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {item.quarter} Overview
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {item.percentage}%
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800">
                ₹{item.totalAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                {item.monthsCount} months aggregated
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

      {/* Monthly Financial Ledger Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Monthly Financial Records
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Chronological breakdown of billing, patient discounts, and net intake.
            </p>
          </div>

          {/* Search, Quarter, and Year Filters */}
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
                placeholder="Search month, year..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedQuarter}
                onChange={(e) => {
                  setSelectedQuarter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Quarters</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentData}
            minWidth="1200px"
            emptyMessage="No monthly revenue records match your search criteria."
            renderRow={(item: MonthlyRevenueItem) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-slate-900">
                    {item.monthName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.monthCode}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {item.quarter}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                  {item.testsConducted.toLocaleString("en-IN")} tests
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  ₹{item.grossBilling.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-rose-600">
                  -₹{item.discounts.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 font-bold text-sm text-slate-900">
                  ₹{item.netRevenue.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-0.5 text-sm font-semibold ${
                      item.growthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {item.growthRate >= 0 ? "+" : ""}
                    {item.growthRate}%
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "Current Month"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {item.status}
                  </span>
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
                      title="Edit Month"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Month"
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
        {filteredData.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredData.length}
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
                <h3 className="text-base font-semibold text-gray-900">Monthly Revenue Details</h3>
                <p className="text-xs text-gray-500">{viewingItem.monthName} ({viewingItem.monthCode})</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Period</span>
                  <span className="font-semibold text-slate-800">{viewingItem.monthName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Fiscal Quarter</span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {viewingItem.quarter} {viewingItem.year}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Status</span>
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                    {viewingItem.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Tests Conducted</span>
                  <span className="font-bold text-slate-900">{viewingItem.testsConducted.toLocaleString("en-IN")} tests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Growth Rate (MoM)</span>
                  <span className={`font-bold ${viewingItem.growthRate >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {viewingItem.growthRate >= 0 ? "+" : ""}{viewingItem.growthRate}%
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Gross Billing</span>
                  <span className="font-semibold text-slate-800">₹{viewingItem.grossBilling.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Discounts & Waivers</span>
                  <span className="font-bold text-rose-600">-₹{viewingItem.discounts.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Net Revenue</span>
                  <span className="font-bold text-emerald-600 text-base">₹{viewingItem.netRevenue.toLocaleString("en-IN")}</span>
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
                <h3 className="text-base font-semibold text-gray-900">Edit Monthly Record</h3>
                <p className="text-xs text-gray-500">{editingItem.monthName}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Month Name</label>
                  <input
                    type="text"
                    value={editingItem.monthName}
                    onChange={(e) => setEditingItem({ ...editingItem, monthName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Quarter</label>
                    <select
                      value={editingItem.quarter}
                      onChange={(e) => setEditingItem({ ...editingItem, quarter: e.target.value as QuarterType })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Year</label>
                    <input
                      type="number"
                      value={editingItem.year}
                      onChange={(e) => setEditingItem({ ...editingItem, year: Number(e.target.value) || 2026 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Tests Conducted</label>
                  <input
                    type="number"
                    value={editingItem.testsConducted}
                    onChange={(e) => setEditingItem({ ...editingItem, testsConducted: Number(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                    min={0}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Gross Billing (₹)</label>
                    <input
                      type="number"
                      value={editingItem.grossBilling}
                      onChange={(e) => {
                        const gross = Number(e.target.value) || 0;
                        setEditingItem({
                          ...editingItem,
                          grossBilling: gross,
                          netRevenue: gross - editingItem.discounts,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Discounts (₹)</label>
                    <input
                      type="number"
                      value={editingItem.discounts}
                      onChange={(e) => {
                        const disc = Number(e.target.value) || 0;
                        setEditingItem({
                          ...editingItem,
                          discounts: disc,
                          netRevenue: editingItem.grossBilling - disc,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="text-slate-500">Calculated Net Revenue:</span>
                  <div className="font-bold text-slate-900 text-sm">₹{editingItem.netRevenue.toLocaleString("en-IN")}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Growth Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.growthRate}
                      onChange={(e) => setEditingItem({ ...editingItem, growthRate: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Status</label>
                    <select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as MonthStatus })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Current Month">Current Month</option>
                      <option value="Projected">Projected</option>
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
                <h3 className="text-base font-semibold text-gray-900">Delete Monthly Record</h3>
                <p className="text-xs text-gray-500">{deletingItem.monthName}</p>
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
                    Are you sure you want to delete this monthly revenue record? This will remove the fiscal period entry from all KPI summaries and charts.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Period:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.monthName} ({deletingItem.quarter} {deletingItem.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tests Conducted:</span>
                  <span className="font-semibold text-slate-800">{deletingItem.testsConducted.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Billing:</span>
                  <span className="font-semibold text-slate-800">₹{deletingItem.grossBilling.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Revenue:</span>
                  <span className="font-bold text-rose-600">₹{deletingItem.netRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-slate-700">{deletingItem.status}</span>
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

export default MonthlyRevenue;


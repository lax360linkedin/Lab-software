import { useState, useMemo } from "react";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
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
];

const MonthlyRevenue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // KPI Calculations
  const totalNetTurnover = useMemo(() => {
    return MONTHLY_DATA.reduce((sum, item) => sum + item.netRevenue, 0);
  }, []);

  const totalGrossTurnover = useMemo(() => {
    return MONTHLY_DATA.reduce((sum, item) => sum + item.grossBilling, 0);
  }, []);

  const totalTestsOverall = useMemo(() => {
    return MONTHLY_DATA.reduce((sum, item) => sum + item.testsConducted, 0);
  }, []);

  const averageMonthlyRevenue = useMemo(() => {
    return MONTHLY_DATA.length > 0
      ? Math.round(totalNetTurnover / MONTHLY_DATA.length)
      : 0;
  }, [totalNetTurnover]);

  // Quarterly Summary
  const quarterlyBreakdown = useMemo(() => {
    const quarters: QuarterType[] = ["Q3", "Q2", "Q1", "Q4"];
    return quarters.map((q) => {
      const items = MONTHLY_DATA.filter((m) => m.quarter === q);
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
  }, [totalNetTurnover]);

  // Filtered List
  const filteredData = useMemo(() => {
    return MONTHLY_DATA.filter((item) => {
      const matchesSearch =
        item.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.toString().includes(searchTerm);

      const matchesQuarter =
        selectedQuarter === "All" || item.quarter === selectedQuarter;

      const matchesYear =
        selectedYear === "All" || item.year.toString() === selectedYear;

      return matchesSearch && matchesQuarter && matchesYear;
    });
  }, [searchTerm, selectedQuarter, selectedYear]);

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
            maxHeight="380px"
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
    </div>
  );
};

export default MonthlyRevenue;

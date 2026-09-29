import { useState, useMemo } from "react";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";

import "./revenue.css";

export interface TestRevenueItem {
  id: string;
  testCode: string;
  testName: string;
  department: "Hematology" | "Biochemistry" | "Endocrinology" | "Clinical Pathology" | "Microbiology";
  unitPrice: number;
  testsPerformed: number;
  totalRevenue: number;
  demandStatus: "High Volume" | "Moderate" | "Standard";
}

export interface DepartmentRevenueSummary {
  department: string;
  totalTests: number;
  totalRevenue: number;
  percentage: number;
  badgeClass: string;
  barColor: string;
}

// Realistic laboratory demo data for test-wise revenue
const TEST_REVENUE_DATA: TestRevenueItem[] = [
  {
    id: "TR-101",
    testCode: "HEM-01",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    unitPrice: 350,
    testsPerformed: 58,
    totalRevenue: 20300,
    demandStatus: "High Volume",
  },
  {
    id: "TR-102",
    testCode: "BIO-01",
    testName: "Liver Function Test (LFT)",
    department: "Biochemistry",
    unitPrice: 850,
    testsPerformed: 28,
    totalRevenue: 23800,
    demandStatus: "High Volume",
  },
  {
    id: "TR-103",
    testCode: "END-01",
    testName: "Thyroid Profile Total (T3, T4, TSH)",
    department: "Endocrinology",
    unitPrice: 950,
    testsPerformed: 28,
    totalRevenue: 26600,
    demandStatus: "High Volume",
  },
  {
    id: "TR-104",
    testCode: "BIO-02",
    testName: "Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)",
    department: "Biochemistry",
    unitPrice: 750,
    testsPerformed: 32,
    totalRevenue: 24000,
    demandStatus: "High Volume",
  },
  {
    id: "TR-105",
    testCode: "BIO-03",
    testName: "Fasting & Post-Prandial Blood Sugar (FBS + PPBS)",
    department: "Biochemistry",
    unitPrice: 200,
    testsPerformed: 45,
    totalRevenue: 9000,
    demandStatus: "High Volume",
  },
  {
    id: "TR-106",
    testCode: "PAT-01",
    testName: "Urine Routine & Microscopic Examination",
    department: "Clinical Pathology",
    unitPrice: 250,
    testsPerformed: 36,
    totalRevenue: 9000,
    demandStatus: "Moderate",
  },
  {
    id: "TR-107",
    testCode: "BIO-04",
    testName: "Glycated Hemoglobin (HbA1c)",
    department: "Biochemistry",
    unitPrice: 550,
    testsPerformed: 24,
    totalRevenue: 13200,
    demandStatus: "Moderate",
  },
  {
    id: "TR-108",
    testCode: "BIO-05",
    testName: "Kidney Function Test (KFT / RFT)",
    department: "Biochemistry",
    unitPrice: 800,
    testsPerformed: 19,
    totalRevenue: 15200,
    demandStatus: "Moderate",
  },
  {
    id: "TR-109",
    testCode: "END-02",
    testName: "Vitamin D3 (25-Hydroxycholecalciferol)",
    department: "Endocrinology",
    unitPrice: 1400,
    testsPerformed: 12,
    totalRevenue: 16800,
    demandStatus: "Moderate",
  },
  {
    id: "TR-110",
    testCode: "END-03",
    testName: "Vitamin B12 (Cyanocobalamin)",
    department: "Endocrinology",
    unitPrice: 1100,
    testsPerformed: 14,
    totalRevenue: 15400,
    demandStatus: "Moderate",
  },
  {
    id: "TR-111",
    testCode: "BIO-06",
    testName: "Serum Electrolytes (Sodium, Potassium, Chloride)",
    department: "Biochemistry",
    unitPrice: 600,
    testsPerformed: 16,
    totalRevenue: 9600,
    demandStatus: "Standard",
  },
  {
    id: "TR-112",
    testCode: "MIC-01",
    testName: "Dengue NS1 Antigen & IgM/IgG Antibody",
    department: "Microbiology",
    unitPrice: 1200,
    testsPerformed: 11,
    totalRevenue: 13200,
    demandStatus: "Standard",
  },
];

const columns = [
  "Test Code & Name",
  "Department",
  "Unit Price",
  "Tests Done",
  "Total Revenue",
  "Revenue Share",
  "Demand",
];

const Revenue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"revenue" | "tests" | "price" | "name">("revenue");
  const [timeRange, setTimeRange] = useState<"Today" | "This Week" | "This Month">("Today");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Overall Totals
  const overallTotalRevenue = useMemo(() => {
    return TEST_REVENUE_DATA.reduce((sum, item) => sum + item.totalRevenue, 0);
  }, []);

  const overallTotalTests = useMemo(() => {
    return TEST_REVENUE_DATA.reduce((sum, item) => sum + item.testsPerformed, 0);
  }, []);

  const overallAvgPrice = useMemo(() => {
    return overallTotalTests > 0
      ? Math.round(overallTotalRevenue / overallTotalTests)
      : 0;
  }, [overallTotalRevenue, overallTotalTests]);

  // Top Revenue Generating Test
  const topTest = useMemo(() => {
    return [...TEST_REVENUE_DATA].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  }, []);

  // Department Breakdown
  const departmentBreakdown = useMemo<DepartmentRevenueSummary[]>(() => {
    const depts: ("Hematology" | "Biochemistry" | "Endocrinology" | "Clinical Pathology" | "Microbiology")[] = [
      "Biochemistry",
      "Endocrinology",
      "Hematology",
      "Clinical Pathology",
      "Microbiology",
    ];

    return depts.map((dept) => {
      const items = TEST_REVENUE_DATA.filter((i) => i.department === dept);
      const totalRev = items.reduce((acc, i) => acc + i.totalRevenue, 0);
      const totalCount = items.reduce((acc, i) => acc + i.testsPerformed, 0);
      const percentage =
        overallTotalRevenue > 0
          ? Math.round((totalRev / overallTotalRevenue) * 100)
          : 0;

      let badgeClass = "dept-biochem";
      let barColor = "bg-blue-600";

      if (dept === "Endocrinology") {
        badgeClass = "dept-endo";
        barColor = "bg-purple-600";
      } else if (dept === "Hematology") {
        badgeClass = "dept-hema";
        barColor = "bg-rose-500";
      } else if (dept === "Clinical Pathology") {
        badgeClass = "dept-path";
        barColor = "bg-emerald-500";
      } else if (dept === "Microbiology") {
        badgeClass = "dept-micro";
        barColor = "bg-amber-500";
      }

      return {
        department: dept,
        totalTests: totalCount,
        totalRevenue: totalRev,
        percentage,
        badgeClass,
        barColor,
      };
    });
  }, [overallTotalRevenue]);

  // Filtered and Sorted Tests
  const filteredAndSortedTests = useMemo(() => {
    const result = TEST_REVENUE_DATA.filter((test) => {
      const matchesSearch =
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === "All" || test.department === selectedDept;

      return matchesSearch && matchesDept;
    });

    result.sort((a, b) => {
      if (sortBy === "revenue") {
        return b.totalRevenue - a.totalRevenue;
      }
      if (sortBy === "tests") {
        return b.testsPerformed - a.testsPerformed;
      }
      if (sortBy === "price") {
        return b.unitPrice - a.unitPrice;
      }
      return a.testName.localeCompare(b.testName);
    });

    return result;
  }, [searchTerm, selectedDept, sortBy]);

  const currentTests = useMemo(() => {
    return filteredAndSortedTests.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredAndSortedTests, currentPage, rowsPerPage]);

  // Top 5 Tests for Visual Ranking
  const topFiveTests = useMemo(() => {
    return [...TEST_REVENUE_DATA]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, []);

  return (
    <div className="revenue-page space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Department Revenue Analytics
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Test-wise Revenue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Performance analytics, volume statistics, and revenue contribution of laboratory investigations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["Today", "This Week", "This Month"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  timeRange === period
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <PrintOutlinedIcon className="text-base text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Test Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Test Revenue
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{overallTotalRevenue.toLocaleString("en-IN")}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUpOutlinedIcon className="text-sm" />
                <span>+16.4% higher demand</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <AccountBalanceWalletOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Total Tests Performed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Tests Conducted
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {overallTotalTests}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Across 12 catalog investigations
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ScienceOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Revenue per Test */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg. Revenue Per Test
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{overallAvgPrice.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Weighted test realization
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <AssessmentOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Top Performing Test */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Top Revenue Test
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-900 truncate max-w-[170px]" title={topTest?.testName}>
                {topTest?.testName || "Thyroid Profile"}
              </h3>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">
                ₹{topTest?.totalRevenue.toLocaleString("en-IN")} ({topTest?.testsPerformed} tests)
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <StarOutlineOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Department Share & Top Revenue Contributors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Revenue Share */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Department Revenue Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Share of laboratory gross income by diagnostic section.
              </p>
            </div>
            <BiotechOutlinedIcon className="text-slate-400 text-lg" />
          </div>

          <div className="space-y-4">
            {departmentBreakdown.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {dept.department}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({dept.totalTests} tests)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      ₹{dept.totalRevenue.toLocaleString("en-IN")}
                    </span>
                    <span className="w-10 text-right text-[11px] font-semibold text-slate-500">
                      {dept.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${dept.barColor}`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top 5 Revenue Drivers Ranking */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top Revenue Drivers
              </h3>
              <p className="text-xs text-slate-500">
                Highest performing diagnostic packages and panels.
              </p>
            </div>
            <TrendingUpOutlinedIcon className="text-slate-400 text-lg" />
          </div>

          <div className="space-y-3">
            {topFiveTests.map((item, index) => {
              const share = Math.round((item.totalRevenue / overallTotalRevenue) * 100);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 max-w-[220px] truncate">
                        {item.testName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.testsPerformed} tests • ₹{item.unitPrice} standard price
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{item.totalRevenue.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] font-medium text-blue-600">
                      {share}% total revenue
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Detailed Test-wise Revenue Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Laboratory Tests Breakdown
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Comprehensive list of individual test prices, volume processed, and aggregate revenue.
            </p>
          </div>

          {/* Search, Filter, Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <SearchOutlinedIcon className="absolute left-3 top-2.5 text-slate-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search test name or code..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Clinical Pathology">Clinical Pathology</option>
                <option value="Microbiology">Microbiology</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "revenue" | "tests" | "price" | "name");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="revenue">Sort by: Revenue (High to Low)</option>
                <option value="tests">Sort by: Tests Count</option>
                <option value="price">Sort by: Unit Price</option>
                <option value="name">Sort by: Test Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Table View using Common Table component */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentTests}
            maxHeight="430px"
            minWidth="1200px"
            emptyMessage="No laboratory tests match your selected criteria."
            renderRow={(item: TestRevenueItem) => {
              const sharePercent =
                overallTotalRevenue > 0
                  ? ((item.totalRevenue / overallTotalRevenue) * 100).toFixed(1)
                  : "0";

              return (
                <>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="font-semibold text-sm text-slate-900">
                      {item.testName}
                    </div>
                    <div className="text-xs font-mono text-blue-600">
                      {item.testCode}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.department === "Hematology"
                          ? "bg-rose-50 text-rose-600"
                          : item.department === "Biochemistry"
                          ? "bg-blue-50 text-blue-600"
                          : item.department === "Endocrinology"
                          ? "bg-purple-50 text-purple-600"
                          : item.department === "Clinical Pathology"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.department}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-sm text-slate-700">
                    ₹{item.unitPrice.toLocaleString("en-IN")}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <span className="font-semibold text-sm text-slate-900">
                      {item.testsPerformed}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <span className="font-bold text-sm text-slate-900">
                      ₹{item.totalRevenue.toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.min(Number(sharePercent) * 4, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 w-8 text-right">
                        {sharePercent}%
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.demandStatus === "High Volume"
                          ? "bg-blue-50 text-blue-700"
                          : item.demandStatus === "Moderate"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {item.demandStatus}
                    </span>
                  </td>
                </>
              );
            }}
          />
        </div>

        {/* Pagination Controls */}
        {filteredAndSortedTests.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredAndSortedTests.length}
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

export default Revenue;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import "./expenseDashboard.css";

interface RecentExpense {
  id: string;
  expenseCode: string;
  title: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  paymentMethod: "Bank Transfer" | "UPI" | "Cash" | "Corporate Card";
  status: "Paid" | "Pending" | "Under Review";
  createdBy: string;
}

const RECENT_EXPENSES: RecentExpense[] = [
  {
    id: "EXP-101",
    expenseCode: "EX-2026-081",
    title: "Beckman Coulter CBC Lyse Reagent (20L)",
    category: "Consumables",
    vendor: "Transasia Bio-Medicals Ltd.",
    amount: 18500,
    date: "28 Sep 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    createdBy: "Sushmitha (Admin)",
  },
  {
    id: "EXP-102",
    expenseCode: "EX-2026-080",
    title: "Cobas c311 Analyzer Calibration & QA",
    category: "Equipment Maintenance",
    vendor: "Roche Diagnostics Service",
    amount: 12000,
    date: "27 Sep 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    createdBy: "Er. Karthik Raja",
  },
  {
    id: "EXP-103",
    expenseCode: "EX-2026-079",
    title: "Vacutainer Blood Collection Tubes (2000 units)",
    category: "Laboratory Materials",
    vendor: "BD India Medical Supplies",
    amount: 8600,
    date: "26 Sep 2026",
    paymentMethod: "UPI",
    status: "Paid",
    createdBy: "Suresh Babu",
  },
  {
    id: "EXP-104",
    expenseCode: "EX-2026-078",
    title: "Biomedical Biohazard Waste Incineration Fee",
    category: "Cleaning",
    vendor: "Tamilnadu Waste Management Board",
    amount: 6500,
    date: "25 Sep 2026",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    createdBy: "Uma Maheshwari",
  },
  {
    id: "EXP-105",
    expenseCode: "EX-2026-077",
    title: "Commercial High-Tension Electricity Bill",
    category: "Electricity",
    vendor: "TANGEDCO",
    amount: 34200,
    date: "24 Sep 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    createdBy: "Sushmitha (Admin)",
  },
  {
    id: "EXP-106",
    expenseCode: "EX-2026-076",
    title: "High-Speed Centrifuge Rotor Replacement",
    category: "Equipment",
    vendor: "Remi Lab Equipment Pvt Ltd",
    amount: 11700,
    date: "23 Sep 2026",
    paymentMethod: "Corporate Card",
    status: "Under Review",
    createdBy: "Er. Karthik Raja",
  },
];

const CATEGORY_BREAKDOWN = [
  {
    category: "Consumables & Reagents",
    amount: 68400,
    budget: 80000,
    percentage: 47.9,
    color: "bg-blue-600",
  },
  {
    category: "Electricity & Utilities",
    amount: 34200,
    budget: 40000,
    percentage: 23.9,
    color: "bg-amber-600",
  },
  {
    category: "Equipment & Maintenance",
    amount: 23700,
    budget: 30000,
    percentage: 16.6,
    color: "bg-emerald-600",
  },
  {
    category: "Laboratory Materials",
    amount: 8600,
    budget: 15000,
    percentage: 6.0,
    color: "bg-purple-600",
  },
  {
    category: "Cleaning & Waste",
    amount: 6500,
    budget: 8000,
    percentage: 4.6,
    color: "bg-rose-600",
  },
  {
    category: "Office & Internet",
    amount: 1450,
    budget: 5000,
    percentage: 1.0,
    color: "bg-cyan-600",
  },
];

export default function ExpenseDashboard() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState("September 2026");

  // Metrics (Section 24.1 & 25)
  const todayExpense = 18500;
  const thisMonthExpense = 142850;
  const totalExpenseYTD = 894200;
  const pendingExpense = 18200;
  const configuredCategoriesCount = 14;
  const highestExpenseCategory = "Consumables & Reagents";
  const highestCategoryAmount = 68400;

  // Section 25: Revenue vs Expense
  const totalRevenueThisMonth = 485000; // From Financial Analysis Billing
  const netFinancialPosition = totalRevenueThisMonth - thisMonthExpense;
  const profitMarginPercent = ((netFinancialPosition / totalRevenueThisMonth) * 100).toFixed(1);

  return (
    <div className="expense-dashboard-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Expenses</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Expense Dashboard</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
            Expense Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Track laboratory operational expenses, reagent costs, vendor payables, and net financial position.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <PrintOutlinedIcon sx={{ fontSize: 16 }} />
            Print
          </button>

          <button
            type="button"
            onClick={() => navigate("/expenses/add")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Section 24.1: Six Exact Expense KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* 1. Today's Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Today's Expenses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{todayExpense.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">1 voucher recorded</p>
        </div>

        {/* 2. This Month's Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              This Month
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{thisMonthExpense.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">83.0% of budget</p>
        </div>

        {/* 3. Total Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <PaymentsOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{totalExpenseYTD.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Year-to-date total</p>
        </div>

        {/* 4. Pending Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pending Expenses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <PendingActionsOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-amber-700">
              ₹{pendingExpense.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">2 pending clearance</p>
        </div>

        {/* 5. Expense Categories */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <CategoryOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              {configuredCategoriesCount}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Configured centers</p>
        </div>

        {/* 6. Highest Expense Category */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Highest Category
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AssessmentOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 truncate block" title={highestExpenseCategory}>
              {highestExpenseCategory}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600 font-semibold">
            ₹{highestCategoryAmount.toLocaleString("en-IN")} (47.9%)
          </p>
        </div>
      </div>

      {/* Section 25: Revenue vs Expense (Net Financial Position) */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
              <TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />
              <span>Section 25 • Revenue vs Expense</span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
              Net Financial Position = Total Revenue − Total Expenses
            </h2>
            <p className="mt-1 text-xs text-blue-200 max-w-xl">
              Connects laboratory revenue collections with operational costs for management reporting and net operating margin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-blue-200">Total Revenue</p>
              <p className="text-lg font-extrabold text-emerald-400">
                ₹{totalRevenueThisMonth.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-blue-300">From patient collections</p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4 pt-2 sm:pt-0">
              <p className="text-[11px] uppercase tracking-wider text-blue-200">Total Expenses</p>
              <p className="text-lg font-extrabold text-rose-400">
                ₹{thisMonthExpense.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-blue-300">All cost centers</p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4 pt-2 sm:pt-0">
              <p className="text-[11px] uppercase tracking-wider text-blue-200">Net Position (Profit)</p>
              <p className="text-lg font-extrabold text-white">
                ₹{netFinancialPosition.toLocaleString("en-IN")}
              </p>
              <span className="inline-block rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5">
                +{profitMarginPercent}% Operating Margin
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Ratio Bar */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
            <span>Expenses Share: {((thisMonthExpense / totalRevenueThisMonth) * 100).toFixed(1)}%</span>
            <span>Net Retained Margin: {profitMarginPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden flex">
            <div
              className="bg-rose-400 h-full"
              style={{ width: `${(thisMonthExpense / totalRevenueThisMonth) * 100}%` }}
              title="Expenses"
            />
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${(netFinancialPosition / totalRevenueThisMonth) * 100}%` }}
              title="Net Profit"
            />
          </div>
        </div>
      </div>

      {/* Mid Section: Budget Utilization & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget Health Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Budget Health</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Monthly allocated budget vs actual spending
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Under Budget
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Budget Consumed (83.0%)</span>
                <span className="text-slate-900">
                  ₹{thisMonthExpense.toLocaleString("en-IN")} / ₹1,72,000
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `83%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Remaining Budget</span>
                <span className="font-bold text-emerald-600">
                  ₹{(172000 - thisMonthExpense).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Daily Average Spend</span>
                <span className="font-bold text-slate-700">
                  ₹{Math.round(thisMonthExpense / 28).toLocaleString("en-IN")} / day
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/expenses/categories")}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <CategoryOutlinedIcon sx={{ fontSize: 16 }} className="text-blue-600" />
                  <span>Configure Categories (14 Types)</span>
                </div>
                <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/expenses/reports")}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <BarChartOutlinedIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
                  <span>View Detailed Cost Reports</span>
                </div>
                <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Spending by Category</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Departmental and operational cost breakdown for {selectedMonth}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/expenses/categories")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Categories →
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {CATEGORY_BREAKDOWN.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expense Transactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Expense Entries</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Latest operational and diagnostic purchase records
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/expenses/list")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />
            Full Ledger
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider">
                <th className="pb-3 pl-2">Voucher / ID</th>
                <th className="pb-3">Title & Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Paid To / Vendor</th>
                <th className="pb-3">Created By</th>
                <th className="pb-3 text-right">Amount (₹)</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_EXPENSES.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2 font-mono font-semibold text-blue-600">
                    {exp.expenseCode}
                  </td>
                  <td className="py-3 font-semibold text-slate-800">{exp.title}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{exp.vendor}</td>
                  <td className="py-3 text-slate-500 font-medium">{exp.createdBy}</td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        exp.status === "Paid"
                          ? "bg-green-50 text-green-700"
                          : exp.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { getTodayLabel, getFormattedCurrentDate } from "../../../common components/dateUtils";

import "./totalBilling.css";

export type BillingCategory = "Walk-in" | "Doctor Referral" | "Corporate" | "Home Collection";
export type BillingStatus = "Paid" | "Partially Paid" | "Unpaid";

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  patientName: string;
  patientId: string;
  doctorReferral: string;
  category: BillingCategory;
  testsSummary: string;
  itemsCount: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  status: BillingStatus;
}

const todayDate = getFormattedCurrentDate();

const BILLING_INVOICES: BillingInvoice[] = [
  {
    id: "INV-101",
    invoiceNumber: "BILL-2026-1041",
    date: todayDate,
    time: "08:15 AM",
    patientName: "Arun Kumar",
    patientId: "PAT-1001",
    doctorReferral: "Dr. John Smith",
    category: "Walk-in",
    testsSummary: "Complete Blood Count (CBC)",
    itemsCount: 1,
    grossAmount: 350,
    discountAmount: 0,
    netAmount: 350,
    status: "Paid",
  },
  {
    id: "INV-102",
    invoiceNumber: "BILL-2026-1042",
    date: todayDate,
    time: "08:30 AM",
    patientName: "Meena Devi",
    patientId: "PAT-1002",
    doctorReferral: "Dr. Sarah Wilson",
    category: "Doctor Referral",
    testsSummary: "Lipid Profile & Glucose Fasting",
    itemsCount: 2,
    grossAmount: 950,
    discountAmount: 50,
    netAmount: 900,
    status: "Paid",
  },
  {
    id: "INV-103",
    invoiceNumber: "BILL-2026-1043",
    date: todayDate,
    time: "08:50 AM",
    patientName: "Rajesh Kannan",
    patientId: "PID-4421",
    doctorReferral: "Dr. K. Ramanathan",
    category: "Walk-in",
    testsSummary: "CBC + ESR + Platelet Count",
    itemsCount: 2,
    grossAmount: 650,
    discountAmount: 0,
    netAmount: 650,
    status: "Paid",
  },
  {
    id: "INV-104",
    invoiceNumber: "BILL-2026-1044",
    date: todayDate,
    time: "09:10 AM",
    patientName: "Sunita Verma",
    patientId: "PID-4420",
    doctorReferral: "Self / Direct",
    category: "Corporate",
    testsSummary: "Executive Master Health Package",
    itemsCount: 8,
    grossAmount: 3200,
    discountAmount: 400,
    netAmount: 2800,
    status: "Paid",
  },
  {
    id: "INV-105",
    invoiceNumber: "BILL-2026-1045",
    date: todayDate,
    time: "09:35 AM",
    patientName: "Vikram Malhotra",
    patientId: "PID-4417",
    doctorReferral: "Dr. Anita Desai",
    category: "Doctor Referral",
    testsSummary: "Cardiac Risk Panel + HbA1c",
    itemsCount: 4,
    grossAmount: 2400,
    discountAmount: 200,
    netAmount: 2200,
    status: "Paid",
  },
  {
    id: "INV-106",
    invoiceNumber: "BILL-2026-1046",
    date: todayDate,
    time: "10:00 AM",
    patientName: "Farhana Begum",
    patientId: "PID-4418",
    doctorReferral: "Dr. M. Senthil",
    category: "Home Collection",
    testsSummary: "Thyroid Profile + Vitamin D3",
    itemsCount: 2,
    grossAmount: 2350,
    discountAmount: 150,
    netAmount: 2200,
    status: "Partially Paid",
  },
  {
    id: "INV-107",
    invoiceNumber: "BILL-2026-1047",
    date: todayDate,
    time: "10:20 AM",
    patientName: "Gopalakrishnan S.",
    patientId: "PID-4415",
    doctorReferral: "Dr. K. Ramanathan",
    category: "Walk-in",
    testsSummary: "Urine Routine + Microscopic",
    itemsCount: 1,
    grossAmount: 300,
    discountAmount: 0,
    netAmount: 300,
    status: "Paid",
  },
  {
    id: "INV-108",
    invoiceNumber: "BILL-2026-1048",
    date: todayDate,
    time: "10:45 AM",
    patientName: "Deepa Ananth",
    patientId: "PID-4414",
    doctorReferral: "Dr. Sarah Wilson",
    category: "Doctor Referral",
    testsSummary: "Vitamin B12 & Vitamin D3 Serum",
    itemsCount: 2,
    grossAmount: 2500,
    discountAmount: 250,
    netAmount: 2250,
    status: "Paid",
  },
  {
    id: "INV-109",
    invoiceNumber: "BILL-2026-1049",
    date: todayDate,
    time: "11:15 AM",
    patientName: "Mohammed Rizwan",
    patientId: "PID-4413",
    doctorReferral: "Dr. M. Senthil",
    category: "Walk-in",
    testsSummary: "Dengue Duo (NS1 + IgM/IgG)",
    itemsCount: 1,
    grossAmount: 1600,
    discountAmount: 0,
    netAmount: 1600,
    status: "Paid",
  },
  {
    id: "INV-110",
    invoiceNumber: "BILL-2026-1050",
    date: todayDate,
    time: "11:40 AM",
    patientName: "Kavitha Natarajan",
    patientId: "PID-4416",
    doctorReferral: "Dr. John Smith",
    category: "Corporate",
    testsSummary: "Annual Pre-Employment Lab Panel",
    itemsCount: 6,
    grossAmount: 1800,
    discountAmount: 300,
    netAmount: 1500,
    status: "Partially Paid",
  },
  {
    id: "INV-111",
    invoiceNumber: "BILL-2026-1051",
    date: todayDate,
    time: "12:10 PM",
    patientName: "Senthil Nathan",
    patientId: "PID-4412",
    doctorReferral: "Dr. Anita Desai",
    category: "Home Collection",
    testsSummary: "Liver Function Test + Lipid Screen",
    itemsCount: 2,
    grossAmount: 1600,
    discountAmount: 100,
    netAmount: 1500,
    status: "Unpaid",
  },
  {
    id: "INV-112",
    invoiceNumber: "BILL-2026-1052",
    date: todayDate,
    time: "12:35 PM",
    patientName: "Ananya Iyer",
    patientId: "PID-4411",
    doctorReferral: "Dr. K. Ramanathan",
    category: "Walk-in",
    testsSummary: "Serum Iron Studies & Ferritin",
    itemsCount: 2,
    grossAmount: 1450,
    discountAmount: 0,
    netAmount: 1450,
    status: "Paid",
  },
  {
    id: "INV-113",
    invoiceNumber: "BILL-2026-1053",
    date: todayDate,
    time: "01:00 PM",
    patientName: "Balamurugan P.",
    patientId: "PID-4410",
    doctorReferral: "Dr. John Smith",
    category: "Doctor Referral",
    testsSummary: "Renal Function Panel & Electrolytes",
    itemsCount: 2,
    grossAmount: 1400,
    discountAmount: 100,
    netAmount: 1300,
    status: "Paid",
  },
];

const columns = [
  "Invoice ID",
  "Patient Details",
  "Doctor / Referral",
  "Bill Category",
  "Tests & Items",
  "Net Amount",
  "Status",
];

const TotalBilling = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Key KPI totals
  const totalGrossBilling = useMemo(() => {
    return BILLING_INVOICES.reduce((acc, inv) => acc + inv.grossAmount, 0);
  }, []);

  const totalNetBilling = useMemo(() => {
    return BILLING_INVOICES.reduce((acc, inv) => acc + inv.netAmount, 0);
  }, []);

  const totalInvoices = BILLING_INVOICES.length;

  const averageInvoice = useMemo(() => {
    return totalInvoices > 0 ? Math.round(totalNetBilling / totalInvoices) : 0;
  }, [totalNetBilling, totalInvoices]);

  const paidInvoicesCount = useMemo(() => {
    return BILLING_INVOICES.filter((inv) => inv.status === "Paid").length;
  }, []);

  const collectionRate = useMemo(() => {
    return totalInvoices > 0 ? Math.round((paidInvoicesCount / totalInvoices) * 100) : 0;
  }, [paidInvoicesCount, totalInvoices]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const categories: BillingCategory[] = [
      "Walk-in",
      "Doctor Referral",
      "Corporate",
      "Home Collection",
    ];

    return categories.map((cat) => {
      const items = BILLING_INVOICES.filter((inv) => inv.category === cat);
      const totalAmount = items.reduce((sum, inv) => sum + inv.netAmount, 0);
      const percentage = totalNetBilling > 0 ? Math.round((totalAmount / totalNetBilling) * 100) : 0;

      let color = "bg-blue-600";
      if (cat === "Doctor Referral") color = "bg-purple-600";
      if (cat === "Corporate") color = "bg-emerald-600";
      if (cat === "Home Collection") color = "bg-amber-600";

      return {
        category: cat,
        count: items.length,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [totalNetBilling]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return BILLING_INVOICES.filter((inv) => {
      const matchesSearch =
        inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.doctorReferral.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || inv.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" || inv.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const currentInvoices = useMemo(() => {
    return filteredInvoices.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredInvoices, currentPage, rowsPerPage]);


  return (
    <div className="total-billing-page space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Invoicing & Billings
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Total Billing
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consolidated overview of generated laboratory bills, revenue streams, and payment clearances.
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
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Net Billing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Net Billing
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalNetBilling.toLocaleString("en-IN")}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUpOutlinedIcon className="text-sm" />
                <span>Gross: ₹{totalGrossBilling.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptLongOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Invoices
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalInvoices}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                {paidInvoicesCount} fully cleared bills
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleOutlineOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Invoice Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average Bill Size
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{averageInvoice.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Per patient receipt average
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <AccountBalanceWalletOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Settlement Clearance Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Collection Clearance
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {collectionRate}%
              </h3>
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                High settlement ratio
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <MonetizationOnOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Billing Source Distribution
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Proportion of invoices generated by billing channel.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryBreakdown.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {cat.category}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {cat.percentage}%
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800">
                ₹{cat.totalAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                {cat.count} invoices issued
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${cat.color}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Billing Invoices Table Section */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Laboratory Invoices Ledger
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Comprehensive list of all patient bills and diagnostic invoices generated today.
            </p>
          </div>

          {/* Search, Category Filter, and Status Filter */}
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
                placeholder="Search patient, invoice, doctor..."
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
                <option value="All">All Categories</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Doctor Referral">Doctor Referral</option>
                <option value="Corporate">Corporate</option>
                <option value="Home Collection">Home Collection</option>
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
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentInvoices}
            maxHeight="380px"
            minWidth="1200px"
            emptyMessage="No billing records match your search criteria."
            renderRow={(inv: BillingInvoice) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-blue-600">
                    {inv.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-400">
                    {inv.date} • {inv.time}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-semibold text-slate-800">
                    {inv.patientName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {inv.patientId}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {inv.doctorReferral}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      inv.category === "Walk-in"
                        ? "bg-blue-50 text-blue-700"
                        : inv.category === "Doctor Referral"
                        ? "bg-purple-50 text-purple-700"
                        : inv.category === "Corporate"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {inv.category}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm text-slate-700 max-w-[220px] truncate">
                    {inv.testsSummary}
                  </div>
                  <div className="text-xs text-slate-400">
                    {inv.itemsCount} {inv.itemsCount === 1 ? "test" : "tests"}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="font-bold text-sm text-slate-900">
                    ₹{inv.netAmount.toLocaleString("en-IN")}
                  </div>
                  {inv.discountAmount > 0 && (
                    <div className="text-xs text-emerald-600">
                      -₹{inv.discountAmount} off
                    </div>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      inv.status === "Paid"
                        ? "bg-emerald-50 text-emerald-600"
                        : inv.status === "Partially Paid"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
              </>
            )}
          />
        </div>

        {/* Pagination Controls */}
        {filteredInvoices.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredInvoices.length}
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

export default TotalBilling;

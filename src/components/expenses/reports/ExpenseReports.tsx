import { useState, useMemo } from "react";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./expenseReports.css";

interface ExpenseReportEntry {
  id: string;
  voucherNo: string;
  date: string;
  category: string;
  department: string;
  vendor: string;
  vendorGstin: string;
  itemDescription: string;
  paymentMethod: string;
  subTotal: number;
  gstAmount: number;
  totalAmount: number;
  status: "Paid" | "Pending";
}

const REPORT_DATA: ExpenseReportEntry[] = [
  {
    id: "REP-001",
    voucherNo: "VCH-2026-001",
    date: "2026-09-28",
    category: "Reagents & Consumables",
    department: "Hematology",
    vendor: "Transasia Bio-Medicals Ltd.",
    vendorGstin: "27AAACT2819Q1ZN",
    itemDescription: "Beckman Coulter CBC Lyse & Diluent (20L)",
    paymentMethod: "Bank Transfer",
    subTotal: 15678,
    gstAmount: 2822,
    totalAmount: 18500,
    status: "Paid",
  },
  {
    id: "REP-002",
    voucherNo: "VCH-2026-002",
    date: "2026-09-27",
    category: "Equipment & Maintenance",
    department: "Biochemistry",
    vendor: "Roche Diagnostics India",
    vendorGstin: "27AABCR4081K1ZV",
    itemDescription: "Cobas c311 Chemistry Analyzer Calibration",
    paymentMethod: "Bank Transfer",
    subTotal: 10169,
    gstAmount: 1831,
    totalAmount: 12000,
    status: "Paid",
  },
  {
    id: "REP-003",
    voucherNo: "VCH-2026-003",
    date: "2026-09-26",
    category: "Biomedical Waste Disposal",
    department: "Safety & Sanitation",
    vendor: "Medicare Environmental Management Pvt Ltd",
    vendorGstin: "33AABCM9110B1ZY",
    itemDescription: "Monthly yellow & red biohazard waste collection",
    paymentMethod: "UPI",
    subTotal: 6500,
    gstAmount: 0,
    totalAmount: 6500,
    status: "Paid",
  },
  {
    id: "REP-004",
    voucherNo: "VCH-2026-004",
    date: "2026-09-25",
    category: "Reagents & Consumables",
    department: "Microbiology",
    vendor: "HiMedia Laboratories Pvt Ltd",
    vendorGstin: "27AAACH0102L1ZH",
    itemDescription: "Blood Agar, MacConkey Agar Plates & Antibiotic Discs",
    paymentMethod: "Corporate Card",
    subTotal: 7966,
    gstAmount: 1434,
    totalAmount: 9400,
    status: "Paid",
  },
  {
    id: "REP-005",
    voucherNo: "VCH-2026-005",
    date: "2026-09-24",
    category: "Quality Assurance & EQAS",
    department: "Quality & Compliance",
    vendor: "CMC Vellore EQAS Cell",
    vendorGstin: "33AAAAC0101M1ZQ",
    itemDescription: "Annual External Quality Assessment Cycle Renewal",
    paymentMethod: "Bank Transfer",
    subTotal: 22000,
    gstAmount: 0,
    totalAmount: 22000,
    status: "Paid",
  },
  {
    id: "REP-006",
    voucherNo: "VCH-2026-006",
    date: "2026-09-23",
    category: "Logistics & Phlebotomy",
    department: "Field Phlebotomy",
    vendor: "Apex Diagnostic Courier Logistics",
    vendorGstin: "33AABCA2233M1ZD",
    itemDescription: "Cold-chain home sample courier services (Week 3)",
    paymentMethod: "UPI",
    subTotal: 4068,
    gstAmount: 732,
    totalAmount: 4800,
    status: "Paid",
  },
  {
    id: "REP-007",
    voucherNo: "VCH-2026-007",
    date: "2026-09-22",
    category: "Utilities & Facility",
    department: "Facility Operations",
    vendor: "Tamil Nadu Generation and Distribution Corp",
    vendorGstin: "33AABCT3918C1ZW",
    itemDescription: "Main diagnostic center commercial electricity tariff",
    paymentMethod: "Bank Transfer",
    subTotal: 34200,
    gstAmount: 0,
    totalAmount: 34200,
    status: "Paid",
  },
  {
    id: "REP-008",
    voucherNo: "VCH-2026-008",
    date: "2026-09-21",
    category: "Office Supplies & IT",
    department: "Front Office & IT",
    vendor: "Syscon Barcode & Solutions",
    vendorGstin: "33AAECS5591P1ZK",
    itemDescription: "Thermal specimen barcode roll labels (25,000 tags)",
    paymentMethod: "Corporate Card",
    subTotal: 4407,
    gstAmount: 793,
    totalAmount: 5200,
    status: "Paid",
  },
  {
    id: "REP-009",
    voucherNo: "VCH-2026-009",
    date: "2026-09-20",
    category: "Reagents & Consumables",
    department: "Hematology",
    vendor: "Becton Dickinson India Pvt Ltd",
    vendorGstin: "06AAACB2488P1ZG",
    itemDescription: "EDTA K2 Vacutainer blood collection tubes (1,000 pcs)",
    paymentMethod: "Bank Transfer",
    subTotal: 13390,
    gstAmount: 2410,
    totalAmount: 15800,
    status: "Paid",
  },
  {
    id: "REP-010",
    voucherNo: "VCH-2026-010",
    date: "2026-09-18",
    category: "Equipment & Maintenance",
    department: "Biochemistry",
    vendor: "Wipro GE Healthcare Pvt Ltd",
    vendorGstin: "29AAACW0111A1ZI",
    itemDescription: "Centrifuge rotor balancing and tachometer calibration",
    paymentMethod: "Bank Transfer",
    subTotal: 6780,
    gstAmount: 1220,
    totalAmount: 8000,
    status: "Paid",
  },
  {
    id: "REP-011",
    voucherNo: "VCH-2026-011",
    date: "2026-09-15",
    category: "Staff Safety & Training",
    department: "Safety & Sanitation",
    vendor: "Surgicare Medical Supplies",
    vendorGstin: "33AAAFS2201R1ZQ",
    itemDescription: "Nitrile disposable gloves & N95 respiratory masks",
    paymentMethod: "Cash",
    subTotal: 3000,
    gstAmount: 360,
    totalAmount: 3360,
    status: "Paid",
  },
  {
    id: "REP-012",
    voucherNo: "VCH-2026-012",
    date: "2026-09-12",
    category: "Utilities & Facility",
    department: "Facility Operations",
    vendor: "AquaPure Water Filtration Systems",
    vendorGstin: "33AADFA9912K1ZY",
    itemDescription: "Type-1 Clinical laboratory reagent water RO membrane",
    paymentMethod: "Bank Transfer",
    subTotal: 12500,
    gstAmount: 2250,
    totalAmount: 14750,
    status: "Paid",
  },
];

export default function ExpenseReports() {
  const [datePreset, setDatePreset] = useState("this_month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Data
  const filteredData = useMemo(() => {
    return REPORT_DATA.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesDept =
        departmentFilter === "all" || item.department === departmentFilter;
      const matchesPayment =
        paymentFilter === "all" || item.paymentMethod === paymentFilter;

      let matchesDate = true;
      if (startDate && item.date < startDate) matchesDate = false;
      if (endDate && item.date > endDate) matchesDate = false;

      return matchesCategory && matchesDept && matchesPayment && matchesDate;
    });
  }, [categoryFilter, departmentFilter, paymentFilter, startDate, endDate]);

  // Aggregate Metrics
  const totalExpenditure = useMemo(
    () => filteredData.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [filteredData]
  );

  const totalGst = useMemo(
    () => filteredData.reduce((acc, curr) => acc + curr.gstAmount, 0),
    [filteredData]
  );

  const totalSubTotal = useMemo(
    () => filteredData.reduce((acc, curr) => acc + curr.subTotal, 0),
    [filteredData]
  );

  // Department Breakdown
  const deptBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((item) => {
      map[item.department] = (map[item.department] || 0) + item.totalAmount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredData]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleExportCSV = () => {
    const headers = [
      "Voucher No",
      "Date",
      "Category",
      "Department",
      "Vendor",
      "GSTIN",
      "Description",
      "Payment Mode",
      "Sub Total (INR)",
      "GST (INR)",
      "Total Amount (INR)",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      `"${item.voucherNo}"`,
      `"${item.date}"`,
      `"${item.category}"`,
      `"${item.department}"`,
      `"${item.vendor}"`,
      `"${item.vendorGstin}"`,
      `"${item.itemDescription}"`,
      `"${item.paymentMethod}"`,
      item.subTotal,
      item.gstAmount,
      item.totalAmount,
      `"${item.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Lab_Expense_Report_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    "Voucher / Date",
    "Vendor & GSTIN",
    "Category & Item",
    "Department",
    "Payment Mode",
    "Taxable (₹)",
    "GST (₹)",
    "Net Total (₹)",
  ];

  return (
    <div className="expense-reports-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Expenses</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">Audit Ledger</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Lab Expense & GST Audit Reports
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Generate statement ledgers, tax claimable summaries, and departmental cost allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <PrintOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Net Expenditures
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <ReceiptLongOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹ {totalExpenditure.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {filteredData.length} recorded vouchers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Taxable Value
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <AccountBalanceWalletOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹ {totalSubTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Base invoice amounts</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              GST / Input Tax Credit
            </p>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <RequestQuoteOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹ {totalGst.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-indigo-600 font-medium">Claimable GST Input (ITC)</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Department Outlay
            </p>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <StorefrontOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 truncate">
            {deptBreakdown[0] ? deptBreakdown[0][0] : "None"}
          </p>
          <p className="mt-1 text-xs text-purple-600 font-medium">
            ₹ {deptBreakdown[0] ? deptBreakdown[0][1].toLocaleString("en-IN") : 0}
          </p>
        </div>
      </div>

      {/* Filter Ribbon Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <FilterAltOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-600" />
          <span>Report Filter Parameters</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => {
                const val = e.target.value;
                setDatePreset(val);
                if (val === "this_month") {
                  setStartDate("2026-09-01");
                  setEndDate("2026-09-30");
                } else if (val === "last_month") {
                  setStartDate("2026-08-01");
                  setEndDate("2026-08-31");
                } else if (val === "this_quarter") {
                  setStartDate("2026-07-01");
                  setEndDate("2026-09-30");
                }
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="this_month">This Month (September 2026)</option>
              <option value="last_month">Last Month (August 2026)</option>
              <option value="this_quarter">Q3 (Jul - Sep 2026)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="Reagents & Consumables">Reagents & Consumables</option>
              <option value="Equipment & Maintenance">Equipment & Maintenance</option>
              <option value="Biomedical Waste Disposal">Biomedical Waste Disposal</option>
              <option value="Utilities & Facility">Utilities & Facility</option>
              <option value="Quality Assurance & EQAS">Quality Assurance & EQAS</option>
              <option value="Logistics & Phlebotomy">Logistics & Phlebotomy</option>
              <option value="Office Supplies & IT">Office Supplies & IT</option>
              <option value="Staff Safety & Training">Staff Safety & Training</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Safety & Sanitation">Safety & Sanitation</option>
              <option value="Quality & Compliance">Quality & Compliance</option>
              <option value="Facility Operations">Facility Operations</option>
              <option value="Field Phlebotomy">Field Phlebotomy</option>
              <option value="Front Office & IT">Front Office & IT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Payment Mode
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Modes</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Corporate Card">Corporate Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        {datePreset === "custom" && (
          <div className="mt-3 flex items-center gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Ledger Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Detailed Expense Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Displaying {filteredData.length} records matching applied filters
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Statement Total: <span className="font-bold text-slate-900">₹ {totalExpenditure.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedData}
            maxHeight="380px"
            minWidth="1200px"
            emptyMessage="No expense records match the selected report filters."
            renderRow={(item: ExpenseReportEntry) => (
              <>
                <td className="whitespace-nowrap px-4 py-3.5 text-left">
                  <div className="font-semibold text-slate-900 text-sm">{item.voucherNo}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{item.date}</div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-left">
                  <div className="font-medium text-slate-800 text-sm">{item.vendor}</div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">{item.vendorGstin}</div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-left">
                  <div className="font-medium text-slate-900 text-sm">{item.category}</div>
                  <div className="text-xs text-slate-500 max-w-xs truncate mt-0.5">
                    {item.itemDescription}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-left">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {item.department}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-left">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {item.paymentMethod}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-mono text-slate-700">
                  ₹ {item.subTotal.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-mono text-indigo-600 font-semibold">
                  {item.gstAmount > 0 ? `₹ ${item.gstAmount.toLocaleString("en-IN")}` : "₹ 0.00"}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-900">
                  ₹ {item.totalAmount.toLocaleString("en-IN")}
                </td>
              </>
            )}
          />
        </div>

        {/* Standard Pagination matching Patient List & Financial Analysis */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <Pagination
            totalItems={filteredData.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

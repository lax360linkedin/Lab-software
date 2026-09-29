import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { EXPENSE_CATEGORIES } from "../add-expense/AddExpense";
import "./expenseList.css";

export interface ExpenseItem {
  id: string;
  voucherNo: string;
  title: string;
  category: string;
  vendor: string;
  invoiceNo: string;
  paymentMethod: "Bank Transfer" | "UPI" | "Corporate Card" | "Cash";
  date: string;
  department: string;
  amount: number;
  status: "Paid" | "Pending" | "Under Review" | "Cancelled";
  createdBy: string;
  notes?: string;
  attachmentName?: string;
}

const INITIAL_EXPENSES_DATA: ExpenseItem[] = [
  {
    id: "1",
    voucherNo: "EXP-2026-001",
    title: "Beckman Coulter CBC Lyse & Diluent (20L)",
    category: "Consumables",
    vendor: "Transasia Bio-Medicals Ltd.",
    invoiceNo: "INV-TB-8812",
    paymentMethod: "Bank Transfer",
    date: "28 Sep 2026",
    department: "Hematology",
    amount: 18500,
    status: "Paid",
    createdBy: "Sushmitha (Admin)",
    notes: "Batch: BX-9941. Exp: Oct 2027.",
    attachmentName: "Transasia_Invoice_8812.pdf",
  },
  {
    id: "2",
    voucherNo: "EXP-2026-002",
    title: "Cobas c311 Chemistry Analyzer Calibration",
    category: "Equipment Maintenance",
    vendor: "Roche Diagnostics India",
    invoiceNo: "ROCHE-CAL-441",
    paymentMethod: "Bank Transfer",
    date: "27 Sep 2026",
    department: "Biochemistry",
    amount: 12000,
    status: "Paid",
    createdBy: "Er. Karthik Raja",
    notes: "Annual QA certification renewed.",
    attachmentName: "Roche_Calibration_Report.pdf",
  },
  {
    id: "3",
    voucherNo: "EXP-2026-003",
    title: "Vacutainer Blood Collection Tubes (2000 pcs)",
    category: "Laboratory Materials",
    vendor: "BD India Medical Supplies",
    invoiceNo: "BD-VAC-902",
    paymentMethod: "UPI",
    date: "26 Sep 2026",
    department: "General Laboratory",
    amount: 8600,
    status: "Paid",
    createdBy: "Suresh Babu",
    notes: "K2 EDTA and Serum gel separator tubes.",
    attachmentName: "BD_Voucher_902.pdf",
  },
  {
    id: "4",
    voucherNo: "EXP-2026-004",
    title: "Biohazard Medical Waste Incineration Fee",
    category: "Cleaning",
    vendor: "Tamilnadu Waste Management Board",
    invoiceNo: "TNW-SEP-12",
    paymentMethod: "Bank Transfer",
    date: "25 Sep 2026",
    department: "Safety & Sanitation",
    amount: 6500,
    status: "Pending",
    createdBy: "Uma Maheshwari",
    notes: "Monthly yellow & red bag disposal clearance.",
    attachmentName: "Waste_Log_Receipt.pdf",
  },
  {
    id: "5",
    voucherNo: "EXP-2026-005",
    title: "Commercial High-Tension Electricity Bill",
    category: "Electricity",
    vendor: "TANGEDCO Tamil Nadu",
    invoiceNo: "EB-HT-9921",
    paymentMethod: "Bank Transfer",
    date: "24 Sep 2026",
    department: "Facility Operations",
    amount: 34200,
    status: "Paid",
    createdBy: "Sushmitha (Admin)",
    notes: "Continuous chiller UPS power bill.",
    attachmentName: "TANGEDCO_SEP_Bill.pdf",
  },
  {
    id: "6",
    voucherNo: "EXP-2026-006",
    title: "High-Speed Centrifuge Rotor Replacement",
    category: "Equipment",
    vendor: "Remi Lab Equipment Pvt Ltd",
    invoiceNo: "RMI-EQ-551",
    paymentMethod: "Corporate Card",
    date: "23 Sep 2026",
    department: "Biochemistry",
    amount: 11700,
    status: "Under Review",
    createdBy: "Er. Karthik Raja",
    notes: "Replacement of worn 24-place microtube rotor.",
    attachmentName: "Remi_Rotor_Quotation.pdf",
  },
  {
    id: "7",
    voucherNo: "EXP-2026-007",
    title: "HPLC Reagent Cartridges (Pack of 4)",
    category: "Consumables",
    vendor: "Bio-Rad Laboratories India",
    invoiceNo: "BR-HBA-5510",
    paymentMethod: "Bank Transfer",
    date: "22 Sep 2026",
    department: "Biochemistry",
    amount: 15400,
    status: "Paid",
    createdBy: "Dr. Arvind Swamy",
    notes: "Reagent storage temperature verified (2-8°C).",
    attachmentName: "BioRad_Invoice_5510.pdf",
  },
  {
    id: "8",
    voucherNo: "EXP-2026-008",
    title: "Laboratory Air Conditioning & HEPA Filter Service",
    category: "Equipment Maintenance",
    vendor: "Cooltech Lab HVAC Solutions",
    invoiceNo: "HVAC-SVC-78",
    paymentMethod: "UPI",
    date: "20 Sep 2026",
    department: "General Laboratory",
    amount: 5800,
    status: "Paid",
    createdBy: "Er. Karthik Raja",
    notes: "Quarterly cleanroom HVAC filter clean.",
    attachmentName: "HVAC_Service_Chit.pdf",
  },
  {
    id: "9",
    voucherNo: "EXP-2026-009",
    title: "Phlebotomist Home Collection Petrol Allowance",
    category: "Transportation",
    vendor: "Staff Field Travel Reimbursement",
    invoiceNo: "EXP-CL-009",
    paymentMethod: "Cash",
    date: "18 Sep 2026",
    department: "Field Phlebotomy",
    amount: 4800,
    status: "Paid",
    createdBy: "Suresh Babu",
    notes: "Travel log validated with GPS km records.",
    attachmentName: "Travel_Summary_Sheet.pdf",
  },
  {
    id: "10",
    voucherNo: "EXP-2026-010",
    title: "Premises Commercial Lease & Building Rent",
    category: "Rent",
    vendor: "Sri Balaji Commercial Properties",
    invoiceNo: "RENT-SEP-26",
    paymentMethod: "Bank Transfer",
    date: "05 Sep 2026",
    department: "Facility Operations",
    amount: 75000,
    status: "Paid",
    createdBy: "Sushmitha (Admin)",
    notes: "Diagnostic center building rent for September.",
    attachmentName: "Rent_Lease_Receipt.pdf",
  },
  {
    id: "11",
    voucherNo: "EXP-2026-011",
    title: "High-Speed Optical Fiber Internet (500 Mbps)",
    category: "Internet",
    vendor: "Airtel Business Enterprise",
    invoiceNo: "AIR-BB-9901",
    paymentMethod: "Corporate Card",
    date: "02 Sep 2026",
    department: "Front Office & IT",
    amount: 3499,
    status: "Paid",
    createdBy: "Deepak S.",
    notes: "LIS cloud database sync connection.",
    attachmentName: "Airtel_Bill_Sep.pdf",
  },
  {
    id: "12",
    voucherNo: "EXP-2026-012",
    title: "Thermal Barcode Labels & Printer Ribbons",
    category: "Office Expenses",
    vendor: "Zebra Tech Supplies",
    invoiceNo: "ZB-LBL-410",
    paymentMethod: "Cash",
    date: "01 Sep 2026",
    department: "Administration & Reception",
    amount: 2900,
    status: "Paid",
    createdBy: "Deepa Raman",
    notes: "Accession barcode labels (10,000 tags).",
    attachmentName: "Zebra_Barcode_Challan.pdf",
  },
];

// Section 24.4 Columns
const columns = [
  "Expense ID",
  "Date",
  "Expense",
  "Category",
  "Amount",
  "Paid To",
  "Payment Mode",
  "Status",
  "Created By",
  "Actions",
];

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals State
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<ExpenseItem | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesStat =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStat;
    });
  }, [expenses, searchTerm, selectedCategory, selectedStatus]);

  const currentExpenses = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredExpenses.slice(start, start + rowsPerPage);
  }, [filteredExpenses, currentPage, rowsPerPage]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  // Cancel Voucher Action
  const handleCancelVoucher = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this expense voucher?")) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Cancelled" as const } : item
        )
      );
    }
  };

  // Save Edited Voucher
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setExpenses((prev) =>
      prev.map((item) => (item.id === editingExpense.id ? editingExpense : item))
    );
    setEditingExpense(null);
  };

  return (
    <div className="expense-list-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Expenses</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Section 24.4 Ledger</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900 sm:text-3xl">
            Expense List
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Complete transaction register of operational costs, diagnostic kits, vendor bills, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => {
              const headers = "Expense ID,Date,Expense,Category,Amount,Paid To,Payment Mode,Status,Created By\n";
              const rows = filteredExpenses
                .map(
                  (e) =>
                    `"${e.voucherNo}","${e.date}","${e.title}","${e.category}",${e.amount},"${e.vendor}","${e.paymentMethod}","${e.status}","${e.createdBy}"`
                )
                .join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "laboratory-expenses.csv";
              a.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            Export CSV
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

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Expense ID, title, vendor, or created by..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <FilterListIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                >
                  <option value="All">All Categories</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">
                Total: ₹{totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentExpenses}
            maxHeight="440px"
            minWidth="1200px"
            emptyMessage="No expense records match your search or filter criteria."
            renderRow={(exp: ExpenseItem) => (
              <>
                {/* 1. Expense ID */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs font-bold text-blue-600">
                  <div>{exp.voucherNo}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{exp.invoiceNo}</div>
                </td>

                {/* 2. Date */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                  {exp.date}
                </td>

                {/* 3. Expense Title */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="text-sm font-semibold text-slate-800 max-w-[220px] truncate">
                    {exp.title}
                  </div>
                  <div className="text-[11px] text-slate-400">Dept: {exp.department}</div>
                </td>

                {/* 4. Category */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {exp.category}
                  </span>
                </td>

                {/* 5. Amount */}
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-sm text-slate-900">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </td>

                {/* 6. Paid To */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-700">
                  {exp.vendor}
                </td>

                {/* 7. Payment Mode */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {exp.paymentMethod}
                  </span>
                </td>

                {/* 8. Status */}
                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      exp.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : exp.status === "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : exp.status === "Cancelled"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>

                {/* 9. Created By */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 font-medium">
                  {exp.createdBy}
                </td>

                {/* 10. Actions: View / Edit / Cancel / Attachment */}
                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {/* View */}
                    <button
                      type="button"
                      title="View Details"
                      onClick={() => setSelectedExpense(exp)}
                      className="rounded p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      title="Edit Expense"
                      onClick={() => setEditingExpense(exp)}
                      className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 17 }} />
                    </button>

                    {/* Attachment */}
                    <button
                      type="button"
                      title="View Attachment / Bill"
                      onClick={() => setAttachmentPreview(exp)}
                      className="rounded p-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      <AttachFileOutlinedIcon sx={{ fontSize: 17 }} />
                    </button>

                    {/* Cancel */}
                    <button
                      type="button"
                      title="Cancel Voucher"
                      onClick={() => handleCancelVoucher(exp.id)}
                      disabled={exp.status === "Cancelled"}
                      className={`rounded p-1 transition ${
                        exp.status === "Cancelled"
                          ? "opacity-30 cursor-not-allowed text-slate-300"
                          : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      <CancelOutlinedIcon sx={{ fontSize: 17 }} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        {/* Pagination */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <Pagination
            totalItems={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* 1. View Voucher Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Expense Voucher Details
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedExpense.voucherNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Expense Title:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[280px]">
                  {selectedExpense.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-800">{selectedExpense.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid To / Vendor:</span>
                <span className="font-semibold text-slate-800">{selectedExpense.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice / Ref No:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedExpense.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-slate-800">{selectedExpense.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-semibold text-slate-800">
                  {selectedExpense.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created By:</span>
                <span className="font-semibold text-blue-600">
                  {selectedExpense.createdBy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-slate-800">{selectedExpense.status}</span>
              </div>
              {selectedExpense.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="block text-slate-400 mb-0.5">Clinical / Account Notes:</span>
                  <p className="text-slate-700 italic">{selectedExpense.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Voucher Total
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{selectedExpense.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Voucher Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Edit Expense
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingExpense.voucherNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.title}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={editingExpense.category}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editingExpense.amount}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paid To / Vendor
                </label>
                <input
                  type="text"
                  value={editingExpense.vendor}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, vendor: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Attachment Preview Modal */}
      {attachmentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AttachFileOutlinedIcon className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Voucher Attachment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAttachmentPreview(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                PDF
              </div>
              <p className="text-xs font-bold text-slate-800">
                {attachmentPreview.attachmentName || "Scanned_Voucher_Receipt.pdf"}
              </p>
              <p className="text-[11px] text-slate-500">
                Uploaded by {attachmentPreview.createdBy} on {attachmentPreview.date}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAttachmentPreview(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading ${attachmentPreview.attachmentName || "Receipt.pdf"}...`);
                  setAttachmentPreview(null);
                }}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
              >
                Download Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

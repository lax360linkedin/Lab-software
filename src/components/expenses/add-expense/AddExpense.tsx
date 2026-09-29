import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import "./addExpense.css";


// Section 24.3 Configurable Categories
export const EXPENSE_CATEGORIES = [
  "Electricity",
  "Rent",
  "Equipment",
  "Equipment Maintenance",
  "Consumables",
  "Laboratory Materials",
  "Staff Expenses",
  "Salary-related Expenses",
  "Internet",
  "Telephone",
  "Transportation",
  "Cleaning",
  "Office Expenses",
  "Other",
];

const PAYMENT_MODES = [
  "Bank Transfer (NEFT/RTGS)",
  "UPI",
  "Corporate Card",
  "Cash",
  "Cheque",
];

const DEPARTMENTS = [
  "General Laboratory",
  "Biochemistry",
  "Hematology",
  "Clinical Pathology",
  "Microbiology",
  "Field Phlebotomy",
  "Administration & Reception",
];

export default function AddExpense() {
  const navigate = useNavigate();

  // Section 24.2 Add Expense fields
  const [formData, setFormData] = useState({
    title: "",
    category: "Consumables",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMode: PAYMENT_MODES[0],
    vendor: "",
    description: "",
    referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    createdBy: "Sushmitha (Administrator)",
    department: DEPARTMENTS[0],
    status: "Paid" as "Paid" | "Pending" | "Under Review",
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert("Please fill in the expense title and amount.");
      return;
    }

    setSuccessMessage(true);
    setTimeout(() => {
      navigate("/expenses/list");
    }, 1200);
  };

  return (
    <div className="add-expense-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Expenses</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">New Voucher</span>
            </div>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 sm:text-3xl">
              Add Expense
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Record operational expenditures separately from patient billing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/expenses/list")}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />
          View Expense List
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 animate-in fade-in">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-600" />
          <div>
            <h4 className="text-sm font-bold">Expense recorded successfully!</h4>
            <p className="text-xs text-emerald-700">Redirecting to the expense ledger...</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Expense Particulars */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Expense Particulars
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expense Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Beckman Coulter CBC Lyse Reagent (20L)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expense Category (24.3) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g., 18500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reference Number / Invoice No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., REF-99214 / INV-2026-081"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vendor, Payment & Staff Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Vendor & Payment Mode
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vendor / Paid To <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Transasia Bio-Medicals Ltd."
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Created By <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Clinical Notes
              </label>
              <textarea
                rows={3}
                placeholder="Batch number, expiry dates, or maintenance notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Status & Attachment */}
        <div className="space-y-6">
          {/* Section 3: Attachment / Bill */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Attachment / Bill
            </h2>

            <div className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50/20">
              <CloudUploadOutlinedIcon sx={{ fontSize: 32 }} className="text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                Upload Scanned Bill / Invoice
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
              <input
                type="file"
                id="bill-attachment"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <label
                htmlFor="bill-attachment"
                className="mt-3 inline-block cursor-pointer rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Browse File
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-xs">
                <div className="truncate font-medium text-blue-900">{fileName}</div>
                <span className="text-[11px] text-blue-600 font-mono">{fileSize}</span>
              </div>
            )}
          </div>

          {/* Section 4: Approval Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Voucher Status
            </h2>

            <div className="space-y-2">
              {(["Paid", "Pending", "Under Review"] as const).map((status) => (
                <label
                  key={status}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-semibold transition ${
                    formData.status === status
                      ? "border-blue-500 bg-blue-50/40 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{status}</span>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={() => setFormData({ ...formData, status })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Save Expense Voucher
              </button>
              <button
                type="button"
                onClick={() => navigate("/expenses")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Discard & Return
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

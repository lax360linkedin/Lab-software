import { useState, useMemo } from "react";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import { getTodayLabel, getFormattedCurrentDate } from "../../../common components/dateUtils";

import "./discounts.css";

export type DiscountSchemeType =
  | "Senior Citizen Concession"
  | "Health Camp Coupon"
  | "Doctor Courtesy"
  | "Staff / Dependent"
  | "Corporate Agreement";

export interface DiscountRecord {
  id: string;
  discountId: string;
  invoiceNumber: string;
  date: string;
  patientName: string;
  patientId: string;
  scheme: DiscountSchemeType;
  discountPercent: number;
  originalAmount: number;
  discountAmount: number;
  finalPayable: number;
  authorizedBy: string;
  reason: string;
}

const todayDate = getFormattedCurrentDate();

const DISCOUNT_RECORDS: DiscountRecord[] = [
  {
    id: "DSC-01",
    discountId: "DISC-2026-081",
    invoiceNumber: "BILL-2026-1042",
    date: todayDate,
    patientName: "Meena Devi",
    patientId: "PAT-1002",
    scheme: "Senior Citizen Concession",
    discountPercent: 10,
    originalAmount: 950,
    discountAmount: 95,
    finalPayable: 855,
    authorizedBy: "Front Desk Supervisor",
    reason: "Age 65+ Valid ID verified",
  },
  {
    id: "DSC-02",
    discountId: "DISC-2026-082",
    invoiceNumber: "BILL-2026-1044",
    date: todayDate,
    patientName: "Sunita Verma",
    patientId: "PID-4420",
    scheme: "Corporate Agreement",
    discountPercent: 15,
    originalAmount: 3200,
    discountAmount: 480,
    finalPayable: 2720,
    authorizedBy: "Marketing Head",
    reason: "MOU corporate client annual checkup",
  },
  {
    id: "DSC-03",
    discountId: "DISC-2026-083",
    invoiceNumber: "BILL-2026-1045",
    date: todayDate,
    patientName: "Vikram Malhotra",
    patientId: "PID-4417",
    scheme: "Doctor Courtesy",
    discountPercent: 10,
    originalAmount: 2400,
    discountAmount: 240,
    finalPayable: 2160,
    authorizedBy: "Dr. Anita Desai",
    reason: "Referred by Chief Physician",
  },
  {
    id: "DSC-04",
    discountId: "DISC-2026-084",
    invoiceNumber: "BILL-2026-1046",
    date: todayDate,
    patientName: "Farhana Begum",
    patientId: "PID-4418",
    scheme: "Health Camp Coupon",
    discountPercent: 15,
    originalAmount: 2350,
    discountAmount: 350,
    finalPayable: 2000,
    authorizedBy: "Camp Coordinator",
    reason: "World Diabetes Camp coupon code CAMP26",
  },
  {
    id: "DSC-05",
    discountId: "DISC-2026-085",
    invoiceNumber: "BILL-2026-1048",
    date: todayDate,
    patientName: "Deepa Ananth",
    patientId: "PID-4414",
    scheme: "Senior Citizen Concession",
    discountPercent: 10,
    originalAmount: 2500,
    discountAmount: 250,
    finalPayable: 2250,
    authorizedBy: "Front Desk Supervisor",
    reason: "Age 68 Senior citizen card presented",
  },
  {
    id: "DSC-06",
    discountId: "DISC-2026-086",
    invoiceNumber: "BILL-2026-1050",
    date: todayDate,
    patientName: "Kavitha Natarajan",
    patientId: "PID-4416",
    scheme: "Corporate Agreement",
    discountPercent: 15,
    originalAmount: 1800,
    discountAmount: 270,
    finalPayable: 1530,
    authorizedBy: "Corporate Desk",
    reason: "TechPark Corporate tie-up rate card",
  },
  {
    id: "DSC-07",
    discountId: "DISC-2026-087",
    invoiceNumber: "BILL-2026-1051",
    date: todayDate,
    patientName: "Senthil Nathan",
    patientId: "PID-4412",
    scheme: "Doctor Courtesy",
    discountPercent: 20,
    originalAmount: 1600,
    discountAmount: 320,
    finalPayable: 1280,
    authorizedBy: "Medical Director",
    reason: "Direct consultation request",
  },
  {
    id: "DSC-08",
    discountId: "DISC-2026-088",
    invoiceNumber: "BILL-2026-1053",
    date: todayDate,
    patientName: "Balamurugan P.",
    patientId: "PID-4410",
    scheme: "Health Camp Coupon",
    discountPercent: 10,
    originalAmount: 1400,
    discountAmount: 140,
    finalPayable: 1260,
    authorizedBy: "Front Desk Supervisor",
    reason: "Community awareness brochure voucher",
  },
  {
    id: "DSC-09",
    discountId: "DISC-2026-089",
    invoiceNumber: "BILL-2026-1054",
    date: todayDate,
    patientName: "Subhashini R.",
    patientId: "PID-4409",
    scheme: "Staff / Dependent",
    discountPercent: 30,
    originalAmount: 2100,
    discountAmount: 630,
    finalPayable: 1470,
    authorizedBy: "HR Manager",
    reason: "Lab technician direct dependent",
  },
  {
    id: "DSC-10",
    discountId: "DISC-2026-090",
    invoiceNumber: "BILL-2026-1055",
    date: todayDate,
    patientName: "Gajendran V.",
    patientId: "PID-4408",
    scheme: "Senior Citizen Concession",
    discountPercent: 10,
    originalAmount: 1100,
    discountAmount: 110,
    finalPayable: 990,
    authorizedBy: "Front Desk Supervisor",
    reason: "Age 72 pension passholder",
  },
  {
    id: "DSC-11",
    discountId: "DISC-2026-091",
    invoiceNumber: "BILL-2026-1056",
    date: todayDate,
    patientName: "Radha Venkatesh",
    patientId: "PID-4407",
    scheme: "Doctor Courtesy",
    discountPercent: 15,
    originalAmount: 1750,
    discountAmount: 260,
    finalPayable: 1490,
    authorizedBy: "Dr. K. Ramanathan",
    reason: "Long-standing family physician referral",
  },
  {
    id: "DSC-12",
    discountId: "DISC-2026-092",
    invoiceNumber: "BILL-2026-1057",
    date: todayDate,
    patientName: "Muruganandam K.",
    patientId: "PID-4406",
    scheme: "Health Camp Coupon",
    discountPercent: 15,
    originalAmount: 1900,
    discountAmount: 285,
    finalPayable: 1615,
    authorizedBy: "Camp Coordinator",
    reason: "Heart Day checkup voucher",
  },
];

const columns = [
  "Discount ID",
  "Invoice & Date",
  "Patient Details",
  "Discount Scheme",
  "Original Bill",
  "Concession",
  "Final Payable",
  "Authorized By",
  "Actions",
];

const Discounts = () => {
  const [records, setRecords] = useState<DiscountRecord[]>(DISCOUNT_RECORDS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewingDiscount, setViewingDiscount] = useState<DiscountRecord | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<DiscountRecord | null>(null);
  const [deletingDiscount, setDeletingDiscount] = useState<DiscountRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingDiscount) return;
    setRecords((prev) => prev.filter((r) => r.id !== deletingDiscount.id));
    setDeletingDiscount(null);
    showToast("Deleted successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === editingDiscount.id ? editingDiscount : r))
    );
    setEditingDiscount(null);
    showToast("Discount updated successfully");
  };

  // KPI Calculations
  const totalDiscountAmount = useMemo(() => {
    return records.reduce((sum, d) => sum + d.discountAmount, 0);
  }, [records]);

  const totalOriginalAmount = useMemo(() => {
    return records.reduce((sum, d) => sum + d.originalAmount, 0);
  }, [records]);

  const totalPatientsBenefited = records.length;

  const averageDiscountValue = useMemo(() => {
    return totalPatientsBenefited > 0
      ? Math.round(totalDiscountAmount / totalPatientsBenefited)
      : 0;
  }, [totalDiscountAmount, totalPatientsBenefited]);

  const overallDiscountRate = useMemo(() => {
    return totalOriginalAmount > 0
      ? ((totalDiscountAmount / totalOriginalAmount) * 100).toFixed(1)
      : "0";
  }, [totalDiscountAmount, totalOriginalAmount]);

  // Scheme Breakdown
  const schemeBreakdown = useMemo(() => {
    const schemes: DiscountSchemeType[] = [
      "Senior Citizen Concession",
      "Health Camp Coupon",
      "Doctor Courtesy",
      "Corporate Agreement",
      "Staff / Dependent",
    ];

    return schemes.map((sch) => {
      const schRecords = records.filter((r) => r.scheme === sch);
      const totalAmount = schRecords.reduce((acc, r) => acc + r.discountAmount, 0);
      const percentage =
        totalDiscountAmount > 0 ? Math.round((totalAmount / totalDiscountAmount) * 100) : 0;

      let color = "bg-blue-600";
      if (sch === "Health Camp Coupon") color = "bg-emerald-600";
      if (sch === "Doctor Courtesy") color = "bg-purple-600";
      if (sch === "Corporate Agreement") color = "bg-indigo-600";
      if (sch === "Staff / Dependent") color = "bg-amber-600";

      return {
        scheme: sch,
        count: schRecords.length,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [records, totalDiscountAmount]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.discountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.authorizedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesScheme =
        selectedScheme === "All" || item.scheme === selectedScheme;

      return matchesSearch && matchesScheme;
    });
  }, [records, searchTerm, selectedScheme]);

  const currentRecords = useMemo(() => {
    return filteredRecords.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredRecords, currentPage, rowsPerPage]);


  return (
    <div className="discounts-page space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Financial Analysis
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Concessions & Waivers
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Discounts & Concessions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Auditing authorized fee concessions, promotional voucher deductions, and institutional tie-ups.
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
            <span>Print Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Concessions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Discounts Granted
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalDiscountAmount.toLocaleString("en-IN")}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <TrendingDownOutlinedIcon className="text-sm text-emerald-600" />
                <span>{overallDiscountRate}% of gross turnover</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <LocalOfferOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Patients Benefited */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Benefited Patients
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {totalPatientsBenefited}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Across 5 authorized schemes
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PeopleOutlineOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Average Discount Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg. Concession Value
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{averageDiscountValue.toLocaleString("en-IN")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Per approved concession
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <PercentOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Compliance / Authorization */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Audit Clearance
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                100%
              </h3>
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                All vouchers authorized
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <VerifiedUserOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Scheme Distribution */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Discount Scheme Analysis
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Breakdown of total concession values categorized by policy scheme.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {schemeBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                  {item.scheme}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {item.percentage}%
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800">
                ₹{item.totalAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                {item.count} claims
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

      {/* Discounts Ledger Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Concessions & Waivers Ledger
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Individual transactions with promotional coupons, senior discounts, and authorized waivers.
            </p>
          </div>

          {/* Search & Scheme Filter */}
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
                placeholder="Search patient, invoice, authorizer..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <FilterListOutlinedIcon className="text-slate-400 text-sm" />
              <select
                value={selectedScheme}
                onChange={(e) => {
                  setSelectedScheme(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Schemes</option>
                <option value="Senior Citizen Concession">Senior Citizen</option>
                <option value="Health Camp Coupon">Health Camp Coupon</option>
                <option value="Doctor Courtesy">Doctor Courtesy</option>
                <option value="Corporate Agreement">Corporate Agreement</option>
                <option value="Staff / Dependent">Staff / Dependent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={currentRecords}
            minWidth="1200px"
            emptyMessage="No discount records match your search criteria."
            renderRow={(d: DiscountRecord) => (
              <>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-blue-600">
                    {d.discountId}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {d.reason}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-sm text-slate-800">
                    {d.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-400">
                    {d.date}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-semibold text-slate-800">
                    {d.patientName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {d.patientId}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      d.scheme === "Senior Citizen Concession"
                        ? "bg-blue-50 text-blue-700"
                        : d.scheme === "Health Camp Coupon"
                        ? "bg-emerald-50 text-emerald-700"
                        : d.scheme === "Doctor Courtesy"
                        ? "bg-purple-50 text-purple-700"
                        : d.scheme === "Staff / Dependent"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {d.scheme}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-sm text-slate-600">
                  ₹{d.originalAmount.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="font-bold text-sm text-emerald-600">
                    -₹{d.discountAmount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    ({d.discountPercent}% off)
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-sm text-slate-900">
                  ₹{d.finalPayable.toLocaleString("en-IN")}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-medium text-slate-700">
                    {d.authorizedBy}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewingDiscount(d)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                      title="View Details"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setEditingDiscount({ ...d })}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                      title="Edit Discount"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setDeletingDiscount(d)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Discount"
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
        {filteredRecords.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
            <Pagination
              totalItems={filteredRecords.length}
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
      {viewingDiscount && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setViewingDiscount(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Discount Concession Details</h3>
                <p className="text-xs text-gray-500">{viewingDiscount.discountId}</p>
              </div>
              <button onClick={() => setViewingDiscount(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Discount Scheme</span>
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                    {viewingDiscount.scheme}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Invoice Number</span>
                  <span className="font-semibold text-slate-800">{viewingDiscount.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Date</span>
                  <span className="text-slate-700">{viewingDiscount.date}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Patient Name</span>
                  <span className="font-semibold text-slate-800">{viewingDiscount.patientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Patient ID</span>
                  <span className="font-mono text-xs text-slate-700">{viewingDiscount.patientId}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Original Bill</span>
                  <span className="font-semibold text-slate-800">₹{viewingDiscount.originalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Discount Concession</span>
                  <span className="font-bold text-emerald-600">-₹{viewingDiscount.discountAmount.toLocaleString("en-IN")} ({viewingDiscount.discountPercent}%)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Final Payable</span>
                  <span className="font-bold text-slate-900 text-base">₹{viewingDiscount.finalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="text-xs font-medium text-slate-500">Authorized By</div>
                <div className="font-semibold text-slate-800">{viewingDiscount.authorizedBy}</div>
                <div className="text-xs font-medium text-slate-500 mt-2">Reason / Approval Notes</div>
                <div className="text-xs text-slate-700">{viewingDiscount.reason}</div>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewingDiscount(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Drawer */}
      {editingDiscount && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setEditingDiscount(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Edit Discount Record</h3>
                <p className="text-xs text-gray-500">{editingDiscount.discountId}</p>
              </div>
              <button onClick={() => setEditingDiscount(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={editingDiscount.patientName}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, patientName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Discount Scheme</label>
                  <select
                    value={editingDiscount.scheme}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, scheme: e.target.value as DiscountSchemeType })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Senior Citizen Concession">Senior Citizen Concession</option>
                    <option value="Health Camp Coupon">Health Camp Coupon</option>
                    <option value="Doctor Courtesy">Doctor Courtesy</option>
                    <option value="Corporate Agreement">Corporate Agreement</option>
                    <option value="Staff / Dependent">Staff / Dependent</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Original Amount (₹)</label>
                    <input
                      type="number"
                      value={editingDiscount.originalAmount}
                      onChange={(e) => {
                        const original = Number(e.target.value) || 0;
                        const disc = Math.round((original * editingDiscount.discountPercent) / 100);
                        setEditingDiscount({
                          ...editingDiscount,
                          originalAmount: original,
                          discountAmount: disc,
                          finalPayable: original - disc,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">Discount %</label>
                    <input
                      type="number"
                      value={editingDiscount.discountPercent}
                      onChange={(e) => {
                        const pct = Number(e.target.value) || 0;
                        const disc = Math.round((editingDiscount.originalAmount * pct) / 100);
                        setEditingDiscount({
                          ...editingDiscount,
                          discountPercent: pct,
                          discountAmount: disc,
                          finalPayable: editingDiscount.originalAmount - disc,
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Discount Amount:</span>
                    <div className="font-bold text-emerald-600">₹{editingDiscount.discountAmount.toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Final Payable:</span>
                    <div className="font-bold text-slate-800">₹{editingDiscount.finalPayable.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Authorized By</label>
                  <input
                    type="text"
                    value={editingDiscount.authorizedBy}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, authorizedBy: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-700">Approval Reason / Notes</label>
                  <textarea
                    rows={3}
                    value={editingDiscount.reason}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, reason: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingDiscount(null)}
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
      {deletingDiscount && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" onClick={() => setDeletingDiscount(null)} />
          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Discount Record</h3>
                <p className="text-xs text-gray-500">{deletingDiscount.discountId}</p>
              </div>
              <button onClick={() => setDeletingDiscount(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                <WarningAmberOutlinedIcon className="mt-0.5 text-rose-600 shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Warning: Destructive Action</div>
                  <p className="text-xs text-rose-700">
                    Are you sure you want to delete this discount record? This will revoke the concession log from the financial audit trail.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount ID:</span>
                  <span className="font-semibold text-slate-800">{deletingDiscount.discountId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-semibold text-slate-800">{deletingDiscount.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-800">{deletingDiscount.patientName} ({deletingDiscount.patientId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Scheme:</span>
                  <span className="font-semibold text-blue-600">{deletingDiscount.scheme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Value:</span>
                  <span className="font-bold text-rose-600">-₹{deletingDiscount.discountAmount.toLocaleString("en-IN")} ({deletingDiscount.discountPercent}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized By:</span>
                  <span className="font-medium text-slate-700">{deletingDiscount.authorizedBy}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingDiscount(null)}
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

export default Discounts;


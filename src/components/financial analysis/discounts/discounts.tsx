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
];

const Discounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // KPI Calculations
  const totalDiscountAmount = useMemo(() => {
    return DISCOUNT_RECORDS.reduce((sum, d) => sum + d.discountAmount, 0);
  }, []);

  const totalOriginalAmount = useMemo(() => {
    return DISCOUNT_RECORDS.reduce((sum, d) => sum + d.originalAmount, 0);
  }, []);

  const totalPatientsBenefited = DISCOUNT_RECORDS.length;

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
      const records = DISCOUNT_RECORDS.filter((r) => r.scheme === sch);
      const totalAmount = records.reduce((acc, r) => acc + r.discountAmount, 0);
      const percentage =
        totalDiscountAmount > 0 ? Math.round((totalAmount / totalDiscountAmount) * 100) : 0;

      let color = "bg-blue-600";
      if (sch === "Health Camp Coupon") color = "bg-emerald-600";
      if (sch === "Doctor Courtesy") color = "bg-purple-600";
      if (sch === "Corporate Agreement") color = "bg-indigo-600";
      if (sch === "Staff / Dependent") color = "bg-amber-600";

      return {
        scheme: sch,
        count: records.length,
        totalAmount,
        percentage,
        color,
      };
    });
  }, [totalDiscountAmount]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return DISCOUNT_RECORDS.filter((item) => {
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
  }, [searchTerm, selectedScheme]);

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
            maxHeight="380px"
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
    </div>
  );
};

export default Discounts;

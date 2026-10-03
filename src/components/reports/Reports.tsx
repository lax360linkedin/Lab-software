import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getStoredResults, type TestResultItem } from "../results/resultsData";

type ReportsTab = "pending" | "generated" | "history" | "share";

interface ReportsProps {
  initialTab?: ReportsTab;
}

interface ReportItem {
  id: string;
  reportId: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  testName: string;
  department: string;
  date: string;
  verifiedBy: string;
  status: "Pending" | "Generated" | "Dispatched";
  rawResult?: TestResultItem;
}

const defaultPendingReports: ReportItem[] = [
  {
    id: "REP-P-101",
    reportId: "REP-P-101",
    sampleId: "SMP-1025",
    patientId: "PAT-10021",
    patientName: "Arun Kumar",
    age: 38,
    gender: "Male",
    phone: "+91 98765 43210",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-102",
    reportId: "REP-P-102",
    sampleId: "SMP-1026",
    patientId: "PAT-10022",
    patientName: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "+91 98123 45678",
    testName: "Liver Function Test (LFT)",
    department: "Biochemistry",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-103",
    reportId: "REP-P-103",
    sampleId: "SMP-1027",
    patientId: "PAT-10023",
    patientName: "Rahul Raj",
    age: 45,
    gender: "Male",
    phone: "+91 98456 78901",
    testName: "Thyroid Profile",
    department: "Endocrinology",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-104",
    reportId: "REP-P-104",
    sampleId: "SMP-1028",
    patientId: "PAT-10024",
    patientName: "Meena Devi",
    age: 52,
    gender: "Female",
    phone: "+91 98987 65432",
    testName: "Lipid Profile",
    department: "Biochemistry",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-105",
    reportId: "REP-P-105",
    sampleId: "SMP-1029",
    patientId: "PAT-10025",
    patientName: "Venkatesh S",
    age: 29,
    gender: "Male",
    phone: "+91 97890 12345",
    testName: "Renal Function Test (RFT)",
    department: "Biochemistry",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-106",
    reportId: "REP-P-106",
    sampleId: "SMP-1030",
    patientId: "PAT-10026",
    patientName: "Anitha R",
    age: 34,
    gender: "Female",
    phone: "+91 98765 67890",
    testName: "HbA1c Glycated Hemoglobin",
    department: "Biochemistry",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-107",
    reportId: "REP-P-107",
    sampleId: "SMP-1031",
    patientId: "PAT-10027",
    patientName: "Karthik Raja",
    age: 41,
    gender: "Male",
    phone: "+91 99441 23456",
    testName: "Serum Electrolytes",
    department: "Biochemistry",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
  {
    id: "REP-P-108",
    reportId: "REP-P-108",
    sampleId: "SMP-1032",
    patientId: "PAT-10028",
    patientName: "Lakshmi Narayanan",
    age: 63,
    gender: "Male",
    phone: "+91 94432 10987",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    date: "2026-10-01",
    verifiedBy: "Dr. Ananya Swaminathan",
    status: "Pending",
  },
];

const Reports: React.FC<ReportsProps> = ({ initialTab = "pending" }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as ReportsTab | null;

  const [activeTab, setActiveTab] = useState<ReportsTab>(
    urlTab || initialTab
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ReportsTab | null;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Build generated reports from verified results store
  const generatedReports: ReportItem[] = useMemo(() => {
    try {
      const results = getStoredResults();
      return results
        .filter((r) => r.status === "VERIFIED")
        .map((r, index) => ({
          id: r.id,
          reportId: `REP-2026-${(1001 + index).toString()}`,
          sampleId: r.sampleId,
          patientId: r.patientId,
          patientName: r.patientName,
          age: r.age,
          gender: r.gender,
          phone: r.phone,
          testName: r.testName,
          department: r.department,
          date: r.completedDate,
          verifiedBy: r.verifiedBy || "Dr. Ananya Swaminathan",
          status: "Generated" as const,
          rawResult: r,
        }));
    } catch {
      return [];
    }
  }, []);

  const currentDataset = useMemo(() => {
    if (activeTab === "pending") {
      return defaultPendingReports;
    }
    if (activeTab === "generated" || activeTab === "history" || activeTab === "share") {
      return generatedReports;
    }
    return defaultPendingReports;
  }, [activeTab, generatedReports]);

  const filteredData = useMemo(() => {
    return currentDataset.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm);

      const matchesDept =
        departmentFilter === "All" || item.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [currentDataset, searchTerm, departmentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const columns =
    activeTab === "pending"
      ? [
          "Report ID",
          "Sample ID",
          "Patient Name",
          "Test & Department",
          "Date",
          "Status",
          "Actions",
        ]
      : [
          "Report ID",
          "Sample ID",
          "Patient Name",
          "Test & Department",
          "Verified By",
          "Status",
          "Actions",
        ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <DescriptionOutlinedIcon />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Reports
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                View, filter, print, and share patient diagnostic reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Total Reports: {filteredData.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
            className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Pending Reports ({defaultPendingReports.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("generated");
              setCurrentPage(1);
            }}
            className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === "generated"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Generated Reports ({generatedReports.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              setCurrentPage(1);
            }}
            className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Report History
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("share");
              setCurrentPage(1);
            }}
            className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${
              activeTab === "share"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Printing / Sharing
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <SearchIcon
                fontSize="small"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search patient, sample, report ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <FilterListIcon className="text-slate-400" fontSize="small" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-3 sm:p-5">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={paginatedData}
              renderRow={(item: ReportItem) => (
                <>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono font-semibold text-blue-600">
                    {item.reportId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-slate-700">
                    {item.sampleId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="text-xs font-medium text-slate-900">
                      {item.patientName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.age} yrs • {item.gender}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="text-xs font-medium text-slate-800">
                      {item.testName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.department}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                    {activeTab === "pending" ? item.date : item.verifiedBy}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        item.status === "Pending"
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(item);
                          setViewModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="View Report"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>

                      {activeTab !== "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(item);
                              setPrintModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="Print Report"
                          >
                            <PrintOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(item);
                              setShareModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            title="Share Report"
                          >
                            <ShareOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </>
              )}
            />
          </div>

          {filteredData.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-600">No reports found</p>
              <p className="mt-1 text-xs text-slate-400">
                Adjust search query or check back later.
              </p>
            </div>
          )}

          {filteredData.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Pagination
                totalItems={filteredData.length}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-bold text-slate-800">
                Diagnostic Report Details
              </h3>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Patient Name</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedReport.patientName}
                  </span>
                  <span className="text-slate-500 block">
                    {selectedReport.age} yrs • {selectedReport.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Report & Sample</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {selectedReport.reportId}
                  </span>
                  <span className="font-mono text-slate-500 block">
                    {selectedReport.sampleId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Test Name</span>
                  <span className="font-medium text-slate-800">
                    {selectedReport.testName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <span className="inline-block mt-0.5 font-semibold text-emerald-600">
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {selectedReport.rawResult?.parameters && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Parameter</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReport.rawResult.parameters.map((p) => (
                        <tr key={p.code}>
                          <td className="px-3 py-1.5 font-medium">{p.name}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-800">
                            {p.value}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">{p.unit}</td>
                          <td className="px-3 py-1.5 text-slate-400">
                            {p.referenceRange}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <PrintOutlinedIcon className="text-4xl text-blue-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Print Patient Diagnostic Report
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Sending {selectedReport.reportId} ({selectedReport.patientName}) to connected laboratory report printer.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintModalOpen(false);
                  showToast(`Report ${selectedReport.reportId} sent to printer successfully.`);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Share Diagnostic Report
              </h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                Patient: <span className="font-semibold text-slate-800">{selectedReport.patientName}</span>
              </p>
              <p>
                Phone: <span className="font-semibold text-slate-800">{selectedReport.phone}</span>
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShareModalOpen(false);
                    showToast(`Report ${selectedReport.reportId} shared via WhatsApp to ${selectedReport.phone}`);
                  }}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Share via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShareModalOpen(false);
                    showToast(`Report ${selectedReport.reportId} dispatched via SMS link.`);
                  }}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Dispatch via SMS Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

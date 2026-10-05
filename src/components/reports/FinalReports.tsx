import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CloseIcon from "@mui/icons-material/Close";
import "./ReportPrint.css";
import type { StoredSample } from "./ReportPrint";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import ReportPrint from "./ReportPrint";

const FinalReports = () => {
    const navigate = useNavigate();
    const [samples, ] = useState<StoredSample[]>(() => {
        try {
            const stored = localStorage.getItem("lab_samples");
            const parsed = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [selectedSample, setSelectedSample] = useState<StoredSample | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const finalReports = useMemo(() => {
        return samples.filter(
            (sample) =>
                sample.resultStatus === "Verified" &&
                sample.reportStatus === "Final"
        );
    }, [samples]);

    const filteredReports = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return finalReports.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.reportId?.toLowerCase().includes(search) ||
                sample.patientName?.toLowerCase().includes(search) ||
                sample.patientId?.toLowerCase().includes(search) ||
                sample.sampleId?.toLowerCase().includes(search) ||
                sample.accessionNumber?.toLowerCase().includes(search) ||
                sample.testName?.toLowerCase().includes(search) ||
                sample.registrationId?.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                sample.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [finalReports, searchTerm, priorityFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReports.length / rowsPerPage)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const currentData = filteredReports.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const openReport = (sample: StoredSample) => {
        setSelectedSample(sample);
        setShowDetails(true);
    };

    const closeReport = () => {
        setShowDetails(false);
        setSelectedSample(null);
    };

    const handlePrint = () => {
        if (!selectedSample) return;
        requestAnimationFrame(() => {
            window.print();
        });
    };

    const handleShare = async () => {
        if (!selectedSample) return;

        const reportText = `
Laboratory Report

Report ID: ${selectedSample.reportId || "-"}
Patient: ${selectedSample.patientName}
Patient ID: ${selectedSample.patientId}
Registration ID: ${selectedSample.registrationId}
Test: ${selectedSample.testName}
Sample ID: ${selectedSample.sampleId}
Accession No: ${selectedSample.accessionNumber}
Report Date: ${selectedSample.reportGeneratedDate || "-"}

Result:
${
    selectedSample.resultParameters
        ?.map(
            (parameter) =>
                `${parameter.name}: ${parameter.value} ${
                    parameter.unit || ""
                }`
        )
        .join("\n") || "-"
}

Remarks:
${selectedSample.resultRemarks || "-"}
        `.trim();

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Laboratory Report - ${
                        selectedSample.reportId || selectedSample.sampleId
                    }`,
                    text: reportText,
                });
            } else {
                await navigator.clipboard.writeText(reportText);
                alert("Report details copied to clipboard.");
            }
        } catch {
            // User cancelled sharing.
        }
    };

    const columns = [
        "Report ID",
        "Patient",
        "Test",
        "Sample",
        "Priority",
        "Report Date",
        "Status",
        "Action",
    ];

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Final Reports
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View, print and share finalized laboratory reports
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/reports/history")}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Report History
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative md:col-span-2">
                            <SearchIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search report, patient, sample, accession or test..."
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Priority */}
                        <div className="relative">
                            <FilterListIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />

                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="All">All Priorities</option>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="STAT">STAT</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-3 sm:p-5">
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                data={currentData}
                                maxHeight="500px"
                                emptyMessage="No final reports found"
                                renderRow={(sample: StoredSample) => (
                                    <>
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-blue-600">
                                                {sample.reportId || "-"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="whitespace-nowrap font-medium text-slate-800">
                                                    {sample.patientName}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {sample.patientId}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="whitespace-nowrap font-medium text-slate-700">
                                                {sample.testName}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                    {sample.sampleId}
                                                </p>

                                                <p className="whitespace-nowrap text-xs text-slate-500">
                                                    {sample.accessionNumber}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    sample.priority === "STAT"
                                                        ? "bg-red-100 text-red-700"
                                                        : sample.priority ===
                                                            "Urgent"
                                                          ? "bg-orange-100 text-orange-700"
                                                          : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {sample.priority || "Normal"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {sample.reportGeneratedDate || "-"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                Final
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openReport(sample)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                                View
                                            </button>
                                        </td>
                                    </>
                                )}
                            />
                        </div>

                        {filteredReports.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">

                        <Pagination
                            totalItems={filteredReports.length}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />

                    </div>
                )}
                    </div>
                </div>
            </div>

            {showDetails && selectedSample && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={closeReport}
                    />

                    {/* Drawer */}
                    <div className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Final Laboratory Report
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    {selectedSample.reportId ||
                                        selectedSample.sampleId}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeReport}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="rounded-xl border border-slate-200 bg-white">
                                {/* Report Header */}
                                <div className="border-b border-slate-200 p-6 text-center">
                                    <h1 className="text-2xl font-bold text-slate-800">
                                        LABORATORY REPORT
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Diagnostic Laboratory
                                    </p>

                                    <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                            Report ID:{" "}
                                            {selectedSample.reportId || "-"}
                                        </span>

                                        <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                                            Final Report
                                        </span>
                                    </div>
                                </div>

                                {/* Patient Information */}
                                <div className="border-b border-slate-200 p-6">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Patient Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Patient Name
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.patientName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Patient ID
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.patientId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Registration ID
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.registrationId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Report Date
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.reportGeneratedDate ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Information */}
                                <div className="border-b border-slate-200 p-6">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Test Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Test
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.testName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Sample Type
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.sampleType}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Sample ID
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.sampleId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Accession Number
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {
                                                    selectedSample.accessionNumber
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="border-b border-slate-200 p-6">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Test Result
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px] border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100">
                                                    <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                                                        Parameter
                                                    </th>
                                                    <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                                                        Result
                                                    </th>
                                                    <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                                                        Unit
                                                    </th>
                                                    <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                                                        Reference Range
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedSample.resultParameters
                                                    ?.length ? (
                                                    selectedSample.resultParameters.map(
                                                        (
                                                            parameter,
                                                            index
                                                        ) => (
                                                            <tr key={index}>
                                                                <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800">
                                                                    {
                                                                        parameter.name
                                                                    }
                                                                </td>

                                                                <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
                                                                    {
                                                                        parameter.value
                                                                    }
                                                                </td>

                                                                <td className="border border-slate-200 px-4 py-3 text-sm text-slate-600">
                                                                    {parameter.unit ||
                                                                        "-"}
                                                                </td>

                                                                <td className="border border-slate-200 px-4 py-3 text-sm text-slate-600">
                                                                    {parameter.referenceRange ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="border border-slate-200 px-4 py-6 text-center text-sm text-slate-500"
                                                        >
                                                            No result
                                                            parameters
                                                            available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {selectedSample.resultRemarks && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                Remarks
                                            </p>

                                            <p className="mt-1 text-sm text-slate-700">
                                                {
                                                    selectedSample.resultRemarks
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Verification */}
                                <div className="border-b border-slate-200 p-6">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Verification
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Verified By
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.verificationBy ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Verified Date
                                            </p>
                                            <p className="mt-1 font-medium text-slate-800">
                                                {selectedSample.verificationDate ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-slate-500">
                                                Verification Remarks
                                            </p>
                                            <p className="mt-1 text-sm text-slate-700">
                                                {selectedSample.verificationRemarks ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <div className="mb-8 h-px bg-slate-300" />
                                            <p className="text-center text-xs text-slate-500">
                                                Laboratory Technician /
                                                Authorized Signatory
                                            </p>
                                        </div>

                                        <div>
                                            <div className="mb-8 h-px bg-slate-300" />
                                            <p className="text-center text-xs text-slate-500">
                                                Pathologist / Medical
                                                Director
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center text-xs text-slate-400">
                                        Report generated by{" "}
                                        {selectedSample.reportGeneratedBy ||
                                            "Laboratory"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={closeReport}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                                <ShareOutlinedIcon fontSize="small" />
                                Share
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <PrintOutlinedIcon fontSize="small" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSample && (
                <div className="report-print-container">
                    <ReportPrint sample={selectedSample} />
                </div>
            )}
        </>
    );
};

export default FinalReports;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

interface ResultParameter {
    name: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    flag?: string;
}

interface StoredSample {
    id: string;
    sampleId: string;
    barcode: string;
    patientId: string;
    patientName: string;
    testId: string;
    testName: string;
    sampleType: string;
    collectionDate: string;
    collectionTime: string;
    collector: string;
    status:
        | "Pending Collection"
        | "Collected"
        | "Received"
        | "Accepted"
        | "Processing"
        | "Completed"
        | "Rejected";

    source: "Patient Registration";
    createdAt: string;
    receivedDate?: string;
    receivedTime?: string;
    receivedBy?: string;
    acceptedDate?: string;
    acceptedTime?: string;
    acceptedBy?: string;
    rejectedDate?: string;
    rejectedTime?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    processingDate?: string;
    processingTime?: string;
    processingBy?: string;
    completedDate?: string;
    completedTime?: string;
    completedBy?: string;
    analyzer?: string;
    method?: string;
    priority?: "Normal" | "Urgent" | "STAT";
    resultStatus?:
        | "Pending"
        | "Entered"
        | "QC Pending"
        | "QC Passed"
        | "QC Failed"
        | "Verified";

    resultParameters?: ResultParameter[];
    resultRemarks?: string;
    resultEnteredDate?: string;
    resultEnteredTime?: string;
    resultEnteredBy?: string;
    qcDate?: string;
    qcTime?: string;
    qcBy?: string;
    qcRemarks?: string;
    qcStatus?: "Passed" | "Failed";
}

const QCFailed = () => {
    const navigate = useNavigate();

    const [samples, setSamples] = useState<StoredSample[]>(() => {
        try {
            const stored = localStorage.getItem("lab_samples");

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedSample, setSelectedSample] = useState<StoredSample | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const failedSamples = useMemo(() => {
        return samples.filter(
            (sample) => sample.resultStatus === "QC Failed"
        );
    }, [samples]);

    const filteredSamples = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return failedSamples.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search) ||
                sample.barcode.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                sample.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [failedSamples, searchTerm, priorityFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSamples.length / rowsPerPage)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const currentData = filteredSamples.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePriorityChange = (value: string) => {
        setPriorityFilter(value);
        setCurrentPage(1);
    };

    const handleView = (sample: StoredSample) => {
        setSelectedSample(sample);
        setShowDetails(true);
    };

    const handleCloseDrawer = () => {
        setShowDetails(false);
        setSelectedSample(null);
    };

    const handleReanalysis = (sample: StoredSample) => {
        const updatedSamples = samples.map((item) => {
            if (
                item.id === sample.id ||
                item.sampleId === sample.sampleId
            ) {
                return {
                    ...item,
                    status: "Processing" as StoredSample["status"],
                    resultStatus: "Pending" as StoredSample["resultStatus"],
                };
            }

            return item;
        });

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);

        handleCloseDrawer();

        navigate("/analysis/processing");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            QC Failed
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Results that failed quality control and require
                            corrective action or re-analysis
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                        <CancelOutlinedIcon fontSize="small" />
                        {failedSamples.length} Failed
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:max-w-md">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            fontSize="small"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Search sample, patient or test..."
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Priority */}
                    <select
                        value={priorityFilter}
                        onChange={(e) =>
                            handlePriorityChange(e.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Priorities</option>
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="STAT">STAT</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <Table
                        columns={[
                            "Sample ID",
                            "Patient & ID",
                            "Test",
                            "Sample Type",
                            "Priority",
                            "QC Date",
                            "QC Status",
                            "Action",
                        ]}
                        data={currentData}
                        maxHeight="500px"
                        emptyMessage="No QC failed results found."
                        renderRow={(sample: StoredSample) => (
                            <>
                                {/* Sample */}
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="whitespace-nowrap font-semibold text-blue-600">
                                            {sample.sampleId}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {sample.barcode}
                                        </p>
                                    </div>
                                </td>

                                {/* Patient */}
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="whitespace-nowrap font-medium text-slate-800">
                                            {sample.patientName}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {sample.patientId}
                                        </p>
                                    </div>
                                </td>

                                {/* Test */}
                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap text-sm text-slate-700">
                                        {sample.testName}
                                    </span>
                                </td>

                                {/* Sample Type */}
                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap text-sm text-slate-600">
                                        {sample.sampleType}
                                    </span>
                                </td>

                                {/* Priority */}
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
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

                                {/* QC Date */}
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="whitespace-nowrap text-sm text-slate-700">
                                            {sample.qcDate || "-"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {sample.qcTime || "-"}
                                        </p>
                                    </div>
                                </td>

                                {/* QC Status */}
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                                        <CancelOutlinedIcon fontSize="inherit" />
                                        Failed
                                    </span>
                                </td>

                                {/* Action */}
                                <td className="px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleView(sample)
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <VisibilityOutlinedIcon fontSize="small" />
                                        View
                                    </button>
                                </td>
                            </>
                        )}
                    />
                </div>

                {/* Pagination */}
                 {filteredSamples.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">

                        <Pagination
                            totalItems={filteredSamples.length}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />

                    </div>
                )}
            </div>

            {/* Right Drawer */}
            {showDetails && selectedSample && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CancelOutlinedIcon className="text-red-600" />

                                    <h2 className="text-lg font-semibold text-slate-800">
                                        QC Failed Details
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedSample.sampleId} •{" "}
                                    {selectedSample.testName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Failed Status */}
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <WarningAmberOutlinedIcon className="text-red-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            Quality Control Failed
                                        </p>

                                        <p className="mt-1 text-xs text-red-700">
                                            This result failed QC and requires
                                            review before it can proceed to
                                            verification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Information */}
                            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <PersonIcon className="text-slate-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Patient Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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
                                </div>
                            </div>

                            {/* Sample & Analysis */}
                            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <ScienceOutlinedIcon className="text-slate-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Sample & Analysis
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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
                                            Analyzer
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.analyzer || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Method
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.method || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Result Values */}
                            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <h3 className="font-semibold text-slate-800">
                                        Result Values
                                    </h3>
                                </div>

                                {selectedSample.resultParameters &&
                                selectedSample.resultParameters.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                        Parameter
                                                    </th>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                        Result
                                                    </th>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                        Unit
                                                    </th>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                        Reference
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedSample.resultParameters.map(
                                                    (
                                                        parameter,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={`${parameter.name}-${index}`}
                                                            className="border-b border-slate-100 last:border-0"
                                                        >
                                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                                {
                                                                    parameter.name
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                                {
                                                                    parameter.value
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-600">
                                                                {parameter.unit ||
                                                                    "-"}
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-600">
                                                                {parameter.referenceRange ||
                                                                    "-"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 text-sm text-slate-500">
                                        No result parameters available.
                                    </div>
                                )}
                            </div>

                            {/* Result Information */}
                            <div className="mb-5 rounded-xl border border-slate-200 p-4">
                                <h3 className="mb-4 font-semibold text-slate-800">
                                    Result Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Entered By
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedSample.resultEnteredBy ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Entered Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedSample.resultEnteredDate ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {selectedSample.resultRemarks && (
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-500">
                                            Result Remarks
                                        </p>

                                        <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                            {selectedSample.resultRemarks}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* QC Failure Information */}
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <WarningAmberOutlinedIcon className="text-red-600" />

                                    <h3 className="font-semibold text-red-800">
                                        QC Failure Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-red-700">
                                            QC Status
                                        </p>

                                        <p className="mt-1 font-semibold text-red-800">
                                            {selectedSample.qcStatus ||
                                                "Failed"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-red-700">
                                            Checked By
                                        </p>

                                        <p className="mt-1 font-medium text-red-800">
                                            {selectedSample.qcBy || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-red-700">
                                            QC Date
                                        </p>

                                        <p className="mt-1 font-medium text-red-800">
                                            {selectedSample.qcDate || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-red-700">
                                            QC Time
                                        </p>

                                        <p className="mt-1 font-medium text-red-800">
                                            {selectedSample.qcTime || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-red-700">
                                        QC Remarks / Failure Reason
                                    </p>

                                    <p className="mt-1 rounded-lg bg-white p-3 text-sm text-red-800">
                                        {selectedSample.qcRemarks ||
                                            "No QC failure remarks provided."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleReanalysis(selectedSample)
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                            >
                                <ReplayOutlinedIcon fontSize="small" />
                                Re-analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QCFailed;
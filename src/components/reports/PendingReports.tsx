import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
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
    verificationDate?: string;
    verificationTime?: string;
    verificationBy?: string;
    verificationRemarks?: string;
    reportId?: string;
    reportStatus?: "Pending" | "Final";
    reportGeneratedDate?: string;
    reportGeneratedTime?: string;
    reportGeneratedBy?: string;
}

const getStoredSamples = (): StoredSample[] => {
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
};

const formatPriority = (priority?: StoredSample["priority"]) => {
    return priority || "Normal";
};

export default function PendingReports() {
    const navigate = useNavigate();
    const [samples, setSamples] = useState<StoredSample[]>(getStoredSamples);
    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [selectedSample, setSelectedSample] = useState<StoredSample | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const pendingReports = useMemo(() => {
        return samples.filter(
            (sample) =>
                sample.resultStatus === "Verified" &&
                sample.reportStatus !== "Final"
        );
    }, [samples]);

    const filteredSamples = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return pendingReports.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                formatPriority(sample.priority) === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [pendingReports, searchTerm, priorityFilter]);

    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;

        return filteredSamples.slice(
            startIndex,
            startIndex + rowsPerPage
        );
    }, [filteredSamples, currentPage, rowsPerPage]);

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

    const handleGenerateReport = () => {
        if (!selectedSample) return;

        const now = new Date();

        const reportGeneratedDate = now.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const reportGeneratedTime = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        let reportGeneratedBy = "Laboratory Administrator";

        try {
            const user = JSON.parse(
                localStorage.getItem("lab_user") || "null"
            );

            reportGeneratedBy =
                user?.name ||
                user?.fullName ||
                user?.username ||
                "Laboratory Administrator";
        } catch {
            // fallback
        }

        const existingNumbers = samples.map((sample) => {
            const match = sample.reportId?.match(/^RPT-(\d+)$/);
            return match ? Number(match[1]) : 0;
        });

        const reportId =
            selectedSample.reportId ||
            `RPT-${Math.max(10000, ...existingNumbers) + 1}`;

        const updatedSamples = samples.map((sample) =>
            sample.id === selectedSample.id
                ? {
                    ...sample,
                    reportId,
                    reportStatus: "Final" as const,
                    reportGeneratedDate,
                    reportGeneratedTime,
                    reportGeneratedBy,
                }
                : sample
        );

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);
        setShowDetails(false);
        setSelectedSample(null);

        navigate("/reports/final");
    };

    const columns = [
        "Sample ID",
        "Patient & ID",
        "Test",
        "Sample Type",
        "Priority",
        "Verified Date",
        "Status",
        "Action",
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                            <DescriptionOutlinedIcon className="text-blue-600" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                                Pending Reports
                            </h1>

                            <p className="text-sm text-slate-500">
                                Generate final reports for verified results
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-xs font-medium text-blue-600">
                            Pending Reports
                        </p>

                        <p className="text-xl font-bold text-blue-700">
                            {pendingReports.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Search sample, patient or test..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <FilterListIcon className="text-slate-500" />

                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                handlePriorityChange(e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="All">All Priority</option>
                            <option value="Normal">Normal</option>
                            <option value="Urgent">Urgent</option>
                            <option value="STAT">STAT</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                Reports Awaiting Generation
                            </h2>

                            <p className="text-xs text-slate-500">
                                {filteredSamples.length} result
                                {filteredSamples.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                        <ReceiptLongOutlinedIcon className="text-blue-500" />
                    </div>
                </div>

                <div className="p-3 sm:p-5">
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="500px"
                            emptyMessage="No pending reports found"
                            renderRow={(sample: StoredSample) => (
                                <>
                                    {/* Sample */}
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="whitespace-nowrap font-medium text-blue-600">
                                                {sample.sampleId}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {sample.barcode || "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Patient */}
                                    <td className="px-4 py-4">
                                        <div className="flex min-w-[170px] items-center gap-2">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                                <PersonIcon
                                                    fontSize="small"
                                                    className="text-slate-500"
                                                />
                                            </div>

                                            <div>
                                                <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                    {sample.patientName}
                                                </p>

                                                <p className="mt-0.5 whitespace-nowrap text-xs text-slate-400">
                                                    {sample.patientId}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Test */}
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="whitespace-nowrap font-medium text-slate-700">
                                                {sample.testName}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {sample.testId}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Sample Type */}
                                    <td className="px-4 py-4">
                                        <span className="whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                            {sample.sampleType}
                                        </span>
                                    </td>

                                    {/* Priority */}
                                    <td className="px-4 py-4">
                                        <span
                                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${sample.priority === "STAT"
                                                ? "bg-red-100 text-red-700"
                                                : sample.priority ===
                                                    "Urgent"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {formatPriority(
                                                sample.priority
                                            )}
                                        </span>
                                    </td>

                                    {/* Verified Date */}
                                    <td className="px-4 py-4">
                                        <div className="whitespace-nowrap">
                                            <p className="text-sm text-slate-700">
                                                {sample.verificationDate ||
                                                    "-"}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {sample.verificationTime ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                            <DescriptionOutlinedIcon fontSize="small" />
                                            Pending Report
                                        </span>
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleView(sample)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                                        >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                            View
                                        </button>
                                    </td>
                                </>
                            )}
                        />
                    </div>

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
            </div>

            {/* Right Drawer */}
            {showDetails && selectedSample && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => {
                            setShowDetails(false);
                            setSelectedSample(null);
                        }}
                    />

                    <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[540px]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <DescriptionOutlinedIcon className="text-blue-600" />

                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Generate Final Report
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedSample.sampleId} •{" "}
                                    {selectedSample.testName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowDetails(false);
                                    setSelectedSample(null);
                                }}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Verified Banner */}
                            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                        <VerifiedIcon className="text-green-600" />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Result Verified
                                        </p>

                                        <p className="text-sm text-green-700">
                                            QC passed and verification is
                                            completed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient */}
                            <div className="mb-5 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                                    <PersonIcon className="text-blue-600" />

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

                            {/* Sample & Test */}
                            <div className="mb-5 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                                    <ScienceOutlinedIcon className="text-purple-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Sample & Test Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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

                            {/* Results */}
                            <div className="mb-5 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                                    <AssignmentOutlinedIcon className="text-indigo-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Result Values
                                    </h3>
                                </div>

                                <div className="p-4">
                                    {selectedSample.resultParameters &&
                                        selectedSample.resultParameters.length >
                                        0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[430px] text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                                                        <th className="px-3 py-3 font-medium">
                                                            Parameter
                                                        </th>

                                                        <th className="px-3 py-3 font-medium">
                                                            Result
                                                        </th>

                                                        <th className="px-3 py-3 font-medium">
                                                            Unit
                                                        </th>

                                                        <th className="px-3 py-3 font-medium">
                                                            Reference
                                                        </th>

                                                        <th className="px-3 py-3 font-medium">
                                                            Flag
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
                                                                <td className="px-3 py-3 font-medium text-slate-700">
                                                                    {
                                                                        parameter.name
                                                                    }
                                                                </td>

                                                                <td className="px-3 py-3 font-semibold text-slate-800">
                                                                    {
                                                                        parameter.value
                                                                    }
                                                                </td>

                                                                <td className="px-3 py-3 text-slate-600">
                                                                    {parameter.unit ||
                                                                        "-"}
                                                                </td>

                                                                <td className="px-3 py-3 text-slate-600">
                                                                    {parameter.referenceRange ||
                                                                        "-"}
                                                                </td>

                                                                <td className="px-3 py-3">
                                                                    {parameter.flag ? (
                                                                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                                            {
                                                                                parameter.flag
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-400">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No result values available.
                                        </p>
                                    )}

                                    {selectedSample.resultRemarks && (
                                        <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                            <p className="text-xs font-medium text-slate-500">
                                                Result Remarks
                                            </p>

                                            <p className="mt-1 text-sm text-slate-700">
                                                {
                                                    selectedSample.resultRemarks
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QC */}
                            <div className="mb-5 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between border-b border-green-200 bg-green-50 px-4 py-3">
                                    <h3 className="font-semibold text-green-800">
                                        Quality Control
                                    </h3>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        Passed
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            QC By
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.qcBy || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            QC Date
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.qcDate || "-"}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            QC Remarks
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                            {selectedSample.qcRemarks ||
                                                "No remarks added."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <VerifiedIcon className="text-blue-600" />

                                        <h3 className="font-semibold text-blue-800">
                                            Verification
                                        </h3>
                                    </div>

                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                        Verified
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Verified Time
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.verificationTime ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            Verification Remarks
                                        </p>

                                        <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                            {selectedSample.verificationRemarks ||
                                                "No remarks added."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDetails(false);
                                    setSelectedSample(null);
                                }}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateReport}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <ReceiptLongOutlinedIcon fontSize="small" />
                                Generate Final Report
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
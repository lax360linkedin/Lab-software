import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
    accessionNumber: string;
    barcode: string;

    patientId: string;
    registrationId: string;
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

const formatDate = (date?: string) => {
    if (!date) return "-";

    return date;
};

const formatPriority = (priority?: StoredSample["priority"]) => {
    if (!priority) return "Normal";

    return priority;
};

export default function VerifiedResults() {
    const navigate = useNavigate();

    const [samples] = useState<StoredSample[]>(getStoredSamples);

    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");

    const [selectedSample, setSelectedSample] =
        useState<StoredSample | null>(null);

    const [showDetails, setShowDetails] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const verifiedSamples = useMemo(() => {
        return samples.filter(
            (sample) => sample.resultStatus === "Verified"
        );
    }, [samples]);

    const filteredSamples = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return verifiedSamples.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.accessionNumber.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search) ||
                sample.registrationId.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                formatPriority(sample.priority) === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [verifiedSamples, searchTerm, priorityFilter]);

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

    const columns = [
        "Sample",
        "Accession",
        "Patient",
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
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                                <VerifiedIcon className="text-blue-600" />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                                    Verified Results
                                </h1>

                                <p className="text-sm text-slate-500">
                                    View results that have completed verification
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-xs font-medium text-blue-600">
                            Verified Results
                        </p>

                        <p className="text-xl font-bold text-blue-700">
                            {verifiedSamples.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Search sample, accession, patient or test..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Priority */}
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
                                Verified Results
                            </h2>

                            <p className="text-xs text-slate-500">
                                {filteredSamples.length} result
                                {filteredSamples.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                        <CheckCircleIcon className="text-green-500" />
                    </div>
                </div>

                <div className="p-3 sm:p-5">
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="500px"
                            emptyMessage="No verified results found"
                            renderRow={(sample: StoredSample) => (
                                <>
                                    {/* Sample */}
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="whitespace-nowrap font-medium text-slate-800">
                                                {sample.sampleId}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {sample.barcode || "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Accession */}
                                    <td className="px-4 py-4">
                                        <p className="whitespace-nowrap text-sm text-slate-700">
                                            {sample.accessionNumber}
                                        </p>
                                    </td>

                                    {/* Patient */}
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
                                                {formatDate(
                                                    sample.verificationDate
                                                )}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {sample.verificationTime ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            <CheckCircleIcon fontSize="small" />
                                            Verified
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
            </div>

            {/* Right Side Drawer */}
            {showDetails && selectedSample && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => {
                            setShowDetails(false);
                            setSelectedSample(null);
                        }}
                    />

                    <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[520px]">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <VerifiedIcon className="text-green-600" />

                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Verified Result
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
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Verification Status */}
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
                                            This result has completed QC and
                                            verification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Information */}
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

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Registration ID
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.registrationId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Information */}
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
                                            Accession Number
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.accessionNumber}
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

                            {/* Result Values */}
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
                                            <table className="w-full min-w-[420px] text-left text-sm">
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
                                            No result parameters available.
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

                            {/* Result Entry Information */}
                            <div className="mb-5 rounded-xl border border-slate-200">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <h3 className="font-semibold text-slate-800">
                                        Result Entry Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Entered By
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.resultEnteredBy ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Entered Date
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.resultEnteredDate ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Entered Time
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.resultEnteredTime ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* QC Information */}
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

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            QC Time
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.qcTime || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            QC Remarks
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.qcRemarks || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Information */}
                            <div className="rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <VerifiedIcon className="text-blue-600" />

                                        <h3 className="font-semibold text-blue-800">
                                            Verification Information
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

                        {/* Drawer Footer */}
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
                                onClick={() => navigate("/reports/pending")}
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Go to Reports
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

interface ResultParameter {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
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
}

const PendingQC = () => {
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
    const [showQCDrawer, setShowQCDrawer] = useState(false);
    const [qcRemarks, setQcRemarks] = useState("");

    const pendingQC = useMemo(() => {
        return samples.filter(
            (sample) => sample.resultStatus === "QC Pending"
        );
    }, [samples]);

    const filteredSamples = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return pendingQC.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.accessionNumber.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.patientId.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                (sample.priority || "Normal") === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [pendingQC, searchTerm, priorityFilter]);

    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;

        return filteredSamples.slice(
            startIndex,
            startIndex + rowsPerPage
        );
    }, [filteredSamples, currentPage, rowsPerPage]);

    const columns = [
        "Sample ID",
        "Patient",
        "Test",
        "Sample",
        "Result Entered",
        "Priority",
        "QC Status",
        "Actions",
    ];

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePriorityFilter = (value: string) => {
        setPriorityFilter(value);
        setCurrentPage(1);
    };

    const handleView = (sample: StoredSample) => {
        setSelectedSample(sample);
        setShowDetails(true);
        setShowQCDrawer(false);
    };

    const handleOpenQC = (sample: StoredSample) => {
        setSelectedSample(sample);
        setQcRemarks("");
        setShowDetails(false);
        setShowQCDrawer(true);
    };

    const closeDrawers = () => {
        setShowDetails(false);
        setShowQCDrawer(false);
        setSelectedSample(null);
        setQcRemarks("");
    };

    const handleQCResult = (
        result: "Passed" | "Failed"
    ) => {
        if (!selectedSample) {
            return;
        }

        const qcDate = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const qcTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        let qcBy = "Laboratory Technician";

        try {
            const user = JSON.parse(
                localStorage.getItem("lab_user") || "null"
            );

            qcBy =
                user?.name ||
                user?.fullName ||
                user?.username ||
                "Laboratory Technician";
        } catch {
            // Use default technician name
        }

        const updatedSamples = samples.map((sample) => {
            const isSelected =
                sample.id === selectedSample.id ||
                sample.sampleId === selectedSample.sampleId;

            if (!isSelected) {
                return sample;
            }

            return {
                ...sample,

                resultStatus:
                    result === "Passed"
                        ? ("QC Passed" as const)
                        : ("QC Failed" as const),

                qcStatus: result,

                qcDate,
                qcTime,
                qcBy,
                qcRemarks: qcRemarks.trim(),
            };
        });

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);
        closeDrawers();

        if (result === "Passed") {
            navigate("/verification/pending");
        }
    };

    const urgentCount = pendingQC.filter(
        (sample) =>
            sample.priority === "Urgent" ||
            sample.priority === "STAT"
    ).length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/results/pending")
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <FactCheckOutlinedIcon className="text-blue-600" />

                                <h1 className="text-xl font-semibold text-slate-800">
                                    Pending QC
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Review and quality-check entered laboratory
                                results
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-xs font-medium text-blue-600">
                            Pending QC
                        </p>

                        <p className="mt-1 text-xl font-bold text-blue-700">
                            {pendingQC.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {/* Summary Cards */}
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Pending QC
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {pendingQC.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                                <FactCheckOutlinedIcon className="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Urgent / STAT
                                </p>

                                <p className="mt-1 text-2xl font-bold text-orange-600">
                                    {urgentCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50">
                                <PriorityHighIcon className="text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Ready for Verification
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {
                                        samples.filter(
                                            (sample) =>
                                                sample.resultStatus ===
                                                "QC Passed"
                                        ).length
                                    }
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
                                <CheckCircleIcon className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search / Filter */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <SearchIcon
                                fontSize="small"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearch(e.target.value)
                                }
                                placeholder="Search sample, patient, accession or test..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <FilterListIcon fontSize="small" />
                                <span>Priority</span>
                            </div>

                            <select
                                value={priorityFilter}
                                onChange={(e) =>
                                    handlePriorityFilter(
                                        e.target.value
                                    )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="All">
                                    All Priorities
                                </option>

                                <option value="Normal">
                                    Normal
                                </option>

                                <option value="Urgent">
                                    Urgent
                                </option>

                                <option value="STAT">
                                    STAT
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">
                                    Results Awaiting QC
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Review entered results before verification
                                </p>
                            </div>

                            <span className="text-sm text-slate-500">
                                {filteredSamples.length} result
                                {filteredSamples.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 sm:p-5">
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                data={currentData}
                                maxHeight="500px"
                                emptyMessage="No results are pending QC"
                                renderRow={(sample: StoredSample) => (
                                    <>
                                        {/* Sample ID */}
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                    {sample.sampleId}
                                                </p>

                                                <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                                                    {sample.accessionNumber}
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
                                            <div className="min-w-[150px]">
                                                <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                    {sample.testName}
                                                </p>

                                                <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                                                    {sample.method ||
                                                        "Laboratory Test"}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Sample */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {sample.sampleType}
                                            </span>
                                        </td>

                                        {/* Result Entered */}
                                        <td className="px-4 py-4">
                                            <div className="flex min-w-[130px] items-center gap-2">
                                                <AccessTimeIcon
                                                    fontSize="small"
                                                    className="text-slate-400"
                                                />

                                                <div>
                                                    <p className="whitespace-nowrap text-sm text-slate-700">
                                                        {sample.resultEnteredDate ||
                                                            "-"}
                                                    </p>

                                                    <p className="whitespace-nowrap text-xs text-slate-400">
                                                        {sample.resultEnteredTime ||
                                                            "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Priority */}
                                        <td className="px-4 py-4">
                                            {sample.priority === "STAT" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                    <PriorityHighIcon fontSize="inherit" />
                                                    STAT
                                                </span>
                                            ) : sample.priority ===
                                              "Urgent" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                                                    <PriorityHighIcon fontSize="inherit" />
                                                    Urgent
                                                </span>
                                            ) : (
                                                <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                    Normal
                                                </span>
                                            )}
                                        </td>

                                        {/* QC Status */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                Pending QC
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    title="View Result"
                                                    onClick={() =>
                                                        handleView(
                                                            sample
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenQC(
                                                            sample
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    <FactCheckOutlinedIcon fontSize="small" />
                                                    QC Check
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            />
                        </div>
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

            {/* View Result Drawer */}
            {showDetails && selectedSample && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Result Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedSample.sampleId} ·{" "}
                                    {selectedSample.testName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDrawers}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            {/* Patient */}
                            <div className="rounded-xl border border-slate-200">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Patient Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Patient Name
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.patientName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Patient ID
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.patientId}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Registration ID
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.registrationId}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Sample Type
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.sampleType}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Result */}
                            <div className="rounded-xl border border-slate-200">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Test Result
                                        </h3>

                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                                            QC Pending
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto p-4">
                                    {selectedSample.resultParameters &&
                                    selectedSample.resultParameters.length >
                                        0 ? (
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                                                        Parameter
                                                    </th>

                                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                                                        Result
                                                    </th>

                                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                                                        Unit
                                                    </th>

                                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
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
                                                            <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                                                {
                                                                    parameter.name
                                                                }
                                                            </td>

                                                            <td className="px-3 py-3 text-sm font-semibold text-slate-800">
                                                                {
                                                                    parameter.value
                                                                }
                                                            </td>

                                                            <td className="px-3 py-3 text-sm text-slate-500">
                                                                {
                                                                    parameter.unit
                                                                }
                                                            </td>

                                                            <td className="px-3 py-3 text-sm text-slate-500">
                                                                {
                                                                    parameter.referenceRange
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-slate-500">
                                            No result parameters available.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Result Remarks
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {selectedSample.resultRemarks ||
                                        "No remarks added."}
                                </p>
                            </div>

                            {/* Result Entered */}
                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Entered Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.resultEnteredDate ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Entered Time
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.resultEnteredTime ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Entered By
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {selectedSample.resultEnteredBy ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
                            <button
                                type="button"
                                onClick={() =>
                                    handleOpenQC(selectedSample)
                                }
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Perform QC Check
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QC Right Drawer */}
            {showQCDrawer && selectedSample && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl">
                        {/* Drawer Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                    <FactCheckOutlinedIcon className="text-blue-600" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Quality Control Check
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {selectedSample.sampleId} ·{" "}
                                        {selectedSample.testName}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeDrawers}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="space-y-5">
                                {/* QC Status */}
                                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                    <div>
                                        <p className="text-xs font-medium text-amber-600">
                                            Current Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-amber-700">
                                            Pending QC Review
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                        QC Pending
                                    </span>
                                </div>

                                {/* Patient Details */}
                                <div className="rounded-xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <PersonIcon
                                                fontSize="small"
                                                className="text-blue-600"
                                            />

                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Patient Information
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Patient Name
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {
                                                    selectedSample.patientName
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Patient ID
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {
                                                    selectedSample.patientId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Registration ID
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.registrationId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Sample Type
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.sampleType
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sample / Analysis */}
                                <div className="rounded-xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <ScienceOutlinedIcon
                                                fontSize="small"
                                                className="text-blue-600"
                                            />

                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Sample & Analysis
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Sample ID
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-blue-600">
                                                {
                                                    selectedSample.sampleId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Accession Number
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.accessionNumber
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Test
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {selectedSample.testName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Analyzer
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedSample.analyzer ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Method
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedSample.method ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Completed By
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedSample.completedBy ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Result Values */}
                                <div className="rounded-xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Result Values
                                            </h3>

                                            <span className="text-xs text-slate-400">
                                                Review before QC decision
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto p-4">
                                        {selectedSample.resultParameters &&
                                        selectedSample.resultParameters
                                            .length > 0 ? (
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Parameter
                                                        </th>

                                                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Result
                                                        </th>

                                                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Unit
                                                        </th>

                                                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Reference Range
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
                                                                <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                                                    {
                                                                        parameter.name
                                                                    }
                                                                </td>

                                                                <td className="px-3 py-3 text-sm font-bold text-slate-800">
                                                                    {
                                                                        parameter.value
                                                                    }
                                                                </td>

                                                                <td className="px-3 py-3 text-sm text-slate-500">
                                                                    {
                                                                        parameter.unit
                                                                    }
                                                                </td>

                                                                <td className="px-3 py-3 text-sm text-slate-500">
                                                                    {
                                                                        parameter.referenceRange
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <ScienceOutlinedIcon className="text-4xl text-slate-300" />

                                                <p className="mt-2 text-sm text-slate-500">
                                                    No result values available.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Result Remarks */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Result Remarks
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {selectedSample.resultRemarks ||
                                            "No remarks added."}
                                    </p>
                                </div>

                                {/* QC Remarks */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        QC Remarks
                                    </label>

                                    <textarea
                                        value={qcRemarks}
                                        onChange={(e) =>
                                            setQcRemarks(
                                                e.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Enter QC observations, review notes or comments..."
                                        className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Information */}
                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-xs font-semibold text-blue-700">
                                        QC Review
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                        Review the entered result, analyzer
                                        information and reference range before
                                        selecting Pass or Fail.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="shrink-0 border-t border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeDrawers}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQCResult(
                                            "Failed"
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                    <CancelOutlinedIcon fontSize="small" />
                                    Fail QC
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQCResult(
                                            "Passed"
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                                >
                                    <CheckCircleIcon fontSize="small" />
                                    Pass QC
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingQC;
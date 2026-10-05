import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import Pagination from "../../common components/Pagination";
import Table from "../../common components/Table";

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

const VerificationPending = () => {
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
    const [selectedSample, setSelectedSample] =useState<StoredSample | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [verificationRemarks, setVerificationRemarks] = useState("");

    const pendingVerification = useMemo(() => {
        return samples.filter(
            (sample) => sample.resultStatus === "QC Passed"
        );
    }, [samples]);

    const filteredSamples = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return pendingVerification.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.accessionNumber.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search) ||
                sample.barcode.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                sample.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [pendingVerification, searchTerm, priorityFilter]);

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
        setVerificationRemarks("");
        setShowDetails(true);
    };

    const handleCloseDrawer = () => {
        setShowDetails(false);
        setSelectedSample(null);
        setVerificationRemarks("");
    };

    const handleVerify = () => {
        if (!selectedSample) return;

        const now = new Date();

        const verificationDate = now.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const verificationTime = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        let verificationBy = "Laboratory Technician";

        try {
            const user = JSON.parse(
                localStorage.getItem("lab_user") || "null"
            );

            verificationBy =
                user?.name ||
                user?.fullName ||
                user?.username ||
                "Laboratory Technician";
        } catch {
            // fallback
        }

        const updatedSamples = samples.map((sample) => {
            if (
                sample.id === selectedSample.id ||
                sample.sampleId === selectedSample.sampleId
            ) {
                return {
                    ...sample,
                    resultStatus: "Verified" as StoredSample["resultStatus"],
                    verificationDate,
                    verificationTime,
                    verificationBy,
                    verificationRemarks:
                        verificationRemarks.trim(),
                };
            }

            return sample;
        });

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);

        handleCloseDrawer();

        navigate("/reports");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Verification Pending
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Review QC-passed results before final verification
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        <FactCheckOutlinedIcon fontSize="small" />

                        {pendingVerification.length} Pending
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
                            placeholder="Search sample, accession, patient or test..."
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
                            "Sample",
                            "Accession",
                            "Patient",
                            "Test",
                            "Sample Type",
                            "Priority",
                            "QC Status",
                            "Action",
                        ]}
                        data={currentData}
                        maxHeight="500px"
                        emptyMessage="No results pending verification."
                        renderRow={(sample: StoredSample) => (
                            <>
                                {/* Sample */}
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="whitespace-nowrap font-semibold text-slate-800">
                                            {sample.sampleId}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {sample.barcode}
                                        </p>
                                    </div>
                                </td>

                                {/* Accession */}
                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                                        {sample.accessionNumber}
                                    </span>
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

                                {/* QC Status */}
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                                        <CheckCircleIcon fontSize="inherit" />
                                        QC Passed
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

            {/* Verification Drawer */}
            {showDetails && selectedSample && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <VerifiedOutlinedIcon className="text-blue-600" />

                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Verify Result
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

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Verification Status */}
                            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircleIcon className="text-green-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-green-800">
                                            QC Passed
                                        </p>

                                        <p className="mt-1 text-xs text-green-700">
                                            This result is ready for final
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
                                            Accession Number
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {selectedSample.accessionNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Information */}
                            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <ScienceOutlinedIcon className="text-slate-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Sample & Test Information
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

                            {/* Result Remarks */}
                            {selectedSample.resultRemarks && (
                                <div className="mb-5 rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 font-semibold text-slate-800">
                                        Result Remarks
                                    </h3>

                                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                        {selectedSample.resultRemarks}
                                    </p>
                                </div>
                            )}

                            {/* QC Information */}
                            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                                <h3 className="mb-4 font-semibold text-green-800">
                                    Quality Control
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-green-700">
                                            QC Status
                                        </p>

                                        <p className="mt-1 font-semibold text-green-800">
                                            {selectedSample.qcStatus ||
                                                "Passed"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-green-700">
                                            Checked By
                                        </p>

                                        <p className="mt-1 font-medium text-green-800">
                                            {selectedSample.qcBy || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-green-700">
                                            QC Date
                                        </p>

                                        <p className="mt-1 font-medium text-green-800">
                                            {selectedSample.qcDate || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-green-700">
                                            QC Time
                                        </p>

                                        <p className="mt-1 font-medium text-green-800">
                                            {selectedSample.qcTime || "-"}
                                        </p>
                                    </div>
                                </div>

                                {selectedSample.qcRemarks && (
                                    <div className="mt-4">
                                        <p className="text-xs text-green-700">
                                            QC Remarks
                                        </p>

                                        <p className="mt-1 rounded-lg bg-white p-3 text-sm text-green-800">
                                            {selectedSample.qcRemarks}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Verification Remarks */}
                            <div className="rounded-xl border border-slate-200 p-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Verification Remarks
                                </label>

                                <textarea
                                    value={verificationRemarks}
                                    onChange={(e) =>
                                        setVerificationRemarks(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Enter verification remarks..."
                                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleVerify}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <VerifiedOutlinedIcon fontSize="small" />
                                Verify Result
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationPending;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import CloseIcon from "@mui/icons-material/Close";

import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type SampleStatus =
    | "Pending Collection"
    | "Collected"
    | "Received"
    | "Accepted"
    | "Processing"
    | "Completed"
    | "Rejected";

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

    status: SampleStatus;
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
}

interface LabTest {
    id?: string;
    code?: string;
    name?: string;
    category?: string;
    sampleType?: string;
    method?: string;
}

interface ProcessingTest {
    id: string;
    sampleId: string;
    accessionNumber: string;
    patientId: string;
    patientName: string;
    testName: string;
    sampleType: string;
    analyzer: string;
    method: string;
    startedDate: string;
    startedTime: string;
    technician: string;
    status: "Processing";
    originalSample: StoredSample;
}

const columns = [
    "Sample ID",
    "Accession ID",
    "Patient",
    "Test",
    "Sample",
    "Analyzer / Method",
    "Started",
    "Technician",
    "Status",
    "Actions",
];

const Processing = () => {
    const navigate = useNavigate();

    const [samples, setSamples] = useState<StoredSample[]>(() => {
        try {
            const stored = localStorage.getItem("lab_samples");

            if (!stored) {
                return [];
            }

            return JSON.parse(stored);
        } catch {
            return [];
        }
    });

    const [testMasterData] = useState<LabTest[]>(() => {
        try {
            const stored = localStorage.getItem("lab_tests");

            if (!stored) {
                return [];
            }

            return JSON.parse(stored);
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [analyzerFilter, setAnalyzerFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedTest, setSelectedTest] = useState<ProcessingTest | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const processingTests = useMemo<ProcessingTest[]>(() => {
        return samples
            .filter((sample) => sample.status === "Processing")
            .map((sample) => {
                const masterTest = testMasterData.find(
                    (test) =>
                        test.id === sample.testId ||
                        test.code === sample.testId ||
                        test.name === sample.testName
                );

                return {
                    id: sample.id,
                    sampleId: sample.sampleId,
                    accessionNumber: sample.accessionNumber,
                    patientId: sample.patientId,
                    patientName: sample.patientName,
                    testName: sample.testName,
                    sampleType: sample.sampleType,

                    analyzer:
                        sample.analyzer ||
                        "Laboratory Analyzer",

                    method:
                        sample.method ||
                        masterTest?.method ||
                        "Standard Laboratory Method",

                    startedDate:
                        sample.processingDate ||
                        sample.acceptedDate ||
                        "-",

                    startedTime:
                        sample.processingTime ||
                        sample.acceptedTime ||
                        "-",

                    technician:
                        sample.processingBy ||
                        "Laboratory Technician",

                    status: "Processing",

                    originalSample: sample,
                };
            });
    }, [samples, testMasterData]);

    const analyzerList = useMemo(() => {
        return Array.from(
            new Set(
                processingTests
                    .map((test) => test.analyzer)
                    .filter(Boolean)
            )
        );
    }, [processingTests]);

    const filteredTests = useMemo(() => {
        return processingTests.filter((test) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                test.sampleId.toLowerCase().includes(search) ||
                test.accessionNumber
                    .toLowerCase()
                    .includes(search) ||
                test.patientId.toLowerCase().includes(search) ||
                test.patientName.toLowerCase().includes(search) ||
                test.testName.toLowerCase().includes(search) ||
                test.sampleType.toLowerCase().includes(search) ||
                test.technician.toLowerCase().includes(search) ||
                test.analyzer.toLowerCase().includes(search);

            const matchesAnalyzer =
                analyzerFilter === "All" ||
                test.analyzer === analyzerFilter;

            return matchesSearch && matchesAnalyzer;
        });
    }, [
        processingTests,
        searchTerm,
        analyzerFilter,
    ]);

    const currentData = filteredTests.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const activeAnalyzers = new Set(
        processingTests.map((test) => test.analyzer)
    ).size;

    const activeTechnicians = new Set(
        processingTests.map((test) => test.technician)
    ).size;

    const handleReset = () => {
        setSearchTerm("");
        setAnalyzerFilter("All");
        setCurrentPage(1);
    };

    const handleViewDetails = (test: ProcessingTest) => {
        setSelectedTest(test);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedTest(null);
    };
    const getToday = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

const getLoggedInUserName = () => {
    try {
        const user = JSON.parse(
            localStorage.getItem("lab_user") || "null"
        );

        return (
            user?.name ||
            user?.fullName ||
            user?.username ||
            "Laboratory Technician"
        );
    } catch {
        return "Laboratory Technician";
    }
};

const handleCompleteAnalysis = () => {
    if (!selectedTest) return;

    const completedDate = getToday();
    const completedTime = getCurrentTime();
    const completedBy = getLoggedInUserName();

    try {
        const stored = localStorage.getItem("lab_samples");
        const parsed = stored ? JSON.parse(stored) : [];

        const currentSamples: StoredSample[] = Array.isArray(parsed)
            ? parsed
            : [];

        const updatedSamples = currentSamples.map((sample) => {
            const isSelectedSample =
                sample.id === selectedTest.id ||
                sample.sampleId === selectedTest.sampleId;

            if (!isSelectedSample) {
                return sample;
            }

            return {
                ...sample,
                status: "Completed" as SampleStatus,
                completedDate,
                completedTime,
                completedBy,
            };
        });

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);

        handleCloseDetails();

        navigate("/analysis/completed");
    } catch {
        console.error("Failed to complete analysis");
    }
};

    return (
        <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 lg:px-6">

            {/* Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50"
                    >
                        <ArrowBackIcon fontSize="small" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                            Processing
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                            Tests currently undergoing laboratory analysis
                        </p>
                    </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                    <BiotechOutlinedIcon
                        className="text-amber-600"
                        fontSize="small"
                    />

                    <span className="text-xs font-semibold text-amber-700">
                        Analysis in Progress
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Total Processing
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-gray-800">
                                {processingTests.length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                            <ScienceOutlinedIcon className="text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Started Today */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Started Today
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-blue-600">
                                {processingTests.filter(
                                    (test) =>
                                        test.startedDate ===
                                        new Date().toLocaleDateString(
                                            "en-GB",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )
                                ).length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <PlayCircleIcon className="text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Analyzers */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Active Analyzers
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-purple-600">
                                {activeAnalyzers}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                            <SpeedOutlinedIcon className="text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Technicians */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Active Technicians
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-green-600">
                                {activeTechnicians}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                            <PersonIcon className="text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                <div className="mb-4 flex items-center gap-2">
                    <FilterListIcon
                        className="text-gray-600"
                        fontSize="small"
                    />

                    <h2 className="text-sm font-semibold text-gray-800">
                        Search & Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                    <div className="relative xl:col-span-2">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            fontSize="small"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search sample, accession, patient or test..."
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    <select
                        value={analyzerFilter}
                        onChange={(e) => {
                            setAnalyzerFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">
                            All Analyzers
                        </option>

                        {analyzerList.map((analyzer) => (
                            <option
                                key={analyzer}
                                value={analyzer}
                            >
                                {analyzer}
                            </option>
                        ))}
                    </select>

                    <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
                        <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />

                        <span className="text-sm font-medium text-gray-600">
                            Processing Only
                        </span>
                    </div>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleReset}
                        className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-800 sm:text-base">
                            Tests Under Processing
                        </h2>

                        <p className="text-xs text-gray-500">
                            {filteredTests.length} test
                            {filteredTests.length !== 1
                                ? "s"
                                : ""}{" "}
                            currently processing
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

                        <span className="text-xs font-medium text-amber-700">
                            Live Processing
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        data={currentData}
                        maxHeight="380px"
                        renderRow={(test: ProcessingTest) => (
                            <>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                                            <ScienceOutlinedIcon
                                                className="text-amber-600"
                                                fontSize="small"
                                            />
                                        </div>

                                        <div>
                                            <p className="whitespace-nowrap text-xs font-semibold text-blue-700">
                                                {test.sampleId}
                                            </p>

                                            <p className="text-[11px] text-gray-500">
                                                {test.sampleType}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="whitespace-nowrap text-xs font-semibold text-gray-700">
                                        {test.accessionNumber}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                            <PersonIcon
                                                className="text-gray-500"
                                                fontSize="small"
                                            />
                                        </div>

                                        <div>
                                            <p className="whitespace-nowrap text-xs font-semibold text-gray-800">
                                                {test.patientName}
                                            </p>

                                            <p className="text-[11px] text-gray-500">
                                                {test.patientId}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                                        {test.testName}
                                    </p>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        {test.sampleType}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex min-w-[180px] items-start gap-2">
                                        <BiotechOutlinedIcon
                                            className="mt-0.5 text-purple-500"
                                            fontSize="small"
                                        />

                                        <div>
                                            <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                                                {test.analyzer}
                                            </p>

                                            <p className="mt-0.5 whitespace-nowrap text-[11px] text-gray-500">
                                                {test.method}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="min-w-[120px]">
                                        <div className="flex items-center gap-1.5">
                                            <AccessTimeIcon
                                                className="text-gray-400"
                                                fontSize="small"
                                            />

                                            <span className="whitespace-nowrap text-xs font-medium text-gray-700">
                                                {test.startedTime}
                                            </span>
                                        </div>

                                        <p className="ml-6 mt-0.5 whitespace-nowrap text-[11px] text-gray-500">
                                            {test.startedDate}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50">
                                            <PersonIcon
                                                className="text-green-600"
                                                fontSize="small"
                                            />
                                        </div>

                                        <span className="whitespace-nowrap text-xs text-gray-700">
                                            {test.technician}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                        Processing
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <button
                                        onClick={() =>
                                            handleViewDetails(test)
                                        }
                                        title="View Details"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <VisibilityOutlinedIcon fontSize="small" />
                                    </button>
                                </td>
                            </>
                        )}
                    />
                </div>

                {filteredTests.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <Pagination
                            totalItems={filteredTests.length}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}

                {filteredTests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <BiotechOutlinedIcon className="mb-2 text-4xl text-gray-300" />

                        <p className="text-sm font-semibold text-gray-600">
                            No processing tests found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Tests will appear here after analysis is started.
                        </p>
                    </div>
                )}
            </div>

            {/* Processing Details Drawer */}
            {showDetails && selectedTest && (
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
                        onClick={handleCloseDetails}
                    />

                    <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                    <ScienceOutlinedIcon className="text-amber-600" />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-gray-800">
                                        Processing Details
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {selectedTest.sampleId}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseDetails}
                                title="Close"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-5">

                            {/* Status */}
                            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                                            <PlayCircleIcon className="text-amber-600" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-amber-700">
                                                Current Status
                                            </p>

                                            <p className="mt-0.5 text-sm font-semibold text-amber-800">
                                                Processing
                                            </p>
                                        </div>
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold text-amber-700">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* Patient */}
                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">
                                    <PersonIcon
                                        className="text-blue-600"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Patient Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Patient Name
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                                {selectedTest.patientName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Patient ID
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-blue-700">
                                                {selectedTest.patientId}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Sample */}
                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">
                                    <ScienceOutlinedIcon
                                        className="text-purple-600"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Sample Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white">

                                    <div className="grid grid-cols-2 divide-x divide-gray-200">

                                        <div className="p-3">
                                            <p className="text-[11px] text-gray-500">
                                                Sample ID
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-blue-700">
                                                {selectedTest.sampleId}
                                            </p>
                                        </div>

                                        <div className="p-3">
                                            <p className="text-[11px] text-gray-500">
                                                Accession ID
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.accessionNumber}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">

                                        <div className="p-3">
                                            <p className="text-[11px] text-gray-500">
                                                Sample Type
                                            </p>

                                            <p className="mt-1 text-xs font-medium text-gray-700">
                                                {selectedTest.sampleType}
                                            </p>
                                        </div>

                                        <div className="p-3">
                                            <p className="text-[11px] text-gray-500">
                                                Test Name
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.testName}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Analyzer */}
                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">
                                    <BiotechOutlinedIcon
                                        className="text-purple-600"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Analyzer Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">

                                    <div className="mb-4">
                                        <p className="text-[11px] text-gray-500">
                                            Analyzer
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                            {selectedTest.analyzer}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-gray-500">
                                            Testing Method
                                        </p>

                                        <span className="mt-1 inline-flex rounded-lg bg-purple-50 px-3 py-1.5 text-[11px] font-semibold text-purple-700">
                                            {selectedTest.method}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Processing */}
                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">
                                    <AccessTimeIcon
                                        className="text-orange-500"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Processing Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Started Date
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.startedDate}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Started Time
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.startedTime}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Technician */}
                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">
                                    <PersonIcon
                                        className="text-green-600"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Assigned Technician
                                    </h3>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                                        <PersonIcon className="text-green-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {selectedTest.technician}
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-gray-500">
                                            Laboratory Technician
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* Workflow */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                                <div className="flex gap-3">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                        <BiotechOutlinedIcon
                                            className="text-blue-600"
                                            fontSize="small"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-blue-800">
                                            Analysis In Progress
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                            The accepted sample is currently being processed using the assigned analyzer and testing method.
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 border-t border-gray-200 bg-white px-5 py-4">

    <button
        onClick={handleCloseDetails}
        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
    >
        Close
    </button>

    <button
        onClick={handleCompleteAnalysis}
        className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700"
    >
        Completed
    </button>

</div>

                    </div>
                </>
            )}
        </div>
    );
};

export default Processing;
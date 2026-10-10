import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
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

interface PendingTest {
    id: string;
    sampleId: string;
    patientId: string;
    patientName: string;
    testName: string;
    testCategory: string;
    sampleType: string;
    receivedDate: string;
    receivedTime: string;
    priority: "Normal" | "Urgent" | "STAT";
    status: "Pending";
    originalSample: StoredSample;
}

const columns = [
    "Sample ID",
    "Patient & ID",
    "Test",
    "Category",
    "Sample Type",
    "Received",
    "Priority",
    "Status",
    "Actions",
];

const getPriorityClasses = (
    priority: PendingTest["priority"]
) => {
    switch (priority) {
        case "STAT":
            return "bg-red-50 text-red-700 border-red-200";

        case "Urgent":
            return "bg-orange-50 text-orange-700 border-orange-200";

        case "Normal":
            return "bg-blue-50 text-blue-700 border-blue-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

const getToday = () => {
    return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const getCurrentTechnician = () => {
    try {
        const storedUser = localStorage.getItem("lab_user");

        if (!storedUser) {
            return "Laboratory Technician";
        }

        const user = JSON.parse(storedUser);

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

const PendingTests = () => {
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
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedTest, setSelectedTest] =
        useState<PendingTest | null>(null);

    const [showDetails, setShowDetails] = useState(false);

    const pendingTests = useMemo<PendingTest[]>(() => {
        return samples
            .filter((sample) => sample.status === "Accepted")
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
                    patientId: sample.patientId,
                    patientName: sample.patientName,
                    testName: sample.testName,
                    testCategory:
                        masterTest?.category || "Laboratory",
                    sampleType: sample.sampleType,
                    receivedDate:
                        sample.receivedDate ||
                        sample.acceptedDate ||
                        "-",
                    receivedTime:
                        sample.receivedTime ||
                        sample.acceptedTime ||
                        "-",
                    priority: sample.priority || "Normal",
                    status: "Pending",
                    originalSample: sample,
                };
            });
    }, [samples, testMasterData]);

    const filteredTests = useMemo(() => {
        return pendingTests.filter((test) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                test.sampleId.toLowerCase().includes(search) ||
                test.patientId.toLowerCase().includes(search) ||
                test.patientName.toLowerCase().includes(search) ||
                test.testName.toLowerCase().includes(search) ||
                test.sampleType.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                test.priority === priorityFilter;

            const matchesCategory =
                categoryFilter === "All" ||
                test.testCategory === categoryFilter;

            return (
                matchesSearch &&
                matchesPriority &&
                matchesCategory
            );
        });
    }, [
        pendingTests,
        searchTerm,
        priorityFilter,
        categoryFilter,
    ]);

    const currentData = filteredTests.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const normalCount = pendingTests.filter(
        (test) => test.priority === "Normal"
    ).length;

    const urgentCount = pendingTests.filter(
        (test) => test.priority === "Urgent"
    ).length;

    const statCount = pendingTests.filter(
        (test) => test.priority === "STAT"
    ).length;

    const categories = useMemo(() => {
        return Array.from(
            new Set(
                pendingTests
                    .map((test) => test.testCategory)
                    .filter(Boolean)
            )
        );
    }, [pendingTests]);

    const handleReset = () => {
        setSearchTerm("");
        setPriorityFilter("All");
        setCategoryFilter("All");
        setCurrentPage(1);
    };

    const handleViewDetails = (test: PendingTest) => {
        setSelectedTest(test);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedTest(null);
    };

    const handleStartAnalysis = () => {
        if (!selectedTest) {
            return;
        }

        const today = getToday();
        const currentTime = getCurrentTime();
        const technician = getCurrentTechnician();

        const masterTest = testMasterData.find(
            (test) =>
                test.id === selectedTest.originalSample.testId ||
                test.code === selectedTest.originalSample.testId ||
                test.name === selectedTest.testName
        );

        const updatedSamples = samples.map((sample) => {
            if (
                sample.id !== selectedTest.originalSample.id &&
                sample.sampleId !== selectedTest.sampleId
            ) {
                return sample;
            }

            return {
                ...sample,

                status: "Processing" as SampleStatus,

                processingDate: today,
                processingTime: currentTime,
                processingBy: technician,

                priority:
                    sample.priority || selectedTest.priority,

                method:
                    sample.method ||
                    masterTest?.method ||
                    "Standard Laboratory Method",
            };
        });

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);

        handleCloseDetails();

        navigate("/analysis/processing");
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
                            Pending Tests
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                            Accepted samples waiting to begin laboratory analysis
                        </p>
                    </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                    <ScienceOutlinedIcon
                        className="text-blue-600"
                        fontSize="small"
                    />

                    <span className="text-xs font-semibold text-blue-700">
                        Ready for Analysis
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Total Pending
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-gray-800">
                                {pendingTests.length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <ScienceOutlinedIcon className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Normal Priority
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-blue-600">
                                {normalCount}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <CheckCircleIcon className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Urgent Tests
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-orange-600">
                                {urgentCount}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                            <PriorityHighIcon className="text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                STAT Tests
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-red-600">
                                {statCount}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                            <PriorityHighIcon className="text-red-600" />
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
                            placeholder="Search sample, patient or test..."
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">All Priority</option>
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="STAT">STAT</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">
                            All Categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
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
                            Tests Waiting for Analysis
                        </h2>

                        <p className="text-xs text-gray-500">
                            {filteredTests.length} test
                            {filteredTests.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        data={currentData}
                        maxHeight="380px"
                        renderRow={(test: PendingTest) => (
                            <>
                                <td className="px-2 py-3">
                                    <div className="flex items-center">
                                        <div>
                                            <p className="whitespace-nowrap text-xs font-semibold text-blue-700">
                                                {test.sampleId}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-2 py-3">
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
                                    <span className="whitespace-nowrap rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700">
                                        {test.testCategory}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="whitespace-nowrap text-xs text-gray-600">
                                        {test.sampleType}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="min-w-[125px]">
                                        <div className="flex items-center gap-1.5">
                                            <AccessTimeIcon
                                                className="text-gray-400"
                                                fontSize="small"
                                            />

                                            <span className="whitespace-nowrap text-xs font-medium text-gray-700">
                                                {test.receivedTime}
                                            </span>
                                        </div>

                                        <p className="ml-6 mt-0.5 whitespace-nowrap text-[11px] text-gray-500">
                                            {test.receivedDate}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold ${getPriorityClasses(
                                            test.priority
                                        )}`}
                                    >
                                        {(test.priority ===
                                            "Urgent" ||
                                            test.priority ===
                                                "STAT") && (
                                            <PriorityHighIcon fontSize="inherit" />
                                        )}

                                        {test.priority}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="inline-flex whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                                        Pending
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
                        <ScienceOutlinedIcon className="mb-2 text-4xl text-gray-300" />

                        <p className="text-sm font-semibold text-gray-600">
                            No pending tests found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Accepted samples will appear here when they are ready for analysis.
                        </p>
                    </div>
                )}
            </div>

            {/* Details Drawer */}
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                    <ScienceOutlinedIcon className="text-blue-600" />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-gray-800">
                                        Test Details
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-amber-700">
                                            Current Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-amber-800">
                                            Pending Analysis
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${getPriorityClasses(
                                            selectedTest.priority
                                        )}`}
                                    >
                                        {selectedTest.priority}
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

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.sampleId}
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
                                                Category
                                            </p>

                                            <span className="mt-1 inline-flex rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
                                                {selectedTest.testCategory}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test */}
                            <div className="mb-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <AssignmentOutlinedIcon
                                        className="text-green-600"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Test Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <p className="text-[11px] text-gray-500">
                                        Test Name
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {selectedTest.testName}
                                    </p>
                                </div>
                            </div>

                            {/* Received */}
                            <div className="mb-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <AccessTimeIcon
                                        className="text-orange-500"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Received Information
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Received Date
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.receivedDate}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-gray-500">
                                                Received Time
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.receivedTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                        <ScienceOutlinedIcon
                                            className="text-blue-600"
                                            fontSize="small"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-blue-800">
                                            Ready for Analysis
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                            This sample was accepted during accession and is ready to begin laboratory analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 bg-white px-5 py-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseDetails}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                <button
                                    onClick={handleStartAnalysis}
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Start Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PendingTests;
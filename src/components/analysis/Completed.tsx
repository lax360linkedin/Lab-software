import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";

import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import "./completed.css";

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

interface CompletedTest {
    id: string;
    sampleId: string;
    accessionNumber: string;
    patientId: string;
    patientName: string;
    testName: string;
    sampleType: string;
    completedDate: string;
    completedTime: string;
    technician: string;
    analyzer: string;
    method: string;
    resultStatus: "Ready for Results" | "Result Entered";
    status: "Completed";
    originalSample: StoredSample;
}

const columns = [
    "Sample ID",
    "Accession ID",
    "Patient",
    "Test",
    "Sample",
    "Completed",
    "Technician",
    "Result Status",
    "Actions",
];

const Completed = () => {
    const navigate = useNavigate();

    /* -------------------------------------------------------
       Load Samples
    ------------------------------------------------------- */

    const [samples, ] = useState<StoredSample[]>(() => {
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

    /* -------------------------------------------------------
       Load Test Master Data
    ------------------------------------------------------- */

    const [testMasterData] = useState<LabTest[]>(() => {
        try {
            const stored = localStorage.getItem("lab_tests");

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
    const [resultStatusFilter, setResultStatusFilter] =
        useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedTest, setSelectedTest] =
        useState<CompletedTest | null>(null);

    const [showDetails, setShowDetails] = useState(false);
    const [showPrintForm, setShowPrintForm] = useState(false);

    /* -------------------------------------------------------
       Convert Completed Samples
    ------------------------------------------------------- */

    const completedTests = useMemo<CompletedTest[]>(() => {
        return samples
            .filter((sample) => sample.status === "Completed")
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

                    completedDate:
                        sample.completedDate ||
                        sample.processingDate ||
                        sample.acceptedDate ||
                        "-",

                    completedTime:
                        sample.completedTime ||
                        sample.processingTime ||
                        sample.acceptedTime ||
                        "-",

                    technician:
                        sample.completedBy ||
                        sample.processingBy ||
                        sample.acceptedBy ||
                        "Laboratory Technician",

                    analyzer:
                        sample.analyzer ||
                        "Laboratory Analyzer",

                    method:
                        sample.method ||
                        masterTest?.method ||
                        "Standard Laboratory Method",

                    /*
                     * A newly completed analysis is ready for
                     * result entry.
                     *
                     * Later, when Results module updates the
                     * sample, this can be changed to
                     * "Result Entered".
                     */
                    resultStatus: "Ready for Results",

                    status: "Completed",

                    originalSample: sample,
                };
            });
    }, [samples, testMasterData]);

    /* -------------------------------------------------------
       Search & Filters
    ------------------------------------------------------- */

    const filteredTests = useMemo(() => {
        return completedTests.filter((test) => {
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

            const matchesResultStatus =
                resultStatusFilter === "All" ||
                test.resultStatus === resultStatusFilter;

            return matchesSearch && matchesResultStatus;
        });
    }, [
        completedTests,
        searchTerm,
        resultStatusFilter,
    ]);

    /* -------------------------------------------------------
       Pagination
    ------------------------------------------------------- */

    const currentData = filteredTests.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    /* -------------------------------------------------------
       Summary Counts
    ------------------------------------------------------- */

    const readyForResultsCount = completedTests.filter(
        (test) => test.resultStatus === "Ready for Results"
    ).length;

    const resultEnteredCount = completedTests.filter(
        (test) => test.resultStatus === "Result Entered"
    ).length;

    /* -------------------------------------------------------
       Handlers
    ------------------------------------------------------- */

    const handleReset = () => {
        setSearchTerm("");
        setResultStatusFilter("All");
        setCurrentPage(1);
    };

    const handleView = (test: CompletedTest) => {
        setSelectedTest(test);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedTest(null);
    };

    const handlePrint = (test: CompletedTest) => {
        setSelectedTest(test);
        setShowPrintForm(true);
    };

    const handleClosePrintForm = () => {
        setShowPrintForm(false);
        setSelectedTest(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 lg:px-6">

            {/* -------------------------------------------------------
                Header
            ------------------------------------------------------- */}

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
                            Completed Tests
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                            Analysis completed and samples ready for result processing
                        </p>
                    </div>

                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2">

                    <VerifiedOutlinedIcon
                        className="text-green-600"
                        fontSize="small"
                    />

                    <span className="text-xs font-semibold text-green-700">
                        Analysis Completed
                    </span>

                </div>

            </div>

            {/* -------------------------------------------------------
                Summary Cards
            ------------------------------------------------------- */}

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Total Completed
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-gray-800">
                                {completedTests.length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                            <ScienceOutlinedIcon className="text-green-600" />
                        </div>

                    </div>

                </div>

                {/* Ready for Results */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Ready for Results
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-blue-600">
                                {readyForResultsCount}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <AssignmentOutlinedIcon className="text-blue-600" />
                        </div>

                    </div>

                </div>

                {/* Result Entered */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Result Entered
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-purple-600">
                                {resultEnteredCount}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                            <CheckCircleIcon className="text-purple-600" />
                        </div>

                    </div>

                </div>

                {/* Workflow Status */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Workflow Status
                            </p>

                            <h2 className="mt-1 text-lg font-bold text-green-600">
                                Completed
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                            <VerifiedOutlinedIcon className="text-green-600" />
                        </div>

                    </div>

                </div>

            </div>

            {/* -------------------------------------------------------
                Workflow Info
            ------------------------------------------------------- */}

            <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                            <BiotechOutlinedIcon className="text-green-600" />
                        </div>

                        <div>

                            <p className="text-sm font-semibold text-green-800">
                                Analysis workflow completed
                            </p>

                            <p className="mt-0.5 text-xs text-green-700">
                                Completed tests can now be processed in the Results module.
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-2 self-start rounded-lg bg-white px-3 py-2 sm:self-auto">

                        <CheckCircleIcon
                            className="text-green-600"
                            fontSize="small"
                        />

                        <span className="text-xs font-semibold text-green-700">
                            Ready for Results
                        </span>

                    </div>

                </div>

            </div>

            {/* -------------------------------------------------------
                Filters
            ------------------------------------------------------- */}

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

                    {/* Search */}

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

                    {/* Result Status */}

                    <select
                        value={resultStatusFilter}
                        onChange={(e) => {
                            setResultStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">
                            All Result Status
                        </option>

                        <option value="Ready for Results">
                            Ready for Results
                        </option>

                        <option value="Result Entered">
                            Result Entered
                        </option>

                    </select>

                    {/* Completed Status */}

                    <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3">

                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />

                        <span className="text-sm font-medium text-gray-600">
                            Completed Only
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

            {/* -------------------------------------------------------
                Table
            ------------------------------------------------------- */}

            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-sm font-bold text-gray-800 sm:text-base">
                            Completed Analysis
                        </h2>

                        <p className="text-xs text-gray-500">
                            {filteredTests.length} completed test
                            {filteredTests.length !== 1 ? "s" : ""} found
                        </p>

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <Table
                        columns={columns}
                        data={currentData}
                        maxHeight="380px"
                        renderRow={(test: CompletedTest) => (
                            <>
                                {/* Sample ID */}

                                <td className="px-4 py-3">

                                    <div className="flex items-center gap-2">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                                            <ScienceOutlinedIcon
                                                className="text-green-600"
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

                                {/* Accession */}

                                <td className="px-4 py-3">

                                    <span className="whitespace-nowrap text-xs font-semibold text-gray-700">
                                        {test.accessionNumber}
                                    </span>

                                </td>

                                {/* Patient */}

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

                                {/* Test */}

                                <td className="px-4 py-3">

                                    <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                                        {test.testName}
                                    </p>

                                </td>

                                {/* Sample */}

                                <td className="px-4 py-3">

                                    <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        {test.sampleType}
                                    </span>

                                </td>

                                {/* Completed */}

                                <td className="px-4 py-3">

                                    <div className="min-w-[120px]">

                                        <div className="flex items-center gap-1.5">

                                            <AccessTimeIcon
                                                className="text-gray-400"
                                                fontSize="small"
                                            />

                                            <span className="whitespace-nowrap text-xs font-medium text-gray-700">
                                                {test.completedTime}
                                            </span>

                                        </div>

                                        <p className="ml-6 mt-0.5 whitespace-nowrap text-[11px] text-gray-500">
                                            {test.completedDate}
                                        </p>

                                    </div>

                                </td>

                                {/* Technician */}

                                <td className="px-4 py-3">

                                    <div className="flex items-center gap-2">

                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50">
                                            <PersonIcon
                                                className="text-blue-600"
                                                fontSize="small"
                                            />
                                        </div>

                                        <span className="whitespace-nowrap text-xs text-gray-700">
                                            {test.technician}
                                        </span>

                                    </div>

                                </td>

                                {/* Result Status */}

                                <td className="px-4 py-3">



                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/results/pending-results")
                                        }
                                        title="Go to Pending Results"
                                        className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-600 hover:text-white"
                                    >
                                        Ready for Result
                                    </button>

                                </td>

                                {/* Actions */}

                                <td className="px-4 py-3">

                                    <div className="flex items-center gap-1.5">

                                        {/* View */}

                                        <button
                                            onClick={() =>
                                                handleView(test)
                                            }
                                            title="View Details"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </button>

                                        {/* Print */}

                                        <button
                                            onClick={() =>
                                                handlePrint(test)
                                            }
                                            title="Print Test"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                        >
                                            <PrintOutlinedIcon fontSize="small" />
                                        </button>

                                    </div>

                                </td>
                            </>
                        )}
                    />

                </div>

                {/* Pagination */}

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

                {/* Empty State */}

                {filteredTests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">

                        <CheckCircleIcon className="mb-2 text-4xl text-gray-300" />

                        <p className="text-sm font-semibold text-gray-600">
                            No completed tests found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Tests will appear here after analysis is completed.
                        </p>

                    </div>
                )}

            </div>

            {/* =======================================================
                COMPLETED DETAILS DRAWER
            ======================================================= */}

            {showDetails && selectedTest && (
                <>
                    {/* Backdrop */}

                    <div
                        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
                        onClick={handleCloseDetails}
                    />

                    {/* Drawer */}

                    <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                                    <ScienceOutlinedIcon className="text-green-600" />
                                </div>

                                <div>

                                    <h2 className="text-base font-semibold text-gray-800">
                                        Completed Test Details
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

                            {/* Completed Status */}

                            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                                            <CheckCircleIcon className="text-green-600" />
                                        </div>

                                        <div>

                                            <p className="text-xs font-medium text-green-700">
                                                Analysis Status
                                            </p>

                                            <p className="mt-0.5 text-sm font-semibold text-green-800">
                                                Completed
                                            </p>

                                        </div>

                                    </div>

                                      <span
                                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                            selectedTest.resultStatus ===
                                            "Ready for Results"
                                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                                : "border-purple-200 bg-purple-50 text-purple-700"
                                        }`}
                                    >
                                        {selectedTest.resultStatus}
                                    </span>

                                </div>

                            </div>

                            {/* Patient Information */}

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

                            {/* Sample Information */}

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
                                                Test
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

                                    <p className="text-[11px] text-gray-500">
                                        Analyzer
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {selectedTest.analyzer}
                                    </p>

                                    <p className="mt-4 text-[11px] text-gray-500">
                                        Testing Method
                                    </p>

                                    <span className="mt-1 inline-flex rounded-lg bg-purple-50 px-3 py-1.5 text-[11px] font-semibold text-purple-700">
                                        {selectedTest.method}
                                    </span>

                                </div>

                            </div>

                            {/* Completion Information */}

                            <div className="mb-5">

                                <div className="mb-3 flex items-center gap-2">

                                    <AccessTimeIcon
                                        className="text-orange-500"
                                        fontSize="small"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Completion Information
                                    </h3>

                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>

                                            <p className="text-[11px] text-gray-500">
                                                Completed Date
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.completedDate}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-[11px] text-gray-500">
                                                Completed Time
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                                {selectedTest.completedTime}
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
                                        Technician
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

                            {/* Result Workflow */}

                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                                <div className="flex gap-3">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                        <VerifiedOutlinedIcon
                                            className="text-blue-600"
                                            fontSize="small"
                                        />
                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-blue-800">
                                            Ready for Results
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                            Analysis is completed and this sample is ready for result entry in the Results module.
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
                                    onClick={() => {
                                        setShowDetails(false);
                                        setShowPrintForm(true);
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    <PrintOutlinedIcon fontSize="small" />
                                    Print
                                </button>

                            </div>

                        </div>

                    </div>
                </>
            )}

            {/* =======================================================
                PRINT MODAL
            ======================================================= */}

            {showPrintForm && selectedTest && (
                <>
                    {/* Backdrop */}

                    <div
                        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
                        onClick={handleClosePrintForm}
                    />

                    {/* Print Modal */}

                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">

                        <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                            {/* Modal Header */}

                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                                <div>

                                    <h2 className="text-base font-bold text-gray-800">
                                        Laboratory Test Report
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Print Preview
                                    </p>

                                </div>

                                <button
                                    onClick={handleClosePrintForm}
                                    title="Close"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>

                            </div>

                            {/* Print Content */}

                            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">

                                <div
                                    id="laboratory-print-form"
                                    className="mx-auto w-full max-w-3xl bg-white p-6 shadow-sm sm:p-10"
                                >

                                    {/* Laboratory Header */}

                                    <div className="border-b-2 border-gray-800 pb-5">

                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div>

                                                <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
                                                    Medical Laboratory
                                                </h1>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Diagnostic Laboratory & Clinical Testing
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Phone: +91 98765 43210
                                                </p>

                                            </div>

                                            <div className="text-left sm:text-right">

                                                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">

                                                    <CheckCircleIcon
                                                        className="text-green-600"
                                                        fontSize="small"
                                                    />

                                                    <span className="text-xs font-semibold text-green-700">
                                                        COMPLETED
                                                    </span>

                                                </div>

                                                <p className="mt-2 text-[11px] text-gray-500">
                                                    Report Date:{" "}
                                                    {selectedTest.completedDate}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Patient Details */}

                                    <div className="mt-6">

                                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                                            Patient Information
                                        </h3>

                                        <div className="grid grid-cols-1 border border-gray-300 sm:grid-cols-2">

                                            <div className="border-b border-gray-300 p-3 sm:border-r">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Patient Name
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {selectedTest.patientName}
                                                </p>

                                            </div>

                                            <div className="border-b border-gray-300 p-3">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Patient ID
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {selectedTest.patientId}
                                                </p>

                                            </div>

                                            <div className="p-3 sm:border-r">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Accession Number
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {selectedTest.accessionNumber}
                                                </p>

                                            </div>

                                            <div className="p-3">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Sample ID
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {selectedTest.sampleId}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Test Details */}

                                    <div className="mt-6">

                                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                                            Test Information
                                        </h3>

                                        <div className="overflow-hidden border border-gray-300">

                                            <table className="w-full border-collapse text-left">

                                                <thead>

                                                    <tr className="bg-gray-100">

                                                        <th className="border-b border-gray-300 px-3 py-3 text-[10px] font-bold uppercase text-gray-600">
                                                            Test Name
                                                        </th>

                                                        <th className="border-b border-gray-300 px-3 py-3 text-[10px] font-bold uppercase text-gray-600">
                                                            Sample
                                                        </th>

                                                        <th className="border-b border-gray-300 px-3 py-3 text-[10px] font-bold uppercase text-gray-600">
                                                            Analyzer
                                                        </th>

                                                        <th className="border-b border-gray-300 px-3 py-3 text-[10px] font-bold uppercase text-gray-600">
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    <tr>

                                                        <td className="border-b border-gray-200 px-3 py-4 text-xs font-semibold text-gray-800">
                                                            {selectedTest.testName}
                                                        </td>

                                                        <td className="border-b border-gray-200 px-3 py-4 text-xs text-gray-700">
                                                            {selectedTest.sampleType}
                                                        </td>

                                                        <td className="border-b border-gray-200 px-3 py-4 text-xs text-gray-700">
                                                            {selectedTest.analyzer}
                                                        </td>

                                                        <td className="border-b border-gray-200 px-3 py-4">

                                                            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                                                                Completed
                                                            </span>

                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                    {/* Completion Details */}

                                    <div className="mt-6">

                                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                                            Analysis Details
                                        </h3>

                                        <div className="grid grid-cols-1 border border-gray-300 sm:grid-cols-3">

                                            <div className="border-b border-gray-300 p-3 sm:border-r">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Completed Date
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-gray-800">
                                                    {selectedTest.completedDate}
                                                </p>

                                            </div>

                                            <div className="border-b border-gray-300 p-3 sm:border-r">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Completed Time
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-gray-800">
                                                    {selectedTest.completedTime}
                                                </p>

                                            </div>

                                            <div className="p-3">

                                                <p className="text-[10px] uppercase text-gray-500">
                                                    Technician
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-gray-800">
                                                    {selectedTest.technician}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Result Section */}

                                    <div className="mt-6">

                                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                                            Result
                                        </h3>

                                        <div className="min-h-[100px] border border-gray-300 p-4">

                                            <p className="text-xs font-semibold text-blue-700">
                                                Result Pending
                                            </p>

                                            <p className="mt-2 text-xs text-gray-500">
                                                Result values will be entered through the Results module.
                                            </p>

                                        </div>

                                    </div>

                                    {/* Signature */}

                                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">

                                        <div>

                                            <div className="mb-8 border-b border-gray-400" />

                                            <p className="text-xs font-semibold text-gray-700">
                                                Laboratory Technician
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-500">
                                                {selectedTest.technician}
                                            </p>

                                        </div>

                                        <div>

                                            <div className="mb-8 border-b border-gray-400" />

                                            <p className="text-xs font-semibold text-gray-700">
                                                Authorized Signatory
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-500">
                                                Laboratory Director
                                            </p>

                                        </div>

                                    </div>

                                    {/* Footer */}

                                    <div className="mt-8 border-t border-gray-300 pt-4 text-center">

                                        <p className="text-[10px] text-gray-500">
                                            This is a laboratory-generated report.
                                        </p>

                                        <p className="mt-1 text-[10px] text-gray-400">
                                            Generated from Laboratory Management System
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Print Footer */}

                            <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">

                                <button
                                    onClick={handleClosePrintForm}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <LocalPrintshopOutlinedIcon fontSize="small" />
                                    Print Report
                                </button>

                            </div>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
};

export default Completed;
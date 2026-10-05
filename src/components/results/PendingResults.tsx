import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

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
}

const PendingResults = () => {
    const navigate = useNavigate();

    const [samples] = useState<StoredSample[]>(() => {
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

    const pendingResults = useMemo(() => {
        return samples
            .filter((sample) => sample.status === "Completed")
            .map((sample) => ({
                ...sample,
                priority: sample.priority || "Normal",
            }));
    }, [samples]);

    const filteredResults = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return pendingResults.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.sampleId.toLowerCase().includes(search) ||
                sample.accessionNumber.toLowerCase().includes(search) ||
                sample.patientName.toLowerCase().includes(search) ||
                sample.patientId.toLowerCase().includes(search) ||
                sample.testName.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" ||
                sample.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [pendingResults, searchTerm, priorityFilter]);

    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;

        return filteredResults.slice(
            startIndex,
            startIndex + rowsPerPage
        );
    }, [filteredResults, currentPage, rowsPerPage]);

    const columns = [
        "Sample ID",
        "Accession ID",
        "Patient",
        "Test",
        "Sample",
        "Completed",
        "Priority",
        "Status",
        "Actions",
    ];

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePriorityChange = (value: string) => {
        setPriorityFilter(value);
        setCurrentPage(1);
    };

    const handleEnterResult = (sample: StoredSample) => {
        navigate(`/results/entry/${sample.sampleId}`);
    };

    const formatCompletedDate = (date?: string) => {
        if (!date) {
            return "-";
        }

        return date;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/analysis/completed")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <ScienceOutlinedIcon className="text-blue-600" />
                                <h1 className="text-xl font-semibold text-slate-800">
                                    Pending Results
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter results for completed laboratory tests
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                            <p className="text-xs font-medium text-blue-600">
                                Pending Results
                            </p>

                            <p className="mt-1 text-xl font-bold text-blue-700">
                                {pendingResults.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {/* Summary Cards */}
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Pending
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {pendingResults.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                                <AssignmentOutlinedIcon className="text-blue-600" />
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
                                    {
                                        pendingResults.filter(
                                            (sample) =>
                                                sample.priority === "Urgent" ||
                                                sample.priority === "STAT"
                                        ).length
                                    }
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
                                    Ready for Entry
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {pendingResults.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
                                <EditOutlinedIcon className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:max-w-md">
                            <SearchIcon
                                fontSize="small"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                placeholder="Search sample, patient, accession or test..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <FilterListIcon fontSize="small" />
                                <span>Priority</span>
                            </div>

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
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">
                                    Pending Result Tests
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Tests completed in analysis and waiting for
                                    result entry
                                </p>
                            </div>

                            <span className="text-sm text-slate-500">
                                {filteredResults.length} result
                                {filteredResults.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 sm:p-5">
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                data={currentData}
                                maxHeight="500px"
                                emptyMessage="No pending results found"
                                renderRow={(sample: StoredSample) => (
                                    <>
                                        {/* Sample ID */}
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                    {sample.sampleId}
                                                </p>

                                                {sample.barcode && (
                                                    <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                                                        {sample.barcode}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Accession */}
                                        <td className="px-4 py-4">
                                            <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                {sample.accessionNumber}
                                            </p>
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

                                                {sample.method && (
                                                    <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                                                        {sample.method}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Sample Type */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {sample.sampleType}
                                            </span>
                                        </td>

                                        {/* Completed */}
                                        <td className="px-4 py-4">
                                            <div className="flex min-w-[125px] items-center gap-2">
                                                <AccessTimeIcon
                                                    fontSize="small"
                                                    className="text-slate-400"
                                                />

                                                <div>
                                                    <p className="whitespace-nowrap text-sm text-slate-700">
                                                        {formatCompletedDate(
                                                            sample.completedDate
                                                        )}
                                                    </p>

                                                    <p className="whitespace-nowrap text-xs text-slate-400">
                                                        {sample.completedTime ||
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

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                Pending Result
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEnterResult(sample)
                                                }
                                                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                                Enter Result
                                            </button>
                                        </td>
                                    </>
                                )}
                            />
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredResults.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">

                        <Pagination
                            totalItems={filteredResults.length}
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
    );
};

export default PendingResults;
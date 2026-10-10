import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CloseIcon from "@mui/icons-material/Close";
import Pagination from "../../common components/Pagination";
import Table from "../../common components/Table";

type SampleStatus =
    | "Pending Collection"
    | "Collected"
    | "Received"
    | "Accepted"
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
}

interface AcceptedSample {
    id: string;
    sampleId: string;
    patientId: string;
    patientName: string;
    testId: string;
    testName: string;
    sampleType: string;
    receivedDate: string;
    receivedTime: string;
    receivedBy: string;
    acceptedDate: string;
    acceptedTime: string;
    acceptedBy: string;
    barcode: string;
    status: "Accepted";
}

const SAMPLE_STORAGE_KEY = "lab_samples";

const getStoredArray = <T,>(key: string): T[] => {
    try {
        const stored = localStorage.getItem(key);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Failed to read ${key}:`, error);
        return [];
    }
};

const statusStyles: Record<
    AcceptedSample["status"],
    string
> = {
    Accepted:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const sampleTypeStyles: Record<string, string> = {
    Blood: "bg-red-50 text-red-600",
    "Whole Blood": "bg-red-50 text-red-600",
    Urine: "bg-yellow-50 text-yellow-700",
    Swab: "bg-purple-50 text-purple-700",
    Serum: "bg-orange-50 text-orange-700",
    Plasma: "bg-cyan-50 text-cyan-700",
    Stool: "bg-amber-50 text-amber-700",
};

const AcceptedSamples = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedSample, setSelectedSample] = useState<AcceptedSample | null>(null);
    const [showViewDrawer, setShowViewDrawer] = useState(false);

    const storedSamples = useMemo(
        () =>
            getStoredArray<StoredSample>(
                SAMPLE_STORAGE_KEY
            ),
        []
    );

    const acceptedSamples = useMemo<
        AcceptedSample[]
    >(() => {
        return storedSamples
            .filter(
                (sample) =>
                    sample.status === "Accepted"
            )
            .map((sample) => ({
                id: sample.id,
                sampleId: sample.sampleId,
                patientId: sample.patientId,
                patientName: sample.patientName,
                testId: sample.testId,
                testName: sample.testName,
                sampleType: sample.sampleType,
                receivedDate: sample.receivedDate || "-",
                receivedTime: sample.receivedTime || "-",
                receivedBy: sample.receivedBy || "-",
                acceptedDate: sample.acceptedDate || "-",
                acceptedTime: sample.acceptedTime || "-",
                acceptedBy: sample.acceptedBy || "-",
                barcode: sample.barcode || "-",
                status: "Accepted",
            }));
    }, [storedSamples]);

    const filteredData = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return acceptedSamples.filter(
            (sample) => {
                const matchesSearch =
                    !searchValue ||
                    sample.patientName
                        .toLowerCase()
                        .includes(searchValue) ||
                    sample.patientId
                        .toLowerCase()
                        .includes(searchValue) ||
                    sample.testName
                        .toLowerCase()
                        .includes(searchValue) ||
                    sample.barcode
                        .toLowerCase()
                        .includes(searchValue) ||
                    sample.sampleId
                        .toLowerCase()
                        .includes(searchValue);

                const matchesStatus =
                    statusFilter === "All" ||
                    sample.status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        acceptedSamples,
        search,
        statusFilter,
    ]);

    const currentData =
        filteredData.slice(
            (currentPage - 1) *
                rowsPerPage,
            currentPage * rowsPerPage
        );

    const totalCount =
        acceptedSamples.length;

    const acceptedCount =
        acceptedSamples.filter(
            (sample) =>
                sample.status === "Accepted"
        ).length;

    const handleSearch = (
        value: string
    ) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (
        value: string
    ) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearch("");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    const handleViewSample = (
        sample: AcceptedSample
    ) => {
        setSelectedSample(sample);
        setShowViewDrawer(true);
    };

    const handleCloseDrawer = () => {
        setShowViewDrawer(false);
        setSelectedSample(null);
    };

    const handleSendToAnalysis = (
        sample: AcceptedSample
    ) => {
        handleCloseDrawer();

        navigate(
            `/analysis/pending?sampleId=${encodeURIComponent(
                sample.sampleId
            )}`
        );
    };

    const columns = [
        "Sample ID",
        "Patient & ID",
        "Test",
        "Sample Type",
        "Received",
        "Accepted",
        "Accepted By",
        "Status",
        "Actions",
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">

            <div className="mb-6 flex items-center gap-3">

                <button
                    onClick={() =>
                        navigate(-1)
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    <ArrowBackIcon fontSize="small" />
                </button>

                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                        Accepted Samples
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review and manage samples
                        accepted for laboratory
                        analysis
                    </p>
                </div>

            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Samples
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                {totalCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Accepted samples
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ScienceOutlinedIcon />
                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Accepted
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                                {acceptedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Successfully accepted
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircleOutlineIcon />
                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Ready for Analysis
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-purple-600">
                                {acceptedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Waiting for analysis
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <PlayCircleIcon />
                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Next Step
                            </p>

                            <h2 className="mt-2 text-lg font-bold text-blue-600">
                                Analysis
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Begin laboratory testing
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <PlayCircleIcon />
                        </div>

                    </div>

                </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-4 sm:p-5">

                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                        <div className="relative w-full xl:max-w-md">

                            <SearchIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    handleSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search patient, test or barcode..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">

                            <div className="relative w-full sm:w-48">

                                <FilterListIcon
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    fontSize="small"
                                />

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(e) =>
                                        handleStatusChange(
                                            e.target.value
                                        )
                                    }
                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Accepted">
                                        Accepted
                                    </option>
                                </select>

                            </div>

                            <button
                                onClick={
                                    handleReset
                                }
                                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Reset
                            </button>

                        </div>

                    </div>

                </div>

                <div className="p-3 sm:p-5">

                    <div className="overflow-x-auto">

                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="480px"
                            renderRow={(
                                sample: AcceptedSample
                            ) => (
                                <>

                                    <td className="px-4 py-4">

                                        <div>

                                            <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                {
                                                    sample.sampleId
                                                }
                                            </p>

                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="flex min-w-[180px] items-center gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                <PersonIcon fontSize="small" />
                                            </div>

                                            <div>

                                                <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                                                    {
                                                        sample.patientName
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {
                                                        sample.patientId
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <p className="min-w-[170px] text-sm font-medium text-slate-700">
                                            {
                                                sample.testName
                                            }
                                        </p>

                                    </td>

                                    <td className="px-4 py-4">

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                                sampleTypeStyles[
                                                    sample.sampleType
                                                ] ||
                                                "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {
                                                sample.sampleType
                                            }
                                        </span>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="min-w-[145px]">

                                            {sample.receivedDate !==
                                            "-" ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <CalendarTodayOutlinedIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                            className="text-slate-400"
                                                        />

                                                        {
                                                            sample.receivedDate
                                                        }

                                                    </div>

                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                                        <AccessTimeIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                        />

                                                        {
                                                            sample.receivedTime
                                                        }

                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    -
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="min-w-[145px]">

                                            {sample.acceptedDate !==
                                            "-" ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <CalendarTodayOutlinedIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                            className="text-slate-400"
                                                        />

                                                        {
                                                            sample.acceptedDate
                                                        }

                                                    </div>

                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                                        <AccessTimeIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                        />

                                                        {
                                                            sample.acceptedTime
                                                        }

                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    -
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <p className="whitespace-nowrap text-sm text-slate-600">
                                            {
                                                sample.acceptedBy
                                            }
                                        </p>

                                    </td>

                                    <td className="px-4 py-4">

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                statusStyles[
                                                    sample.status
                                                ]
                                            }`}
                                        >
                                            {
                                                sample.status
                                            }
                                        </span>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="flex items-center gap-2">

                                            <button
                                                title="View Sample"
                                                onClick={() =>
                                                    handleViewSample(
                                                        sample
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </button>

                                            <button
                                                title="Sample Details"
                                                onClick={() =>
                                                    handleViewSample(
                                                        sample
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                                            >
                                                <QrCode2Icon fontSize="small" />
                                            </button>

                                            <button
                                                title="Send to Analysis"
                                                onClick={() =>
                                                    handleSendToAnalysis(
                                                        sample
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                            >
                                                <PlayCircleIcon fontSize="small" />
                                            </button>

                                        </div>

                                    </td>

                                </>
                            )}
                        />

                    </div>

                    {currentData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">

                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <ScienceOutlinedIcon />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700">
                                No accepted samples found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Samples accepted from
                                Received Samples will
                                appear here.
                            </p>

                        </div>
                    )}

                    {filteredData.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <Pagination
                                totalItems={ filteredData.length}
                                rowsPerPage={ rowsPerPage }
                                setRowsPerPage={setRowsPerPage }
                                currentPage={ currentPage }
                                setCurrentPage={ setCurrentPage }
                            />

                        </div>
                    )}

                </div>

            </div>

            {showViewDrawer &&
                selectedSample && (
                    <div className="fixed inset-0 z-50">

                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={
                                handleCloseDrawer
                            }
                        />

                        <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                                <div>

                                    <h2 className="text-lg font-bold text-slate-800">
                                        Sample Details
                                    </h2>

                                </div>

                                <button
                                    onClick={
                                        handleCloseDrawer
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>

                            </div>

                            <div className="flex-1 overflow-y-auto p-5">

                                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-medium text-emerald-700">
                                                Sample Status
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-emerald-800">
                                                Accepted
                                            </p>

                                        </div>

                                        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                            Accepted
                                        </span>

                                    </div>

                                </div>

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Patient
                                    </p>

                                    <div className="rounded-xl border border-slate-200 p-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                <PersonIcon />
                                            </div>

                                            <div>

                                                <p className="text-sm font-semibold text-slate-800">
                                                    {
                                                        selectedSample.patientName
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {
                                                        selectedSample.patientId
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Sample Information
                                    </p>

                                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Sample ID
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.sampleId
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Test
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.testName
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Sample Type
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.sampleType
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Test ID
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.testId
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Barcode
                                            </span>

                                            <span className="text-right text-sm font-semibold text-slate-700">
                                                {
                                                    selectedSample.barcode
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Laboratory Receipt
                                    </p>

                                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Received Date
                                            </span>

                                            <span className="text-right text-sm text-slate-700">
                                                {
                                                    selectedSample.receivedDate
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Received Time
                                            </span>

                                            <span className="text-right text-sm text-slate-700">
                                                {
                                                    selectedSample.receivedTime
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Received By
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.receivedBy
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Acceptance
                                    </p>

                                    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-emerald-700">
                                                Accepted Date
                                            </span>

                                            <span className="text-right text-sm font-medium text-emerald-800">
                                                {
                                                    selectedSample.acceptedDate
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-emerald-700">
                                                Accepted Time
                                            </span>

                                            <span className="text-right text-sm font-medium text-emerald-800">
                                                {
                                                    selectedSample.acceptedTime
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-emerald-700">
                                                Accepted By
                                            </span>

                                            <span className="text-right text-sm font-semibold text-emerald-800">
                                                {
                                                    selectedSample.acceptedBy
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div>

                                    <button
                                        onClick={() =>
                                            handleSendToAnalysis(
                                                selectedSample
                                            )
                                        }
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        <PlayCircleIcon fontSize="small" />
                                        Send to Analysis
                                    </button>

                                    <p className="mt-2 text-center text-xs text-slate-400">
                                        This sample will be
                                        available under
                                        Analysis → Pending
                                        Tests.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default AcceptedSamples;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";

import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

/* =========================
   TYPES
========================= */

type SampleStatus =
    | "Pending Collection"
    | "Collected"
    | "Received"
    | "Accepted"
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
}

interface ReceivedSample {
    id: string;
    sampleId: string;
    accessionNumber: string;

    patientId: string;
    patientName: string;

    testName: string;
    sampleType: string;

    collectedDate: string;
    collectedTime: string;

    receivedDate: string;
    receivedTime: string;

    collector: string;
    receivedBy: string;

    barcode: string;

    status: "Received" | "Awaiting Receipt";
}

/* =========================
   STORAGE
========================= */

const SAMPLE_STORAGE_KEY = "lab_samples";

/* =========================
   HELPERS
========================= */

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

const saveStoredArray = <T,>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
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

/* =========================
   STATUS STYLES
========================= */

const statusStyles: Record<
    ReceivedSample["status"],
    string
> = {
    Received:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "Awaiting Receipt":
        "bg-amber-50 text-amber-700 border border-amber-200",
};

/* =========================
   SAMPLE TYPE STYLES
========================= */

const sampleTypeStyles: Record<string, string> = {
    Blood: "bg-red-50 text-red-600",
    "Whole Blood": "bg-red-50 text-red-600",
    Urine: "bg-yellow-50 text-yellow-700",
    Swab: "bg-purple-50 text-purple-700",
    Serum: "bg-orange-50 text-orange-700",
    Plasma: "bg-cyan-50 text-cyan-700",
    Stool: "bg-amber-50 text-amber-700",
};

/* =========================
   COMPONENT
========================= */

const ReceivedSamples = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedSample, setSelectedSample] =
        useState<ReceivedSample | null>(null);

    const [showViewDrawer, setShowViewDrawer] =
        useState(false);

    const [receivedBy, setReceivedBy] =
        useState("Lab Technician");

    const [acceptedBy, setAcceptedBy] =
        useState("Lab Technician");

    const [rejectedBy, setRejectedBy] =
        useState("Lab Technician");

    const [rejectionReason, setRejectionReason] =
        useState("");

    const [showRejectForm, setShowRejectForm] =
        useState(false);

    /* =========================
       LOAD ACTUAL SAMPLES
    ========================= */

    const storedSamples = useMemo(
        () =>
            getStoredArray<StoredSample>(
                SAMPLE_STORAGE_KEY
            ),
        []
    );

    /* =========================
       CONVERT COLLECTED / RECEIVED
       SAMPLES INTO TABLE DATA

       Collected:
       Awaiting Receipt

       Received:
       Ready for Acceptance
    ========================= */

    const receivedSamples = useMemo<ReceivedSample[]>(() => {
        return storedSamples
            .filter(
                (sample) =>
                    sample.status === "Collected" ||
                    sample.status === "Received"
            )
            .map((sample) => ({
                id: sample.id,

                sampleId: sample.sampleId,

                accessionNumber:
                    sample.accessionNumber,

                patientId: sample.patientId,

                patientName: sample.patientName,

                testName: sample.testName,

                sampleType: sample.sampleType,

                collectedDate:
                    sample.collectionDate || "-",

                collectedTime:
                    sample.collectionTime || "-",

                receivedDate:
                    sample.receivedDate || "-",

                receivedTime:
                    sample.receivedTime || "-",

                collector:
                    sample.collector || "-",

                receivedBy:
                    sample.receivedBy || "-",

                barcode:
                    sample.barcode || "-",

                status:
                    sample.status === "Received"
                        ? "Received"
                        : "Awaiting Receipt",
            }));
    }, [storedSamples]);

    /* =========================
       FILTER
    ========================= */

    const filteredData = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return receivedSamples.filter((sample) => {
            const matchesSearch =
                !searchValue ||
                sample.patientName
                    .toLowerCase()
                    .includes(searchValue) ||
                sample.patientId
                    .toLowerCase()
                    .includes(searchValue) ||
                sample.accessionNumber
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
                sample.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        receivedSamples,
        search,
        statusFilter,
    ]);

    /* =========================
       PAGINATION
    ========================= */

    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    /* =========================
       COUNTS
    ========================= */

    const totalCount =
        receivedSamples.length;

    const receivedCount =
        receivedSamples.filter(
            (sample) =>
                sample.status === "Received"
        ).length;

    const awaitingCount =
        receivedSamples.filter(
            (sample) =>
                sample.status ===
                "Awaiting Receipt"
        ).length;

    /* =========================
       SEARCH
    ========================= */

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    /* =========================
       STATUS FILTER
    ========================= */

    const handleStatusChange = (
        value: string
    ) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    /* =========================
       RESET
    ========================= */

    const handleReset = () => {
        setSearch("");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    /* =========================
       VIEW SAMPLE
    ========================= */

    const handleViewSample = (
        sample: ReceivedSample
    ) => {
        setSelectedSample(sample);

        setReceivedBy(
            sample.receivedBy !== "-"
                ? sample.receivedBy
                : "Lab Technician"
        );

        setAcceptedBy("Lab Technician");

        setRejectedBy("Lab Technician");

        setRejectionReason("");

        setShowRejectForm(false);

        setShowViewDrawer(true);
    };

    /* =========================
       CLOSE DRAWER
    ========================= */

    const handleCloseDrawer = () => {
        setShowViewDrawer(false);
        setSelectedSample(null);
        setShowRejectForm(false);
        setRejectionReason("");
    };

    /* =========================
       RECEIVE SAMPLE
    ========================= */

    const handleReceiveSample = (
        sample: ReceivedSample
    ) => {
        const stored =
            getStoredArray<StoredSample>(
                SAMPLE_STORAGE_KEY
            );

        const updated =
            stored.map((item) => {
                if (
                    item.id !== sample.id
                ) {
                    return item;
                }

                return {
                    ...item,

                    status: "Received" as SampleStatus,

                    receivedDate:
                        getToday(),

                    receivedTime:
                        getCurrentTime(),

                    receivedBy:
                        receivedBy.trim() ||
                        "Lab Technician",
                };
            });

        saveStoredArray(
            SAMPLE_STORAGE_KEY,
            updated
        );

        handleCloseDrawer();

       window.location.reload();
    };

    /* =========================
       ACCEPT SAMPLE
    ========================= */

    const handleAcceptSample = (
        sample: ReceivedSample
    ) => {
        const stored =
            getStoredArray<StoredSample>(
                SAMPLE_STORAGE_KEY
            );

        const updated =
            stored.map((item) => {
                if (
                    item.id !== sample.id
                ) {
                    return item;
                }

                return {
                    ...item,

                    status: "Accepted" as SampleStatus,

                    acceptedDate:
                        getToday(),

                    acceptedTime:
                        getCurrentTime(),

                    acceptedBy:
                        acceptedBy.trim() ||
                        "Lab Technician",
                };
            });

        saveStoredArray(
            SAMPLE_STORAGE_KEY,
            updated
        );

        handleCloseDrawer();

        navigate("/accession/accepted-samples");
    };

    /* =========================
       REJECT SAMPLE
    ========================= */

    const handleRejectSample = (
        sample: ReceivedSample
    ) => {
        const reason =
            rejectionReason.trim();

        if (!reason) {
            return;
        }

        const stored =
            getStoredArray<StoredSample>(
                SAMPLE_STORAGE_KEY
            );

        const updated = stored.map((item) => {
            if (item.id !== sample.id) {
                return item;
            }

            return {
                ...item,
                status: "Rejected" as SampleStatus,

                rejectedDate: getToday(),
                rejectedTime: getCurrentTime(),

                rejectedBy:
                    rejectedBy.trim() ||
                    "Lab Technician",

                rejectionReason: reason,
            };
        });

        saveStoredArray(
            SAMPLE_STORAGE_KEY,
            updated
        );

        /*
         * Clear drawer/form state first.
         */
        setShowRejectForm(false);
        setRejectionReason("");
        setSelectedSample(null);
        setShowViewDrawer(false);

        /*
         * Force the rejected page to mount again
         * and read the latest localStorage data.
         */
        window.location.href =
            "/accession/rejected-samples";
    };

    /* =========================
       TRACK SAMPLE
    ========================= */

    const handleTrackSample = (
        sample: ReceivedSample
    ) => {
        navigate(
            `/accession/sample-tracking?sampleId=${encodeURIComponent(
                sample.sampleId
            )}`
        );
    };

    /* =========================
       TABLE COLUMNS
    ========================= */

    const columns = [
        "Accession",
        "Patient",
        "Test",
        "Sample",
        "Collected",
        "Received",
        "Received By",
        "Status",
        "Actions",
    ];

    /* =========================
       UI
    ========================= */

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">

            {/* ================= HEADER ================= */}

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
                        Received Samples
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage samples received by
                        the laboratory for processing
                    </p>
                </div>

            </div>

            {/* ================= SUMMARY CARDS ================= */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL */}

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
                                Collected samples
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ScienceOutlinedIcon />
                        </div>

                    </div>
                </div>

                {/* RECEIVED */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Received
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                                {receivedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Ready for acceptance
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircleIcon />
                        </div>

                    </div>
                </div>

                {/* AWAITING */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Awaiting Receipt
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-amber-600">
                                {awaitingCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Yet to reach lab
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <AccessTimeIcon />
                        </div>

                    </div>
                </div>

                {/* READY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Ready for Acceptance
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-purple-600">
                                {receivedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Samples awaiting review
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <LocalShippingOutlinedIcon />
                        </div>

                    </div>
                </div>

            </div>

            {/* ================= MAIN CARD ================= */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TOOLBAR */}

                <div className="border-b border-slate-100 p-4 sm:p-5">

                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                        {/* SEARCH */}

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
                                placeholder="Search patient, accession, test or barcode..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        {/* FILTER */}

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

                                    <option value="Received">
                                        Received
                                    </option>

                                    <option value="Awaiting Receipt">
                                        Awaiting Receipt
                                    </option>
                                </select>

                            </div>

                            <button
                                onClick={handleReset}
                                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Reset
                            </button>

                        </div>

                    </div>

                </div>

                {/* ================= TABLE ================= */}

                <div className="p-3 sm:p-5">

                    <div className="overflow-x-auto">

                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="500px"
                            renderRow={(
                                sample: ReceivedSample
                            ) => (
                                <>

                                    {/* ACCESSION */}

                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                {
                                                    sample.accessionNumber
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    sample.sampleId
                                                }
                                            </p>
                                        </div>
                                    </td>

                                    {/* PATIENT */}

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

                                    {/* TEST */}

                                    <td className="px-4 py-4">
                                        <p className="min-w-[170px] text-sm font-medium text-slate-700">
                                            {
                                                sample.testName
                                            }
                                        </p>
                                    </td>

                                    {/* SAMPLE TYPE */}

                                    <td className="px-4 py-4">

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${sampleTypeStyles[
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

                                    {/* COLLECTED */}

                                    <td className="px-4 py-4">

                                        <div className="min-w-[145px]">

                                            <div className="flex items-center gap-2 text-sm text-slate-600">

                                                <CalendarTodayOutlinedIcon
                                                    sx={{
                                                        fontSize: 15,
                                                    }}
                                                    className="text-slate-400"
                                                />

                                                {
                                                    sample.collectedDate
                                                }

                                            </div>

                                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                                <AccessTimeIcon
                                                    sx={{
                                                        fontSize: 15,
                                                    }}
                                                />

                                                {
                                                    sample.collectedTime
                                                }

                                            </div>

                                        </div>

                                    </td>

                                    {/* RECEIVED */}

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
                                                    Awaiting receipt
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                    {/* RECEIVED BY */}

                                    <td className="px-4 py-4">

                                        <p className="whitespace-nowrap text-sm text-slate-600">
                                            {
                                                sample.receivedBy
                                            }
                                        </p>

                                    </td>

                                    {/* STATUS */}

                                    <td className="px-4 py-4">

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[
                                                sample.status
                                                ]
                                                }`}
                                        >
                                            {
                                                sample.status
                                            }
                                        </span>

                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-4 py-4">

                                        <div className="flex items-center gap-2">

                                            {/* VIEW */}

                                            <button
                                                title="View Sample"
                                                onClick={() =>
                                                    handleViewSample(
                                                        sample
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </button>

                                            {/* TRACK */}

                                            <button
                                                title="Track Sample"
                                                onClick={() =>
                                                    handleTrackSample(
                                                        sample
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                                            >
                                                <LocalShippingOutlinedIcon fontSize="small" />
                                            </button>

                                            {/* RECEIVE */}

                                            {sample.status ===
                                                "Awaiting Receipt" && (
                                                    <button
                                                        title="Receive Sample"
                                                        onClick={() =>
                                                            handleViewSample(
                                                                sample
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </button>
                                                )}

                                        </div>

                                    </td>

                                </>
                            )}
                        />

                    </div>

                    {/* EMPTY STATE */}

                    {currentData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">

                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <ScienceOutlinedIcon />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700">
                                No received samples found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Samples collected from Sample
                                Collection will appear here.
                            </p>

                        </div>
                    )}

                    {/* PAGINATION */}

                    {filteredData.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">

                            <Pagination
                                totalItems={
                                    filteredData.length
                                }
                                rowsPerPage={
                                    rowsPerPage
                                }
                                setRowsPerPage={
                                    setRowsPerPage
                                }
                                currentPage={
                                    currentPage
                                }
                                setCurrentPage={
                                    setCurrentPage
                                }
                            />

                        </div>
                    )}

                </div>

            </div>

            {/* =========================
                VIEW DRAWER
            ========================= */}

            {showViewDrawer &&
                selectedSample && (
                    <div className="fixed inset-0 z-50">

                        {/* BACKDROP */}

                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={
                                handleCloseDrawer
                            }
                        />

                        {/* DRAWER */}

                        <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

                            {/* DRAWER HEADER */}

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Sample Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {
                                            selectedSample.sampleId
                                        }
                                    </p>
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

                            {/* DRAWER BODY */}

                            <div className="flex-1 overflow-y-auto p-5">

                                {/* STATUS */}

                                <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                Sample Status
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {
                                                    selectedSample.status
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[
                                                selectedSample.status
                                                ]
                                                }`}
                                        >
                                            {
                                                selectedSample.status
                                            }
                                        </span>

                                    </div>

                                </div>

                                {/* PATIENT */}

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

                                {/* SAMPLE INFORMATION */}

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Sample Information
                                    </p>

                                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Accession
                                            </span>

                                            <span className="text-right text-sm font-semibold text-blue-600">
                                                {
                                                    selectedSample.accessionNumber
                                                }
                                            </span>
                                        </div>

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

                                {/* COLLECTION */}

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Collection
                                    </p>

                                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Date
                                            </span>

                                            <span className="text-right text-sm text-slate-700">
                                                {
                                                    selectedSample.collectedDate
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Time
                                            </span>

                                            <span className="text-right text-sm text-slate-700">
                                                {
                                                    selectedSample.collectedTime
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Collector
                                            </span>

                                            <span className="text-right text-sm text-slate-700">
                                                {
                                                    selectedSample.collector
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {/* RECEIVING */}

                                <div className="mb-5">

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Laboratory Receipt
                                    </p>

                                    <div className="space-y-4 rounded-xl border border-slate-200 p-4">

                                        {selectedSample.status ===
                                            "Received" ? (
                                            <>
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
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                                        Received By
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            receivedBy
                                                        }
                                                        onChange={(e) =>
                                                            setReceivedBy(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter staff name"
                                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleReceiveSample(
                                                            selectedSample
                                                        )
                                                    }
                                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                    Receive Sample
                                                </button>
                                            </>
                                        )}

                                    </div>

                                </div>

                                {/* =========================
                                    ACCEPT / REJECT
                                ========================= */}

                                {selectedSample.status ===
                                    "Received" && (
                                        <div className="mb-5">

                                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Sample Acceptance
                                            </p>

                                            <div className="rounded-xl border border-slate-200 p-4">

                                                {!showRejectForm ? (
                                                    <div className="space-y-3">

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                Accepted By
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    acceptedBy
                                                                }
                                                                onChange={(e) =>
                                                                    setAcceptedBy(
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter staff name"
                                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                handleAcceptSample(
                                                                    selectedSample
                                                                )
                                                            }
                                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                        >
                                                            <DoneAllOutlinedIcon fontSize="small" />
                                                            Accept Sample
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setShowRejectForm(
                                                                    true
                                                                )
                                                            }
                                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                                        >
                                                            <CancelOutlinedIcon fontSize="small" />
                                                            Reject Sample
                                                        </button>

                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                Rejected By
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    rejectedBy
                                                                }
                                                                onChange={(e) =>
                                                                    setRejectedBy(
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter staff name"
                                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                Rejection Reason
                                                            </label>

                                                            <textarea
                                                                value={
                                                                    rejectionReason
                                                                }
                                                                onChange={(e) =>
                                                                    setRejectionReason(
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter reason for rejecting this sample..."
                                                                rows={4}
                                                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                handleRejectSample(
                                                                    selectedSample
                                                                )
                                                            }
                                                            disabled={
                                                                !rejectionReason.trim()
                                                            }
                                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <CancelOutlinedIcon fontSize="small" />
                                                            Confirm Rejection
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setShowRejectForm(
                                                                    false
                                                                )
                                                            }
                                                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default ReceivedSamples;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
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
}

interface TrackedSample {
    id: string;
    sampleId: string;
    accessionNumber: string;

    patientId: string;
    patientName: string;

    testName: string;
    sampleType: string;

    barcode: string;

    currentStatus:
        | "Collected"
        | "Received"
        | "Accepted"
        | "Processing"
        | "Completed"
        | "Rejected";

    currentLocation: string;

    collectedAt: string;
    receivedAt: string;
    acceptedAt: string;
    processingAt: string;
    completedAt: string;
    rejectedAt: string;

    lastUpdated: string;

    collector: string;
    receivedBy: string;
    acceptedBy: string;
    processingBy: string;
    completedBy: string;
    rejectedBy: string;
    rejectionReason: string;
}

const SAMPLE_STORAGE_KEY = "lab_samples";

const columns = [
    "Accession",
    "Patient",
    "Test",
    "Sample",
    "Current Stage",
    "Current Location",
    "Last Updated",
    "Progress",
    "Actions",
];

const stages = [
    "Collected",
    "Received",
    "Accepted",
    "Processing",
    "Completed",
];

const getStoredSamples = (): StoredSample[] => {
    try {
        const stored = localStorage.getItem(
            SAMPLE_STORAGE_KEY
        );

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(
            "Failed to load lab samples:",
            error
        );

        return [];
    }
};

const formatDateTime = (
    date?: string,
    time?: string
) => {
    if (!date && !time) {
        return "-";
    }

    if (date && time) {
        return `${date}, ${time}`;
    }

    return date || time || "-";
};

const getStageIndex = (
    status: TrackedSample["currentStatus"]
) => {
    if (status === "Rejected") {
        return -1;
    }

    return stages.indexOf(status);
};

const getStatusClasses = (
    status: TrackedSample["currentStatus"]
) => {
    switch (status) {
        case "Collected":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "Received":
            return "bg-indigo-50 text-indigo-700 border-indigo-200";

        case "Accepted":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "Processing":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "Completed":
            return "bg-green-50 text-green-700 border-green-200";

        case "Rejected":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

const getProgressWidth = (
    status: TrackedSample["currentStatus"]
) => {
    if (status === "Rejected") {
        return "0%";
    }

    const index = getStageIndex(status);

    if (index === 0) return "0%";
    if (index === 1) return "25%";
    if (index === 2) return "50%";
    if (index === 3) return "75%";
    if (index === 4) return "100%";

    return "0%";
};

const getCurrentLocation = (
    sample: StoredSample
) => {
    switch (sample.status) {
        case "Pending Collection":
            return "Waiting for Collection";

        case "Collected":
            return "Collection Room";

        case "Received":
            return "Accession Desk";

        case "Accepted":
            return "Sample Storage";

        case "Processing":
            return "Laboratory / Analysis";

        case "Completed":
            return "Report Section";

        case "Rejected":
            return "Rejected Sample Area";

        default:
            return "-";
    }
};

const getLastUpdated = (
    sample: StoredSample
) => {
    switch (sample.status) {
        case "Collected":
            return sample.collectionTime || "-";

        case "Received":
            return sample.receivedTime ||
                sample.collectionTime ||
                "-";

        case "Accepted":
            return sample.acceptedTime ||
                sample.receivedTime ||
                "-";

        case "Processing":
            return sample.processingTime ||
                sample.acceptedTime ||
                "-";

        case "Completed":
            return sample.completedTime ||
                sample.processingTime ||
                "-";

        case "Rejected":
            return sample.rejectedTime ||
                sample.receivedTime ||
                "-";

        default:
            return "-";
    }
};

const SampleTracking = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [locationFilter, setLocationFilter] =
        useState("All");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [rowsPerPage, setRowsPerPage] =
        useState(5);

    const [selectedSample, setSelectedSample] =
        useState<TrackedSample | null>(null);

    const [showTrackingDrawer, setShowTrackingDrawer] =
        useState(false);

    const [showBarcode, setShowBarcode] =
        useState(false);

    /*
     * Read the latest samples from localStorage.
     *
     * Since this page is normally opened after another
     * accession/analysis action, reading here ensures the
     * current stored data is used.
     */
    const storedSamples = useMemo(
        () => getStoredSamples(),
        []
    );

    /*
     * Convert StoredSample -> TrackedSample
     */
    const trackedSamples = useMemo<
        TrackedSample[]
    >(() => {
        return storedSamples
            .filter(
                (sample) =>
                    sample.status !==
                    "Pending Collection"
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

                barcode: sample.barcode,

                currentStatus:
                    sample.status ===
                        "Pending Collection"
                        ? "Collected"
                        : sample.status,

                currentLocation:
                    getCurrentLocation(sample),

                collectedAt: formatDateTime(
                    sample.collectionDate,
                    sample.collectionTime
                ),

                receivedAt: formatDateTime(
                    sample.receivedDate,
                    sample.receivedTime
                ),

                acceptedAt: formatDateTime(
                    sample.acceptedDate,
                    sample.acceptedTime
                ),

                processingAt: formatDateTime(
                    sample.processingDate,
                    sample.processingTime
                ),

                completedAt: formatDateTime(
                    sample.completedDate,
                    sample.completedTime
                ),

                rejectedAt: formatDateTime(
                    sample.rejectedDate,
                    sample.rejectedTime
                ),

                lastUpdated:
                    getLastUpdated(sample),

                collector:
                    sample.collector || "-",

                receivedBy:
                    sample.receivedBy || "-",

                acceptedBy:
                    sample.acceptedBy || "-",

                processingBy:
                    sample.processingBy || "-",

                completedBy:
                    sample.completedBy || "-",

                rejectedBy:
                    sample.rejectedBy || "-",

                rejectionReason:
                    sample.rejectionReason || "-",
            }));
    }, [storedSamples]);

    /*
     * Filters
     */
    const filteredSamples = useMemo(() => {
        return trackedSamples.filter((sample) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                sample.accessionNumber
                    .toLowerCase()
                    .includes(search) ||
                sample.sampleId
                    .toLowerCase()
                    .includes(search) ||
                sample.patientId
                    .toLowerCase()
                    .includes(search) ||
                sample.patientName
                    .toLowerCase()
                    .includes(search) ||
                sample.testName
                    .toLowerCase()
                    .includes(search) ||
                sample.barcode
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                sample.currentStatus ===
                    statusFilter;

            const matchesLocation =
                locationFilter === "All" ||
                sample.currentLocation ===
                    locationFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesLocation
            );
        });
    }, [
        trackedSamples,
        searchTerm,
        statusFilter,
        locationFilter,
    ]);

    /*
     * Pagination
     */
    const currentData =
        filteredSamples.slice(
            (currentPage - 1) *
                rowsPerPage,
            currentPage *
                rowsPerPage
        );

    /*
     * Summary
     */
    const totalSamples =
        trackedSamples.length;

    const completedCount =
        trackedSamples.filter(
            (sample) =>
                sample.currentStatus ===
                "Completed"
        ).length;

    const rejectedCount =
        trackedSamples.filter(
            (sample) =>
                sample.currentStatus ===
                "Rejected"
        ).length;

    const inProgressCount =
        trackedSamples.filter(
            (sample) =>
                sample.currentStatus !==
                    "Completed" &&
                sample.currentStatus !==
                    "Rejected"
        ).length;

    /*
     * Reset
     */
    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setLocationFilter("All");
        setCurrentPage(1);
    };

    /*
     * Open tracking drawer
     */
    const handleViewTracking = (
        sample: TrackedSample
    ) => {
        setSelectedSample(sample);
        setShowTrackingDrawer(true);
    };

    /*
     * Open barcode
     */
    const handleViewBarcode = (
        sample: TrackedSample
    ) => {
        setSelectedSample(sample);
        setShowBarcode(true);
    };

    /*
     * Timeline
     */
    const renderTimeline = (
        sample: TrackedSample
    ) => {
        if (
            sample.currentStatus ===
            "Rejected"
        ) {
            return (
                <div className="flex min-w-[180px] items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <CancelOutlinedIcon
                            className="text-red-600"
                            fontSize="small"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-red-700">
                            Rejected
                        </p>

                        <p className="text-[11px] text-gray-500">
                            Workflow stopped
                        </p>
                    </div>
                </div>
            );
        }

        const currentIndex =
            getStageIndex(
                sample.currentStatus
            );

        return (
            <div className="min-w-[230px]">
                <div className="relative flex items-center justify-between">
                    {/* Background line */}
                    <div className="absolute left-2 right-2 top-2 h-0.5 bg-gray-200" />

                    {/* Progress line */}
                    <div
                        className="absolute left-2 top-2 h-0.5 bg-emerald-500 transition-all"
                        style={{
                            width:
                                currentIndex <=
                                0
                                    ? "0%"
                                    : `calc(${currentIndex *
                                          25}% - 2px)`,
                        }}
                    />

                    {stages.map(
                        (
                            stage,
                            index
                        ) => {
                            const completed =
                                index <=
                                currentIndex;

                            return (
                                <div
                                    key={
                                        stage
                                    }
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div
                                        className={`h-4 w-4 rounded-full border-2 ${
                                            completed
                                                ? "border-emerald-500 bg-emerald-500"
                                                : "border-gray-300 bg-white"
                                        }`}
                                    />

                                    <span
                                        className={`mt-1 whitespace-nowrap text-[9px] ${
                                            completed
                                                ? "font-medium text-emerald-700"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {
                                            stage
                                        }
                                    </span>
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 lg:px-6">

            {/* Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50"
                    >
                        <ArrowBackIcon fontSize="small" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                            Sample Tracking
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                            Track sample movement from collection to final report
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                    <TimelineIcon
                        className="text-blue-600"
                        fontSize="small"
                    />

                    <span className="text-xs font-semibold text-blue-700">
                        Real-time Sample Journey
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
                                Total Samples
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-gray-800">
                                {
                                    totalSamples
                                }
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <ScienceOutlinedIcon className="text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                In Progress
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-amber-600">
                                {
                                    inProgressCount
                                }
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                            <AccessTimeIcon className="text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Completed
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-green-600">
                                {
                                    completedCount
                                }
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                            <CheckCircleIcon className="text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Rejected */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Rejected
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-red-600">
                                {
                                    rejectedCount
                                }
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                            <CancelOutlinedIcon className="text-red-600" />
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

                    {/* Search */}
                    <div className="relative xl:col-span-2">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            fontSize="small"
                        />

                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(
                                e
                            ) => {
                                setSearchTerm(
                                    e
                                        .target
                                        .value
                                );

                                setCurrentPage(
                                    1
                                );
                            }}
                            placeholder="Search accession, patient, test or barcode..."
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            e
                        ) => {
                            setStatusFilter(
                                e
                                    .target
                                    .value
                            );

                            setCurrentPage(
                                1
                            );
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Collected">
                            Collected
                        </option>

                        <option value="Received">
                            Received
                        </option>

                        <option value="Accepted">
                            Accepted
                        </option>

                        <option value="Processing">
                            Processing
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>
                    </select>

                    {/* Location */}
                    <select
                        value={
                            locationFilter
                        }
                        onChange={(
                            e
                        ) => {
                            setLocationFilter(
                                e
                                    .target
                                    .value
                            );

                            setCurrentPage(
                                1
                            );
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="All">
                            All Locations
                        </option>

                        <option value="Collection Room">
                            Collection Room
                        </option>

                        <option value="Accession Desk">
                            Accession Desk
                        </option>

                        <option value="Sample Storage">
                            Sample Storage
                        </option>

                        <option value="Laboratory / Analysis">
                            Laboratory / Analysis
                        </option>

                        <option value="Report Section">
                            Report Section
                        </option>

                        <option value="Rejected Sample Area">
                            Rejected Sample Area
                        </option>
                    </select>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={
                            handleReset
                        }
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
                            Sample Journey
                        </h2>

                        <p className="text-xs text-gray-500">
                            {
                                filteredSamples.length
                            }{" "}
                            sample
                            {filteredSamples.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table
                        columns={
                            columns
                        }
                        data={
                            currentData
                        }
                        maxHeight="500px"
                        renderRow={(
                            sample: TrackedSample
                        ) => (
                            <>
                                {/* Accession */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                                            <QrCode2Icon
                                                className="text-blue-600"
                                                fontSize="small"
                                            />
                                        </div>

                                        <div>
                                            <p className="whitespace-nowrap text-xs font-semibold text-blue-700">
                                                {
                                                    sample.accessionNumber
                                                }
                                            </p>

                                            <p className="text-[11px] text-gray-500">
                                                {
                                                    sample.barcode
                                                }
                                            </p>
                                        </div>
                                    </div>
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
                                                {
                                                    sample.patientName
                                                }
                                            </p>

                                            <p className="text-[11px] text-gray-500">
                                                {
                                                    sample.patientId
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Test */}
                                <td className="px-4 py-3">
                                    <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                                        {
                                            sample.testName
                                        }
                                    </p>
                                </td>

                                {/* Sample */}
                                <td className="px-4 py-3">
                                    <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        {
                                            sample.sampleType
                                        }
                                    </span>
                                </td>

                                {/* Current Stage */}
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold ${getStatusClasses(
                                            sample.currentStatus
                                        )}`}
                                    >
                                        {
                                            sample.currentStatus
                                        }
                                    </span>
                                </td>

                                {/* Location */}
                                <td className="px-4 py-3">
                                    <div className="flex min-w-[150px] items-center gap-1.5">
                                        <LocationOnOutlinedIcon
                                            className="text-gray-400"
                                            fontSize="small"
                                        />

                                        <span className="text-xs text-gray-600">
                                            {
                                                sample.currentLocation
                                            }
                                        </span>
                                    </div>
                                </td>

                                {/* Last Updated */}
                                <td className="px-4 py-3">
                                    <div className="flex min-w-[90px] items-center gap-1.5">
                                        <AccessTimeIcon
                                            className="text-gray-400"
                                            fontSize="small"
                                        />

                                        <span className="whitespace-nowrap text-xs text-gray-600">
                                            {
                                                sample.lastUpdated
                                            }
                                        </span>
                                    </div>
                                </td>

                                {/* Progress */}
                                <td className="px-4 py-3">
                                    {
                                        renderTimeline(
                                            sample
                                        )
                                    }

                                    <div className="mt-2 h-1.5 w-full min-w-[180px] overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                sample.currentStatus ===
                                                "Rejected"
                                                    ? "bg-red-500"
                                                    : "bg-emerald-500"
                                            }`}
                                            style={{
                                                width: getProgressWidth(
                                                    sample.currentStatus
                                                ),
                                            }}
                                        />
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">

                                        <button
                                            onClick={() =>
                                                handleViewTracking(
                                                    sample
                                                )
                                            }
                                            title="View Tracking"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleViewBarcode(
                                                    sample
                                                )
                                            }
                                            title="View Barcode"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                                        >
                                            <QrCode2Icon fontSize="small" />
                                        </button>

                                    </div>
                                </td>
                            </>
                        )}
                    />
                </div>

                {/* Pagination */}
                {filteredSamples.length >
                    0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <Pagination
                            totalItems={
                                filteredSamples.length
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

                {/* Empty */}
                {filteredSamples.length ===
                    0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ScienceOutlinedIcon className="mb-2 text-4xl text-gray-300" />

                        <p className="text-sm font-semibold text-gray-600">
                            No samples found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filter criteria.
                        </p>
                    </div>
                )}
            </div>

            {/* Tracking Drawer */}
            {showTrackingDrawer &&
                selectedSample && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">

                        <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">

                            {/* Drawer Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">
                                        Sample Tracking
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {
                                            selectedSample.accessionNumber
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowTrackingDrawer(
                                            false
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>

                            <div className="space-y-5 p-5">

                                {/* Sample Info */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                                            <ScienceOutlinedIcon className="text-blue-600" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-gray-800">
                                                {
                                                    selectedSample.testName
                                                }
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {
                                                    selectedSample.sampleId
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div>
                                    <p className="mb-2 text-xs font-semibold text-gray-500">
                                        CURRENT STATUS
                                    </p>

                                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {
                                                    selectedSample.currentStatus
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {
                                                    selectedSample.currentLocation
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                selectedSample.currentStatus
                                            )}`}
                                        >
                                            {
                                                selectedSample.currentStatus
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <p className="mb-3 text-xs font-semibold text-gray-500">
                                        SAMPLE JOURNEY
                                    </p>

                                    <div className="space-y-4">

                                        <div className="flex gap-3">
                                            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500" />

                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Collected
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    {
                                                        selectedSample.collectedAt
                                                    }
                                                </p>

                                                <p className="text-[11px] text-gray-400">
                                                    By:{" "}
                                                    {
                                                        selectedSample.collector
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div
                                                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                                    selectedSample.receivedAt !==
                                                    "-"
                                                        ? "bg-indigo-500"
                                                        : "bg-gray-300"
                                                }`}
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Received
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    {
                                                        selectedSample.receivedAt
                                                    }
                                                </p>

                                                {selectedSample.receivedBy !==
                                                    "-" && (
                                                    <p className="text-[11px] text-gray-400">
                                                        By:{" "}
                                                        {
                                                            selectedSample.receivedBy
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div
                                                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                                    selectedSample.acceptedAt !==
                                                    "-"
                                                        ? "bg-emerald-500"
                                                        : "bg-gray-300"
                                                }`}
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Accepted
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    {
                                                        selectedSample.acceptedAt
                                                    }
                                                </p>

                                                {selectedSample.acceptedBy !==
                                                    "-" && (
                                                    <p className="text-[11px] text-gray-400">
                                                        By:{" "}
                                                        {
                                                            selectedSample.acceptedBy
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div
                                                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                                    selectedSample.processingAt !==
                                                    "-"
                                                        ? "bg-amber-500"
                                                        : "bg-gray-300"
                                                }`}
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Processing
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    {
                                                        selectedSample.processingAt
                                                    }
                                                </p>

                                                {selectedSample.processingBy !==
                                                    "-" && (
                                                    <p className="text-[11px] text-gray-400">
                                                        By:{" "}
                                                        {
                                                            selectedSample.processingBy
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div
                                                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                                    selectedSample.completedAt !==
                                                    "-"
                                                        ? "bg-green-500"
                                                        : "bg-gray-300"
                                                }`}
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Completed
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    {
                                                        selectedSample.completedAt
                                                    }
                                                </p>

                                                {selectedSample.completedBy !==
                                                    "-" && (
                                                    <p className="text-[11px] text-gray-400">
                                                        By:{" "}
                                                        {
                                                            selectedSample.completedBy
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedSample.currentStatus ===
                                            "Rejected" && (
                                            <div className="flex gap-3">
                                                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />

                                                <div>
                                                    <p className="text-xs font-semibold text-red-700">
                                                        Rejected
                                                    </p>

                                                    <p className="text-[11px] text-gray-500">
                                                        {
                                                            selectedSample.rejectedAt
                                                        }
                                                    </p>

                                                    <p className="text-[11px] text-gray-400">
                                                        By:{" "}
                                                        {
                                                            selectedSample.rejectedBy
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-red-600">
                                                        Reason:{" "}
                                                        {
                                                            selectedSample.rejectionReason
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

            {/* Barcode Drawer */}
            {showBarcode &&
                selectedSample && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

                        <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">

                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">
                                        Sample Barcode
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        {
                                            selectedSample.sampleId
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowBarcode(
                                            false
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center p-6">

                                <div className="mb-4 flex h-40 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                                    <QrCode2Icon
                                        className="text-gray-700"
                                        style={{
                                            fontSize: 130,
                                        }}
                                    />
                                </div>

                                <p className="text-sm font-bold text-gray-800">
                                    {
                                        selectedSample.barcode
                                    }
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {
                                        selectedSample.accessionNumber
                                    }
                                </p>

                                <button
                                    onClick={() =>
                                        setShowBarcode(
                                            false
                                        )
                                    }
                                    className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default SampleTracking;
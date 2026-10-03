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
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

interface Patient {
    id?: string | number;
    patientId?: string;
    registrationId?: string;
    patientName?: string;
    name?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    address?: string;
    doctorReferral?: string;
    doctor?: string;
    referral?: string;
    requiredTests?: string[];
    tests?: string[];
    status?: string;
}

interface Bill {
    id?: string | number;
    billId?: string;
    billNumber?: string;
    patientId?: string;
    registrationId?: string;
    patientName?: string;
    paymentStatus?: string;
    status?: string;
    tests?: unknown[];
    items?: unknown[];
    billItems?: unknown[];
}

interface Test {
    id?: string | number;
    code?: string;
    name?: string;
    testName?: string;
    sampleType?: string;
    category?: string;
    method?: string;
    price?: number;
}

interface Sample {
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
    status: "Pending Collection" | "Collected";
    source: "Patient Registration";
    createdAt: string;
}

const PATIENT_STORAGE_KEY = "lab_patients";
const BILL_STORAGE_KEY = "lab_bills";
const TEST_STORAGE_KEY = "lab_tests";
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

const saveStoredArray = <T,>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
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
    });
};

const getPatientId = (patient: Patient) => {
    return String(
        patient.patientId ||
            patient.id ||
            patient.registrationId ||
            ""
    );
};

const getPatientName = (patient: Patient) => {
    return String(
        patient.patientName ||
            patient.name ||
            "Unknown Patient"
    );
};

const getRegistrationId = (patient: Patient) => {
    return String(
        patient.registrationId ||
            patient.patientId ||
            patient.id ||
            ""
    );
};

const normalizeText = (value: unknown) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

const getTestNameFromItem = (item: unknown): string => {
    if (typeof item === "string") {
        return item;
    }

    if (typeof item === "object" && item !== null) {
        const test = item as Record<string, unknown>;

        return String(
            test.testName ||
                test.name ||
                test.test ||
                test.testCode ||
                test.code ||
                ""
        );
    }

    return "";
};

const getTestIdFromItem = (item: unknown): string => {
    if (typeof item === "string") {
        return "";
    }

    if (typeof item === "object" && item !== null) {
        const test = item as Record<string, unknown>;

        return String(
            test.testId ||
                test.id ||
                test.code ||
                ""
        );
    }

    return "";
};

const isBillPaid = (bill: Bill) => {
    const status = normalizeText(
        bill.paymentStatus || bill.status
    );

    return (
        status === "paid" ||
        status === "completed" ||
        status === "payment completed"
    );
};

const getBillTests = (bill: Bill): unknown[] => {
    if (Array.isArray(bill.tests)) {
        return bill.tests;
    }

    if (Array.isArray(bill.items)) {
        return bill.items;
    }

    if (Array.isArray(bill.billItems)) {
        return bill.billItems;
    }

    return [];
};

const getSampleType = (
    testName: string,
    tests: Test[]
) => {
    const matchedTest = tests.find(
        (test) =>
            normalizeText(test.name || test.testName) ===
            normalizeText(testName)
    );

    return matchedTest?.sampleType || "Blood";
};

const sampleTypeStyles: Record<string, string> = {
    Blood: "bg-red-50 text-red-600",
    Urine: "bg-yellow-50 text-yellow-700",
    Swab: "bg-purple-50 text-purple-700",
    Serum: "bg-orange-50 text-orange-700",
    Plasma: "bg-cyan-50 text-cyan-700",
    Stool: "bg-amber-50 text-amber-700",
};

const statusStyles: Record<
    Sample["status"],
    string
> = {
    Collected:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "Pending Collection":
        "bg-amber-50 text-amber-700 border border-amber-200",
};

const SampleCollection = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedSample, setSelectedSample] =  useState<Sample | null>(null);
    const [showViewDrawer, setShowViewDrawer] = useState(false);
    const [collector, setCollector] = useState("Lab Technician");

    const patients = useMemo(
        () => getStoredArray<Patient>(PATIENT_STORAGE_KEY),
        []
    );

    const bills = useMemo(
        () => getStoredArray<Bill>(BILL_STORAGE_KEY),
        []
    );

    const tests = useMemo(
        () => getStoredArray<Test>(TEST_STORAGE_KEY),
        []
    );

    const collectionSamples = useMemo(() => {
        const existingSamples = getStoredArray<Sample>(
            SAMPLE_STORAGE_KEY
        );

        const generatedSamples: Sample[] = [
            ...existingSamples,
        ];

        patients.forEach((patient) => {
            const patientId = getPatientId(patient);

            if (!patientId) {
                return;
            }

            const paidBill = bills.find((bill) => {
                const billPatientId = String(
                    bill.patientId ||
                        bill.registrationId ||
                        ""
                );

                return (
                    billPatientId === patientId &&
                    isBillPaid(bill)
                );
            });

            if (!paidBill) {
                return;
            }

            const registrationTests =
                Array.isArray(patient.requiredTests)
                    ? patient.requiredTests
                    : Array.isArray(patient.tests)
                    ? patient.tests
                    : [];

            const billTests = getBillTests(paidBill);
            const sourceTests =
                registrationTests.length > 0
                    ? registrationTests
                    : billTests;

            sourceTests.forEach((testItem) => {
                const testName =
                    getTestNameFromItem(testItem);

                if (!testName) {
                    return;
                }

                const existingSample =
                    generatedSamples.find(
                        (sample) =>
                            sample.patientId === patientId &&
                            normalizeText(
                                sample.testName
                            ) === normalizeText(testName)
                    );

                if (existingSample) {
                    return;
                }

                const sampleNumber =
                    generatedSamples.length + 1;

                const sampleId =
                    `SMP-2026-${String(
                        sampleNumber
                    ).padStart(4, "0")}`;

                const accessionNumber =
                    `ACC-2026-${String(
                        sampleNumber
                    ).padStart(4, "0")}`;

                const barcode =
                    `BC-${String(
                        100000 + sampleNumber
                    )}`;

                generatedSamples.push({
                    id: `${Date.now()}-${sampleNumber}`,

                    sampleId,
                    accessionNumber,
                    barcode,

                    patientId,
                    registrationId:
                        getRegistrationId(patient),

                    patientName:
                        getPatientName(patient),

                    testId:
                        getTestIdFromItem(testItem),

                    testName,

                    sampleType:
                        getSampleType(
                            testName,
                            tests
                        ),

                    collectionDate: "",
                    collectionTime: "",

                    collector: "",

                    status: "Pending Collection",

                    source: "Patient Registration",

                    createdAt:
                        new Date().toISOString(),
                });
            });
        });

        if (
            generatedSamples.length !==
            existingSamples.length
        ) {
            saveStoredArray(
                SAMPLE_STORAGE_KEY,
                generatedSamples
            );
        }

        return generatedSamples;
    }, [patients, bills, tests]);

    const filteredData = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return collectionSamples.filter((sample) => {
            const matchesSearch =
                !searchValue ||
                sample.patientName
                    .toLowerCase()
                    .includes(searchValue) ||
                sample.patientId
                    .toLowerCase()
                    .includes(searchValue) ||
                sample.registrationId
                    .toLowerCase()
                    .includes(searchValue) ||
                sample.sampleId
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
        collectionSamples,
        search,
        statusFilter,
    ]);

    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const totalCount =
        collectionSamples.length;

    const collectedCount =
        collectionSamples.filter(
            (sample) =>
                sample.status === "Collected"
        ).length;

    const pendingCount =
        collectionSamples.filter(
            (sample) =>
                sample.status ===
                "Pending Collection"
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

    const handleCollectSample = (
        sample: Sample
    ) => {
        const storedSamples =
            getStoredArray<Sample>(
                SAMPLE_STORAGE_KEY
            );

        const updatedSamples =
            storedSamples.map(
                (item) => {
                    if (
                        item.id !== sample.id
                    ) {
                        return item;
                    }

                    return {
                        ...item,

                        collectionDate:
                            getToday(),

                        collectionTime:
                            getCurrentTime(),

                        collector,

                        status:
                            "Collected",
                    };
                }
            );

        saveStoredArray(
            SAMPLE_STORAGE_KEY,
            updatedSamples
        );
        window.location.reload();
    };

    const handleViewSample = (
        sample: Sample
    ) => {
        setSelectedSample(sample);
        setShowViewDrawer(true);
    };

    const handleTrackSample = (
        sample: Sample
    ) => {
        navigate(
            `/accession/sample-tracking?sampleId=${encodeURIComponent(
                sample.sampleId
            )}`
        );
    };

    const handleReset = () => {
        setSearch("");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    const columns = [
        "Sample",
        "Patient",
        "Test",
        "Sample Type",
        "Collection",
        "Collector",
        "Barcode",
        "Status",
        "Actions",
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowBackIcon fontSize="small" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            Sample Collection
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Collect samples for paid laboratory test orders
                        </p>
                    </div>
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
                                Samples ready for collection
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
                                Collected
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                                {collectedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Samples collected
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircleIcon />
                        </div>

                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Pending Collection
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-amber-600">
                                {pendingCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Awaiting sample collection
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <AccessTimeIcon />
                        </div>

                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Ready for Receiving
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-purple-600">
                                {collectedCount}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Collected samples
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <LocalShippingOutlinedIcon />
                        </div>

                    </div>
                </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-4 sm:p-5">

                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                        {/* Search */}

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
                                placeholder="Search patient, sample, test or barcode..."
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
                                    value={statusFilter}
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

                                    <option value="Pending Collection">
                                        Pending Collection
                                    </option>

                                    <option value="Collected">
                                        Collected
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

                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2">

                            <PersonIcon
                                fontSize="small"
                                className="text-slate-400"
                            />

                            <span className="text-sm font-medium text-slate-600">
                                Collection Staff
                            </span>

                        </div>

                        <select
                            value={collector}
                            onChange={(e) =>
                                setCollector(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="Lab Technician">
                                Lab Technician
                            </option>

                            <option value="Nurse Priya">
                                Nurse Priya
                            </option>

                            <option value="Nurse Kavya">
                                Nurse Kavya
                            </option>

                            <option value="Staff Mani">
                                Staff Mani
                            </option>
                        </select>

                    </div>

                </div>

                <div className="p-3 sm:p-5">

                    <div className="overflow-x-auto">

                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="500px"
                            renderRow={(sample: Sample) => (
                                <>
                                    {/* Sample */}

                                    <td className="px-4 py-4">

                                        <div>
                                            <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                {sample.sampleId}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {sample.accessionNumber}
                                            </p>
                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="flex min-w-[190px] items-center gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                <PersonIcon fontSize="small" />
                                            </div>

                                            <div>

                                                <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                                                    {sample.patientName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {sample.patientId}
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="px-4 py-4">

                                        <p className="min-w-[180px] text-sm font-medium text-slate-700">
                                            {sample.testName}
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
                                            {sample.sampleType}
                                        </span>

                                    </td>

                                    <td className="px-4 py-4">

                                        <div className="min-w-[155px]">

                                            {sample.collectionDate ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <CalendarTodayOutlinedIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                            className="text-slate-400"
                                                        />

                                                        {sample.collectionDate}

                                                    </div>

                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                                        <AccessTimeIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                            className="text-slate-400"
                                                        />

                                                        {sample.collectionTime}

                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-amber-600">
                                                    Awaiting collection
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                    {/* Collector */}

                                    <td className="px-4 py-4">

                                        <p className="whitespace-nowrap text-sm text-slate-600">
                                            {sample.collector ||
                                                "-"}
                                        </p>

                                    </td>

                                    {/* Barcode */}

                                    <td className="px-4 py-4">

                                        <div className="flex min-w-[140px] items-center gap-2">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                <QrCode2Icon fontSize="small" />
                                            </div>

                                            <span className="text-xs font-medium text-slate-600">
                                                {sample.barcode}
                                            </span>

                                        </div>

                                    </td>

                                    {/* Status */}

                                    <td className="px-4 py-4">

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                statusStyles[
                                                    sample.status
                                                ]
                                            }`}
                                        >
                                            {sample.status}
                                        </span>

                                    </td>

                                    {/* Actions */}

                                    <td className="px-4 py-4">

                                        <div className="flex min-w-[170px] items-center gap-2">

                                            {/* View */}

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

                                            {/* Collect */}

                                            {sample.status ===
                                                "Pending Collection" && (
                                                <button
                                                    title="Collect Sample"
                                                    onClick={() =>
                                                        handleCollectSample(
                                                            sample
                                                        )
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </button>
                                            )}

                                            {/* Track */}

                                            {sample.status ===
                                                "Collected" && (
                                                <button
                                                    title="Track Sample"
                                                    onClick={() =>
                                                        handleTrackSample(
                                                            sample
                                                        )
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 text-purple-600 transition hover:bg-purple-50"
                                                >
                                                    <LocalShippingOutlinedIcon fontSize="small" />
                                                </button>
                                            )}

                                        </div>

                                    </td>
                                </>
                            )}
                        />

                    </div>

                    {currentData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">

                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Inventory2OutlinedIcon />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700">
                                No samples found
                            </h3>

                            <p className="mt-1 max-w-md text-xs text-slate-400">
                                Samples will appear here after a
                                patient is registered, tests are
                                selected, and the corresponding bill
                                is paid.
                            </p>

                        </div>
                    )}

                    {filteredData.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">

                            <Pagination
                                totalItems={  filteredData.length }
                                rowsPerPage={ rowsPerPage }
                                setRowsPerPage={ setRowsPerPage }
                                currentPage={  currentPage }
                                setCurrentPage={ setCurrentPage }
                            />

                        </div>
                    )}

                </div>

            </div>

            {showViewDrawer &&
                selectedSample && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">

                        <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">

                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Sample Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {selectedSample.sampleId}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowViewDrawer(
                                            false
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>

                            </div>

                            <div className="space-y-5 p-5">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm font-medium text-slate-500">
                                            Status
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                statusStyles[
                                                    selectedSample
                                                        .status
                                                ]
                                            }`}
                                        >
                                            {
                                                selectedSample.status
                                            }
                                        </span>

                                    </div>

                                </div>

                                <div>

                                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                                        Patient Information
                                    </h3>

                                    <div className="space-y-3">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Patient
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.patientName
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Patient ID
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.patientId
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Registration ID
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.registrationId
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div>

                                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                                        Test Information
                                    </h3>

                                    <div className="space-y-3">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Test
                                            </span>

                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.testName
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Sample Type
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.sampleType
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div>

                                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                                        Sample Information
                                    </h3>

                                    <div className="space-y-3">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Sample ID
                                            </span>

                                            <span className="text-sm font-semibold text-blue-600">
                                                {
                                                    selectedSample.sampleId
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Accession
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.accessionNumber
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Barcode
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample.barcode
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                <div>

                                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                                        Collection Information
                                    </h3>

                                    <div className="space-y-3">

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Date
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample
                                                        .collectionDate ||
                                                    "-"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Time
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample
                                                        .collectionTime ||
                                                    "-"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-400">
                                                Collector
                                            </span>

                                            <span className="text-sm font-medium text-slate-700">
                                                {
                                                    selectedSample
                                                        .collector ||
                                                    "-"
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {selectedSample.status ===
                                    "Pending Collection" && (
                                    <button
                                        onClick={() => {
                                            handleCollectSample(
                                                selectedSample
                                            );

                                            setShowViewDrawer(
                                                false
                                            );
                                        }}
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        <CheckCircleIcon fontSize="small" />
                                        Collect Sample
                                    </button>
                                )}

                                {selectedSample.status ===
                                    "Collected" && (
                                    <button
                                        onClick={() =>
                                            handleTrackSample(
                                                selectedSample
                                            )
                                        }
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
                                    >
                                        <LocalShippingOutlinedIcon fontSize="small" />
                                        Track Sample
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default SampleCollection;
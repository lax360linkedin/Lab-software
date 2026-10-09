import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HistoryOutlinedIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import type { StoredSample } from "./ReportPrint";
import ReportPrint from "./ReportPrint";

type RecordData = Record<string, unknown>;

type HistoryRecord = {
    id: string;
    patientId: string;
    patientName: string;
    registrationId: string;
    date: string;
    title: string;
    category: "Billing" | "Analysis" | "Final Report";
    status: string;
    source: RecordData | StoredSample;
};

type DateFilter =
    | "Today"
    | "Yesterday"
    | "Last Month"
    | "Last 3 Months"
    | "Last 6 Months"
    | "Last Year"
    | "All Time"
    | "Custom";

const readArray = <T,>(key: string): T[] => {
    try {
        const value = localStorage.getItem(key);
        const parsed: unknown = value ? JSON.parse(value) : [];

        return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
};

const getText = (
    record: RecordData | StoredSample,
    ...keys: string[]
): string => {
    const data = record as RecordData;

    for (const key of keys) {
        const value = data[key];

        if (
            typeof value === "string" ||
            typeof value === "number"
        ) {
            if (String(value).trim()) return String(value);
        }
    }

    return "";
};

const getDate = (record: RecordData | StoredSample): string => {
    return getText(
        record,
        "reportGeneratedDate",
        "paymentDate",
        "billDate",
        "analysisCompletedDate",
        "completedDate",
        "createdAt",
        "registrationDate",
        "date"
    );
};

const parseDate = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) return parsed;

    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (match) {
        const [, day, month, year] = match;
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isWithinDateFilter = (
    value: string,
    filter: DateFilter,
    customFrom: string,
    customTo: string
): boolean => {
    if (filter === "All Time") return true;

    const date = parseDate(value);
    if (!date) return false;

    const current = startOfDay(new Date());
    const recordDate = startOfDay(date);

    if (filter === "Today") {
        return recordDate.getTime() === current.getTime();
    }

    if (filter === "Yesterday") {
        const yesterday = new Date(current);
        yesterday.setDate(yesterday.getDate() - 1);

        return recordDate.getTime() === yesterday.getTime();
    }

    if (filter === "Custom") {
        if (customFrom) {
            const from = startOfDay(new Date(`${customFrom}T00:00:00`));
            if (recordDate < from) return false;
        }

        if (customTo) {
            const to = startOfDay(new Date(`${customTo}T00:00:00`));
            if (recordDate > to) return false;
        }

        return true;
    }

    const cutoff = new Date(current);

    switch (filter) {
        case "Last Month":
            cutoff.setMonth(cutoff.getMonth() - 1);
            break;
        case "Last 3 Months":
            cutoff.setMonth(cutoff.getMonth() - 3);
            break;
        case "Last 6 Months":
            cutoff.setMonth(cutoff.getMonth() - 6);
            break;
        case "Last Year":
            cutoff.setFullYear(cutoff.getFullYear() - 1);
            break;
    }

    return recordDate >= cutoff && recordDate <= current;
};

const formatDate = (value: string) => {
    const date = parseDate(value);

    return date
        ? date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : value || "Date unavailable";
};

const ReportHistory = () => {
    const navigate = useNavigate();
    const [samples] = useState<StoredSample[]>(() => readArray<StoredSample>("lab_samples") );
    const [bills] = useState<RecordData[]>(() =>readArray<RecordData>("lab_bills") );
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState<DateFilter>("Last 6 Months");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);


    const patients = useMemo(() => {
        const map = new Map<
            string,
            { patientId: string; patientName: string; registrationId: string }
        >();

        const addPatient = (record: RecordData | StoredSample) => {
            const patientId = getText(record, "patientId");

            if (!patientId) return;

            const existing = map.get(patientId);

            map.set(patientId, {
                patientId,
                patientName:
                    getText(record, "patientName", "name") ||
                    existing?.patientName ||
                    "Unknown Patient",
                registrationId:
                    getText(record, "registrationId") ||
                    existing?.registrationId ||
                    "",
            });
        };

        samples.forEach(addPatient);
        bills.forEach(addPatient);

        return Array.from(map.values()).sort((a, b) =>
            a.patientName.localeCompare(b.patientName)
        );
    }, [samples, bills]);

    const matchingPatients = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return patients.filter((patient) => {
            return (
                !search ||
                patient.patientName.toLowerCase().includes(search) ||
                patient.patientId.toLowerCase().includes(search) ||
                patient.registrationId.toLowerCase().includes(search)
            );
        });
    }, [patients, searchTerm]);

    const historyRecords = useMemo(() => {
        if (!selectedPatientId) return [];

        const patientSamples = samples.filter(
            (sample) => sample.patientId === selectedPatientId
        );

        const patientBills = bills.filter(
            (bill) => getText(bill, "patientId") === selectedPatientId
        );

        const records: HistoryRecord[] = [];

        // Billing and payment history from existing bills.
        patientBills.forEach((bill, index) => {
            const billId = getText(bill, "billId", "id", "invoiceId");
            const paymentStatus = getText(
                bill,
                "paymentStatus",
                "status"
            );

            records.push({
                id: billId || `bill-${index}`,
                patientId: selectedPatientId,
                patientName:
                    getText(bill, "patientName", "name") ||
                    patients.find((p) => p.patientId === selectedPatientId)
                        ?.patientName ||
                    "Unknown Patient",
                registrationId: getText(bill, "registrationId"),
                date: getDate(bill),
                title: billId || "Billing Record",
                category: "Billing",
                status: paymentStatus || "Billing Record",
                source: bill,
            });
        });
        patientSamples.forEach((sample, index) => {
            const reportIsFinal =
                sample.resultStatus === "Verified" &&
                sample.reportStatus === "Final";

            const analysisIsComplete =
                getText(sample, "analysisStatus", "status") === "Completed" ||
                getText(sample, "resultStatus") === "Completed" ||
                reportIsFinal;

            if (analysisIsComplete) {
                records.push({
                    id: `analysis-${sample.sampleId || index}`,
                    patientId: selectedPatientId,
                    patientName: sample.patientName || "Unknown Patient",
                    registrationId: sample.registrationId || "",
                    date: getDate(sample),
                    title: sample.testName || "Completed Analysis",
                    category: "Analysis",
                    status: "Completed",
                    source: sample,
                });
            }

            if (reportIsFinal) {
                records.push({
                    id: sample.reportId || `report-${sample.sampleId || index}`,
                    patientId: selectedPatientId,
                    patientName: sample.patientName || "Unknown Patient",
                    registrationId: sample.registrationId || "",
                    date: sample.reportGeneratedDate || "",
                    title: sample.reportId || sample.testName || "Final Report",
                    category: "Final Report",
                    status: "Final",
                    source: sample,
                });
            }
        });

        return records
            .filter((record) =>
                isWithinDateFilter(
                    record.date,
                    dateFilter,
                    customFrom,
                    customTo
                )
            )
            .filter(
                (record) =>
                    categoryFilter === "All" ||
                    record.category === categoryFilter
            )
            .sort((a, b) => {
                const dateA = parseDate(a.date)?.getTime() ?? 0;
                const dateB = parseDate(b.date)?.getTime() ?? 0;

                return dateB - dateA;
            });
    }, [
        selectedPatientId,
        samples,
        bills,
        patients,
        dateFilter,
        customFrom,
        customTo,
        categoryFilter,
    ]);

    const selectedPatient = patients.find(
        (patient) => patient.patientId === selectedPatientId
    );

    const openRecord = (record: HistoryRecord) => {
        setSelectedRecord(record);
    };

    const handlePrint = () => {
        if (!selectedRecord) return;

        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <HistoryOutlinedIcon className="text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-800">
                            Report History
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        View a patient's billing, completed analysis and
                        finalized reports in one place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/reports/final")}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                    Back to Final Reports
                </button>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Search Patient
                </label>

                <div className="relative">
                    <SearchIcon
                        fontSize="small"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={searchTerm}
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setSelectedPatientId("");
                            setSelectedRecord(null);
                        }}
                        placeholder="Search by patient name, patient ID or registration ID..."
                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {searchTerm.trim() && !selectedPatientId && (
                    <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                        {matchingPatients.length ? (
                            matchingPatients.map((patient) => (
                                <button
                                    key={patient.patientId}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPatientId(patient.patientId);
                                        setSearchTerm(patient.patientName);
                                    }}
                                    className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition last:border-b-0 hover:bg-blue-50"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                        <PersonIcon />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-slate-800">
                                            {patient.patientName}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            {patient.patientId}
                                            {patient.registrationId
                                                ? ` · ${patient.registrationId}`
                                                : ""}
                                        </span>
                                    </span>

                                    <VisibilityOutlinedIcon className="text-slate-400" />
                                </button>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-slate-500">
                                No matching patients found in the existing
                                billing or sample records.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {selectedPatient ? (
                <>
                    <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                    <PersonIcon />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {selectedPatient.patientName}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Patient ID: {selectedPatient.patientId}
                                    </p>
                                    {selectedPatient.registrationId && (
                                        <p className="text-sm text-slate-500">
                                            Registration ID:{" "}
                                            {selectedPatient.registrationId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPatientId("");
                                    setSearchTerm("");
                                    setSelectedRecord(null);
                                }}
                                className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 sm:self-auto"
                            >
                                Change Patient
                            </button>
                        </div>
                    </div>

                    <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <FilterListIcon className="text-slate-500" />
                            <h3 className="font-semibold text-slate-800">
                                Filter History
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Date Range
                                </label>

                                <select
                                    value={dateFilter}
                                    onChange={(event) =>
                                        setDateFilter(
                                            event.target.value as DateFilter
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="Today">Today</option>
                                    <option value="Yesterday">Yesterday</option>
                                    <option value="Last Month">Last Month</option>
                                    <option value="Last 3 Months">
                                        Last 3 Months
                                    </option>
                                    <option value="Last 6 Months">
                                        Last 6 Months
                                    </option>
                                    <option value="Last Year">Last Year</option>
                                    <option value="All Time">All Time</option>
                                    <option value="Custom">
                                        Custom Date Range
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Record Type
                                </label>

                                <select
                                    value={categoryFilter}
                                    onChange={(event) =>
                                        setCategoryFilter(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="All">All Records</option>
                                    <option value="Billing">
                                        Billing / Payment
                                    </option>
                                    <option value="Analysis">
                                        Completed Analysis
                                    </option>
                                    <option value="Final Report">
                                        Final Reports
                                    </option>
                                </select>
                            </div>
                        </div>

                        {dateFilter === "Custom" && (
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customFrom}
                                        max={customTo || undefined}
                                        onChange={(event) =>
                                            setCustomFrom(event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customTo}
                                        min={customFrom || undefined}
                                        onChange={(event) =>
                                            setCustomTo(event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: "Billing Records",
                                count: historyRecords.filter(
                                    (record) => record.category === "Billing"
                                ).length,
                                icon: <ReceiptLongOutlinedIcon />,
                                color: "bg-amber-50 text-amber-700",
                            },
                            {
                                label: "Completed Analysis",
                                count: historyRecords.filter(
                                    (record) => record.category === "Analysis"
                                ).length,
                                icon: <ScienceOutlinedIcon />,
                                color: "bg-blue-50 text-blue-700",
                            },
                            {
                                label: "Final Reports",
                                count: historyRecords.filter(
                                    (record) =>
                                        record.category === "Final Report"
                                ).length,
                                icon: <AssessmentOutlinedIcon />,
                                color: "bg-green-50 text-green-700",
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}
                                    >
                                        {item.icon}
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-800">
                                    {item.count}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-4 sm:p-5">
                            <h3 className="font-bold text-slate-800">
                                Patient Visit & Report History
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {historyRecords.length} records found for the
                                selected filters.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-slate-700 text-white">
                                    <tr>
                                        {[
                                            "Date",
                                            "Record ID / Test",
                                            "Record Type",
                                            "Registration ID",
                                            "Status",
                                            "Action",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {historyRecords.map((record) => (
                                        <tr
                                            key={`${record.category}-${record.id}`}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                                {formatDate(record.date)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {record.title}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {record.category ===
                                                    "Final Report"
                                                        ? (
                                                              record.source as StoredSample
                                                          ).testName
                                                        : record.category ===
                                                            "Analysis"
                                                          ? (
                                                                record.source as StoredSample
                                                            ).sampleId
                                                          : getText(
                                                                record.source,
                                                                "paymentId"
                                                            )}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        record.category ===
                                                        "Billing"
                                                            ? "bg-amber-50 text-amber-700"
                                                            : record.category ===
                                                                "Analysis"
                                                              ? "bg-blue-50 text-blue-700"
                                                              : "bg-green-50 text-green-700"
                                                    }`}
                                                >
                                                    {record.category}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                                {record.registrationId || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {record.status}
                                            </td>

                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRecord(record)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {historyRecords.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center"
                                            >
                                                <HistoryOutlinedIcon className="mb-2 text-4xl text-slate-300" />
                                                <p className="font-medium text-slate-700">
                                                    No history found
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Try another date range or
                                                    record type.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                    <PersonIcon className="mb-3 text-5xl text-slate-300" />
                    <h2 className="text-lg font-semibold text-slate-800">
                        Search and select a patient
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        Select a patient to view their existing billing records,
                        completed analysis and finalized laboratory reports.
                    </p>
                </div>
            )}

            {selectedRecord && (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        aria-label="Close record details"
                        onClick={() => setSelectedRecord(null)}
                        className="absolute inset-0 h-full w-full bg-black/40"
                    />

                    <div className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {selectedRecord.category}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedRecord.title}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {selectedRecord.category === "Final Report" ? (
                                <ReportPrint
                                    sample={
                                        selectedRecord.source as StoredSample
                                    }
                                />
                            ) : (
                                <div className="rounded-xl border border-slate-200 p-5">
                                    <h3 className="mb-4 font-bold text-slate-800">
                                        Record Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {[
                                            {
                                                label: "Patient Name",
                                                value: selectedRecord.patientName,
                                            },
                                            {
                                                label: "Patient ID",
                                                value: selectedRecord.patientId,
                                            },
                                            {
                                                label: "Registration ID",
                                                value:
                                                    selectedRecord.registrationId,
                                            },
                                            {
                                                label: "Record ID",
                                                value: selectedRecord.title,
                                            },
                                            {
                                                label: "Record Type",
                                                value: selectedRecord.category,
                                            },
                                            {
                                                label: "Date",
                                                value: formatDate(
                                                    selectedRecord.date
                                                ),
                                            },
                                            {
                                                label: "Status",
                                                value: selectedRecord.status,
                                            },
                                            {
                                                label: "Test",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "testName"
                                                ),
                                            },
                                            {
                                                label: "Payment Method",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "paymentMethod"
                                                ),
                                            },
                                            {
                                                label: "Amount",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "totalAmount",
                                                    "total",
                                                    "amount"
                                                ),
                                            },
                                            {
                                                label: "Payment ID",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "paymentId"
                                                ),
                                            },
                                            {
                                                label: "Sample ID",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "sampleId"
                                                ),
                                            },
                                            {
                                                label: "Accession Number",
                                                value: getText(
                                                    selectedRecord.source,
                                                    "accessionNumber"
                                                ),
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-lg bg-slate-50 p-3"
                                            >
                                                <p className="text-xs font-medium uppercase text-slate-500">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                    {item.value || "-"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedRecord.category === "Analysis" && (
                                        <div className="mt-5">
                                            <h4 className="mb-3 font-semibold text-slate-800">
                                                Analysis Results
                                            </h4>

                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-100">
                                                            <th className="border border-slate-200 px-3 py-2 text-left text-xs">
                                                                Parameter
                                                            </th>
                                                            <th className="border border-slate-200 px-3 py-2 text-left text-xs">
                                                                Result
                                                            </th>
                                                            <th className="border border-slate-200 px-3 py-2 text-left text-xs">
                                                                Unit
                                                            </th>
                                                            <th className="border border-slate-200 px-3 py-2 text-left text-xs">
                                                                Reference Range
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(
                                                            selectedRecord.source as StoredSample
                                                        ).resultParameters?.map(
                                                            (parameter, index) => (
                                                                <tr key={index}>
                                                                    <td className="border border-slate-200 px-3 py-2 text-sm">
                                                                        {parameter.name}
                                                                    </td>
                                                                    <td className="border border-slate-200 px-3 py-2 text-sm">
                                                                        {parameter.value}
                                                                    </td>
                                                                    <td className="border border-slate-200 px-3 py-2 text-sm">
                                                                        {parameter.unit || "-"}
                                                                    </td>
                                                                    <td className="border border-slate-200 px-3 py-2 text-sm">
                                                                        {parameter.referenceRange || "-"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}

                                                        {!(
                                                            selectedRecord.source as StoredSample
                                                        ).resultParameters?.length && (
                                                            <tr>
                                                                <td
                                                                    colSpan={4}
                                                                    className="border border-slate-200 px-3 py-5 text-center text-sm text-slate-500"
                                                                >
                                                                    No result
                                                                    parameters
                                                                    are stored
                                                                    for this
                                                                    record.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <PrintOutlinedIcon fontSize="small" />
                                Print Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportHistory;
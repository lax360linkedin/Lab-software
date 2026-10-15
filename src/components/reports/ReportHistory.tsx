import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import "./ReportPrint.css";
import type { StoredSample } from "./ReportPrint";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import ReportPrint from "./ReportPrint";
import { INITIAL_TEMPLATES } from "../notifications/notificationsData";

export interface LabReportParameter {
    name?: string;
    value?: string | number;
    unit?: string;
    referenceRange?: string;
    flag?: string;
    status?: string;
}

export interface LabSampleMetadata {
    collectionDate?: string;
    registrationDate?: string;
    createdAt?: string;
    patientPhone?: string;
    phone?: string;
    email?: string;
    patientEmail?: string;
    doctorName?: string;
    verificationDate?: string;
    totalAmount?: number | string;
    paidAmount?: number | string;
    dueAmount?: number | string;
}

const asExtended = (sample: StoredSample | null | undefined): (StoredSample & LabSampleMetadata) | null => {
    if (!sample) return null;
    return sample as unknown as (StoredSample & LabSampleMetadata);
};

const getParametersList = (sample: StoredSample | null | undefined): LabReportParameter[] => {
    if (!sample || !sample.resultParameters) return [];
    return sample.resultParameters as unknown as LabReportParameter[];
};

type DateFilterOption = "All" | "Today" | "Yesterday" | "Last Month" | "Last 6 Months" | "Custom";
type DrawerReportTab = "final" | "billing" | "analysis" | "trends";

const ReportHistory: React.FC = () => {
    const navigate = useNavigate();

    const [samples] = useState<StoredSample[]>(() => {
        try {
            const stored = localStorage.getItem("lab_samples");
            const parsed: unknown = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? (parsed as StoredSample[]) : [];
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState<DateFilterOption>("All");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [selectedSample, setSelectedSample] = useState<StoredSample | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [shareChannel, setShareChannel] = useState<"SMS" | "Email" | "WhatsApp" | null>(null);
    const [shareRecipient, setShareRecipient] = useState("");
    const [shareSubject, setShareSubject] = useState("");
    const [shareMessage, setShareMessage] = useState("");
    const [sharePhone, setSharePhone] = useState("");
    const [shareEmail, setShareEmail] = useState("");
    const [activeReportTab, setActiveReportTab] = useState<DrawerReportTab>("final");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const matchesDateFilter = useCallback(
        (sampleDateStr: string | undefined): boolean => {
            if (dateFilter === "All") return true;
            if (!sampleDateStr) return false;

            const sampleDate = new Date(sampleDateStr);
            if (isNaN(sampleDate.getTime())) return false;

            const now = new Date();
            const todayStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0, 0, 0
            );
            const todayEnd = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23, 59, 59
            );

            if (dateFilter === "Today") {
                return sampleDate >= todayStart && sampleDate <= todayEnd;
            }

            if (dateFilter === "Yesterday") {
                const yStart = new Date(todayStart);
                yStart.setDate(yStart.getDate() - 1);

                const yEnd = new Date(todayEnd);
                yEnd.setDate(yEnd.getDate() - 1);

                return sampleDate >= yStart && sampleDate <= yEnd;
            }

            if (dateFilter === "Last Month") {
                const monthAgo = new Date(todayStart);
                monthAgo.setDate(monthAgo.getDate() - 30);

                return sampleDate >= monthAgo && sampleDate <= todayEnd;
            }

            if (dateFilter === "Last 6 Months") {
                const sixMonthsAgo = new Date(todayStart);
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                return sampleDate >= sixMonthsAgo && sampleDate <= todayEnd;
            }

            if (dateFilter === "Custom") {
                if (!customStartDate && !customEndDate) return true;

                const start = customStartDate
                    ? new Date(customStartDate + "T00:00:00")
                    : new Date(0);

                const end = customEndDate
                    ? new Date(customEndDate + "T23:59:59")
                    : new Date(8640000000000000);

                return sampleDate >= start && sampleDate <= end;
            }

            return true;
        },
        [dateFilter, customStartDate, customEndDate]
    );

    const filteredReports = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return samples.filter((sample) => {
            const matchesSearch =
                !search ||
                sample.reportId?.toLowerCase().includes(search) ||
                sample.patientName?.toLowerCase().includes(search) ||
                sample.patientId?.toLowerCase().includes(search) ||
                sample.sampleId?.toLowerCase().includes(search) ||
                sample.testName?.toLowerCase().includes(search);

            const matchesPriority =
                priorityFilter === "All" || sample.priority === priorityFilter;

            const ext = asExtended(sample);
            const dateValue =
                sample.reportGeneratedDate ||
                ext?.collectionDate ||
                ext?.registrationDate ||
                ext?.createdAt;

            const matchesDate = matchesDateFilter(dateValue);

            return matchesSearch && matchesPriority && matchesDate;
        });
    }, [samples, searchTerm, priorityFilter, matchesDateFilter]);

    const patientAllReports = useMemo(() => {
        if (!selectedSample) return [];
        return samples.filter(
            (s) =>
                s.patientId === selectedSample.patientId ||
                (s.patientName && s.patientName === selectedSample.patientName)
        );
    }, [samples, selectedSample]);

    const parameterTrends = useMemo(() => {
        if (patientAllReports.length <= 1) return [];

        const paramMap: Record<
            string,
            {
                name: string;
                unit: string;
                referenceRange: string;
                readings: Array<{
                    date: string;
                    registrationId: string;
                    value: number;
                    rawVal: string;
                }>;
            }
        > = {};

        const chronoSorted = [...patientAllReports].sort((a, b) => {
            const extA = asExtended(a);
            const extB = asExtended(b);
            const dA = new Date(a.reportGeneratedDate || extA?.collectionDate || 0).getTime();
            const dB = new Date(b.reportGeneratedDate || extB?.collectionDate || 0).getTime();
            return dA - dB;
        });

        chronoSorted.forEach((report) => {
            const params = getParametersList(report);
            params.forEach((param) => {
                if (!param || !param.name) return;
                const numVal = parseFloat(String(param.value));
                if (!isNaN(numVal)) {
                    if (!paramMap[param.name]) {
                        paramMap[param.name] = {
                            name: String(param.name),
                            unit: String(param.unit || ""),
                            referenceRange: String(param.referenceRange || ""),
                            readings: [],
                        };
                    }
                    paramMap[param.name].readings.push({
                        date: String(report.reportGeneratedDate || "Visit Date"),
                        registrationId: String(report.reportId || "-"),
                        value: numVal,
                        rawVal: String(param.value),
                    });
                }
            });
        });

        return Object.values(paramMap).map((item) => {
            const count = item.readings.length;
            const baseline = item.readings[0];
            const latest = item.readings[count - 1];
            const delta = count > 1 ? Number((latest.value - baseline.value).toFixed(2)) : 0;
            const percentChange =
                count > 1 && baseline.value !== 0
                    ? Number(((delta / baseline.value) * 100).toFixed(1))
                    : 0;

            const lowerName = item.name.toLowerCase();
            const isImproving =
                (lowerName.includes("sugar") || lowerName.includes("glucose") || lowerName.includes("hba1c") || lowerName.includes("cholesterol"))
                    ? delta < 0
                    : false;

            return {
                ...item,
                count,
                baselineValue: baseline.value,
                latestValue: latest.value,
                delta,
                percentChange,
                isImproving,
            };
        });
    }, [patientAllReports]);

    const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const currentData = filteredReports.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const openReport = (sample: StoredSample, defaultTab: DrawerReportTab = "final") => {
        setSelectedSample(sample);
        setActiveReportTab(defaultTab);
        setShowDetails(true);
        setShowShareOptions(false);
    };

    const closeReport = () => {
        setShowDetails(false);
        setShowShareOptions(false);
        setSelectedSample(null);
    };

    const handlePrint = () => {
        if (!selectedSample) return;
        requestAnimationFrame(() => {
            window.print();
        });
    };

    const handleShare = () => {
        if (!selectedSample) return;
        if (showShareOptions) {
            setShowShareOptions(false);
            return;
        }
        let storedPatient: Record<string, unknown> = {};
        try {
            const patients: unknown = JSON.parse(localStorage.getItem("lab_patients") || "[]");
            if (Array.isArray(patients)) {
                const reportPatientId = String(selectedSample.patientId || "").trim().toLowerCase();
                const patient = patients.find((item) => {
                    if (!item || typeof item !== "object") return false;
                    const record = item as Record<string, unknown>;
                    return String(record.patientId || "").trim().toLowerCase() === reportPatientId;
                });
                if (patient && typeof patient === "object") storedPatient = patient as Record<string, unknown>;
            }
        } catch {
            storedPatient = {};
        }

        const ext = asExtended(selectedSample);
        const firstContact = (...values: unknown[]) =>
            values.map((value) => String(value ?? "").trim()).find(Boolean) || "";
        const phone = firstContact(storedPatient.phone, ext?.patientPhone, ext?.phone);
        const email = firstContact(storedPatient.email, ext?.patientEmail, ext?.email);
        setSharePhone(phone);
        setShareEmail(email);
        setShareChannel(null);
        setShareRecipient("");

        const readyTemplate = INITIAL_TEMPLATES.find((template) => template.eventType === "Report Ready" && template.isActive);
        const tags: Record<string, string> = {
            patient_name: selectedSample.patientName || "Patient",
            patient_id: selectedSample.patientId || "",
            test_name: selectedSample.testName || "Laboratory test",
            report_url: `${window.location.origin}/reports/history`,
            lab_name: "Lax Lab",
            doctor_name: ext?.doctorName || "",
            verified_date: ext?.verificationDate || selectedSample.reportGeneratedDate || "",
        };
        const fillTemplate = (value: string) => value.replace(/{{\s*([^}]+)\s*}}/g, (_, tag: string) => tags[tag] ?? "");
        const fallbackMessage = `Dear ${tags.patient_name}, your ${tags.test_name} report (${selectedSample.reportId || selectedSample.sampleId}) is ready. You can view it in your Lax Lab report history.`;
        setShareSubject(fillTemplate(readyTemplate?.subjectTemplate || "Your {{test_name}} report is ready - {{lab_name}}"));
        setShareMessage(fillTemplate(readyTemplate?.bodyTemplate || fallbackMessage));
        setShowDetails(false);
        setShowShareOptions(true);
    };

    const handleChannelShare = (channel: "SMS" | "Email" | "WhatsApp") => {
        setShareChannel(channel);
        setShareRecipient(channel === "Email" ? shareEmail : sharePhone);
    };

    const handleSendShare = () => {
        if (!shareChannel || !shareRecipient.trim()) return;
        const recipient = shareRecipient.trim();
        if (shareChannel === "WhatsApp") {
            const cleanPhone = recipient.replace(/[^0-9]/g, "");
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener,noreferrer");
        } else if (shareChannel === "Email") {
            window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareMessage)}`;
        } else {
            window.location.href = `sms:${encodeURIComponent(recipient)}?body=${encodeURIComponent(shareMessage)}`;
        }
        setShowShareOptions(false);
    };

    const columns = [
        "Patient & ID",
        "Test & Sample",
        "Date",
        "Action Prints",
    ];

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 shadow-sm">
                            <HistoryEduOutlinedIcon />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Patient Report History
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Search patient to view all visit records, billing receipts, analysis completed sheets, and 6-month historical trends
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/reports/final")}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to Final Reports
                    </button>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <SearchIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by patient ID, name, report ID, sample ID, or test..."
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="relative">
                            <CalendarMonthOutlinedIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value as DateFilterOption);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium text-slate-700"
                            >
                                <option value="All">All Dates</option>
                                <option value="Today">Today</option>
                                <option value="Yesterday">Yesterday</option>
                                <option value="Last Month">Last Month (30 Days)</option>
                                <option value="Last 6 Months">Last 6 Months (Chronic / Sugar)</option>
                                <option value="Custom">Custom Date Range</option>
                            </select>
                        </div>

                        <div className="relative">
                            <FilterListIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />
                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="All">All Priorities</option>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="STAT">STAT</option>
                            </select>
                        </div>
                    </div>

                    {dateFilter === "Custom" && (
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-600">Custom Date Range:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">From:</span>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => {
                                        setCustomStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">To:</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => {
                                        setCustomEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}

                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-3 sm:p-5">
                        <div className="w-full min-w-0">
                            <Table
                                columns={columns}
                                data={currentData}
                                maxHeight="500px"
                                minWidth="0px"
                                maxWidth="100%"
                                centeredColumns={["Action Prints"]}
                                emptyMessage="No report history found matching criteria"
                                renderRow={(sample: StoredSample) => {
                                    const ext = asExtended(sample);

                                    return (
                                        <>
                                            <td className="w-[25%] px-3 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-800">
                                                        {sample.patientName}
                                                    </p>
                                                    <p className="truncate font-mono text-xs text-slate-500">
                                                        ID: {sample.patientId}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="w-[30%] px-3 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-700">
                                                        {sample.testName}
                                                    </p>
                                                    <p className="truncate text-[11px] text-slate-400">
                                                        {sample.sampleId} • {sample.sampleType || "Specimen"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="w-[25%] whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                                                {sample.reportGeneratedDate || ext?.collectionDate || "-"}
                                            </td>

                                            <td className="w-[20%] px-3 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReport(sample, "final")}
                                                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                                                        title="View Full Details"
                                                    >
                                                        <VisibilityOutlinedIcon fontSize="small" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openReport(sample, "billing")}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                                                        title="View Billing Receipt"
                                                    >
                                                        <ReceiptLongOutlinedIcon style={{ fontSize: 15 }} />
                                                        Print
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    );
                                }}
                            />
                        </div>

                        {filteredReports.length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <Pagination
                                    totalItems={filteredReports.length}
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

            {showDetails && selectedSample && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={closeReport} />
                    <div className="absolute right-0 top-0 flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Patient Whole Report & Document Suite
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Patient: <strong>{selectedSample.patientName}</strong> ({selectedSample.patientId}) • Total Reports: {patientAllReports.length}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeReport}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex border-b border-slate-200 px-6 bg-white gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveReportTab("final")}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${activeReportTab === "final"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                <DescriptionOutlinedIcon fontSize="small" />
                                1. Final Lab Report
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveReportTab("billing")}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${activeReportTab === "billing"
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                <ReceiptLongOutlinedIcon fontSize="small" />
                                2. Billing Receipt
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveReportTab("analysis")}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${activeReportTab === "analysis"
                                    ? "border-amber-600 text-amber-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                <BiotechOutlinedIcon fontSize="small" />
                                3. Analysis Work-Sheet
                            </button>

                            {patientAllReports.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveReportTab("trends")}
                                    className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${activeReportTab === "trends"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    <TrendingDownIcon fontSize="small" />
                                    4. Longitudinal Trends ({patientAllReports.length} Visits)
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {activeReportTab === "final" && (
                                <div className="rounded-xl border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 p-6 text-center">
                                        <h1 className="text-2xl font-bold text-slate-800">
                                            LABORATORY REPORT
                                        </h1>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Diagnostic Laboratory
                                        </p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-mono">
                                                Report ID: {selectedSample.reportId || "-"}
                                            </span>
                                            <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 font-semibold">
                                                Final Verified Report
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-b border-slate-200 p-6">
                                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                            Patient Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                                            <div>
                                                <p className="text-slate-400 font-semibold">Patient Name</p>
                                                <p className="mt-0.5 font-bold text-slate-800 text-sm">{selectedSample.patientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Patient ID</p>
                                                <p className="mt-0.5 font-bold text-blue-600 font-mono text-sm">{selectedSample.patientId}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Report Date</p>
                                                <p className="mt-0.5 font-medium text-slate-800">{selectedSample.reportGeneratedDate || "-"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-b border-slate-200 p-6">
                                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                            Test Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                                            <div>
                                                <p className="text-slate-400 font-semibold">Test</p>
                                                <p className="mt-0.5 font-medium text-slate-800 text-sm">{selectedSample.testName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Sample Type</p>
                                                <p className="mt-0.5 font-medium text-slate-800">{selectedSample.sampleType || "Blood"}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Sample ID</p>
                                                <p className="mt-0.5 font-mono text-slate-800">{selectedSample.sampleId}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-b border-slate-200 p-6">
                                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                            Test Results & Reference Ranges
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[500px] border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-xs text-slate-600 uppercase font-semibold">
                                                        <th className="border border-slate-200 px-4 py-3 text-left">Parameter</th>
                                                        <th className="border border-slate-200 px-4 py-3 text-left">Result</th>
                                                        <th className="border border-slate-200 px-4 py-3 text-left">Unit</th>
                                                        <th className="border border-slate-200 px-4 py-3 text-left">Reference Range</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const params = getParametersList(selectedSample);
                                                        return params.length ? (
                                                            params.map((parameter, index) => (
                                                                <tr key={index} className="text-xs hover:bg-slate-50">
                                                                    <td className="border border-slate-200 px-4 py-3 font-medium text-slate-800">{parameter.name || "-"}</td>
                                                                    <td className="border border-slate-200 px-4 py-3 font-bold font-mono text-slate-900">{parameter.value ?? "-"}</td>
                                                                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{parameter.unit || "-"}</td>
                                                                    <td className="border border-slate-200 px-4 py-3 font-mono text-slate-600">{parameter.referenceRange || "-"}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="border border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
                                                                    No result parameters available
                                                                </td>
                                                            </tr>
                                                        );
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>

                                        {selectedSample.resultRemarks && (
                                            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                                                <p className="font-semibold text-slate-600">Remarks:</p>
                                                <p className="mt-0.5 text-slate-700">{selectedSample.resultRemarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Verification */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                                            <div>
                                                <p className="text-slate-400 font-semibold">Verified By</p>
                                                <p className="mt-0.5 font-bold text-slate-800">{selectedSample.verificationBy || "Pathologist"}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Verified Date</p>
                                                <p className="mt-0.5 font-medium text-slate-800">{selectedSample.verificationDate || selectedSample.reportGeneratedDate || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeReportTab === "billing" && (
                                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
                                    <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">DIAGNOSTIC LABORATORY</h2>
                                            <p className="text-xs text-slate-500">Official Patient Billing Receipt</p>
                                        </div>
                                        <div className="text-right text-xs">
                                            <span className="font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">
                                                RECEIPT #{selectedSample.reportId}
                                            </span>
                                            <p className="text-slate-400 mt-1">{selectedSample.reportGeneratedDate || "Today"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                        <div>
                                            <p className="text-slate-400 font-semibold">Patient Name</p>
                                            <p className="font-bold text-slate-800">{selectedSample.patientName}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Patient ID</p>
                                            <p className="font-mono font-bold text-blue-600">{selectedSample.patientId}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Test Name</p>
                                            <p className="font-semibold text-slate-800">{selectedSample.testName}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Payment Status</p>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                                PAID
                                            </span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const extSample = asExtended(selectedSample);
                                        const totalAmt = extSample?.totalAmount ?? 950;
                                        const paidAmt = extSample?.paidAmount ?? totalAmt;
                                        return (
                                            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-100 uppercase text-[11px] text-slate-600 font-semibold">
                                                        <tr>
                                                            <th className="p-3">Investigation Description</th>
                                                            <th className="p-3 text-right">Fee</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        <tr>
                                                            <td className="p-3 font-medium">{selectedSample.testName}</td>
                                                            <td className="p-3 text-right font-mono font-bold">₹{totalAmt}</td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                                                        <tr>
                                                            <td className="p-3">Total Amount Paid</td>
                                                            <td className="p-3 text-right font-mono text-emerald-700 font-bold text-sm">
                                                                ₹{paidAmt}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        );
                                    })()}

                                    <p className="text-[11px] text-slate-400 text-center italic">
                                        Thank you. Computer generated billing receipt. Valid without physical signature.
                                    </p>
                                </div>
                            )}

                            {activeReportTab === "analysis" && (
                                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
                                    <div className="border-b pb-4 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">LABORATORY ANALYSIS WORK-SHEET</h2>
                                            <p className="text-xs text-slate-500">Accession, Processing & Instrument Audit</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                        <div>
                                            <p className="text-slate-400 font-semibold">Sample ID</p>
                                            <p className="font-mono font-bold text-slate-800">{selectedSample.sampleId}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Specimen Type</p>
                                            <p className="font-semibold text-slate-800">{selectedSample.sampleType || "Blood / Serum"}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Analysis Status</p>
                                            <span className="text-emerald-700 font-bold">COMPLETED</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold">Priority</p>
                                            <span className="font-semibold text-slate-800">{selectedSample.priority || "Normal"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Instrument Parameter Findings</h3>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                                                    <tr>
                                                        <th className="p-3">Parameter</th>
                                                        <th className="p-3">Value</th>
                                                        <th className="p-3">Reference Range</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {(() => {
                                                        const params = getParametersList(selectedSample);
                                                        return params.map((p, idx) => (
                                                            <tr key={idx}>
                                                                <td className="p-3 font-medium">{p.name || "-"}</td>
                                                                <td className="p-3 font-mono font-bold">{p.value ?? "-"} {p.unit || ""}</td>
                                                                <td className="p-3 text-slate-500 font-mono text-[11px]">{p.referenceRange || "-"}</td>
                                                            </tr>
                                                        ));
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t text-xs text-slate-500 flex justify-between">
                                        <span>Processed by: <strong>Technician / Instrument Operator</strong></span>
                                        <span>Verified: <strong>{selectedSample.verificationBy || "Chief Pathologist"}</strong></span>
                                    </div>
                                </div>
                            )}

                            {activeReportTab === "trends" && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-base font-bold">Longitudinal Patient History (Past Visits)</h3>
                                            <p className="text-xs text-blue-200 mt-0.5">
                                                Showing {patientAllReports.length} test records on file for {selectedSample.patientName} ({selectedSample.patientId})
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-mono font-semibold">
                                            Chronic Trend Check
                                        </span>
                                    </div>

                                    {parameterTrends.length > 0 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Recurring Test Parameter Comparison
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {parameterTrends.map((param, pIdx) => (
                                                    <div key={pIdx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-800">{param.name}</h5>
                                                                <p className="text-[10px] text-slate-500">Ref: {param.referenceRange}</p>
                                                            </div>
                                                            {param.isImproving ? (
                                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                                                                    <TrendingDownIcon style={{ fontSize: 13 }} /> Improved ({param.percentChange}%)
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                                    {param.readings.length} tests recorded
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                                                            {param.readings.map((r, rIdx) => (
                                                                <div key={rIdx} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                                                    <span className="text-slate-500 font-mono text-[11px]">{r.date.split(" ")[0]}</span>
                                                                    <span className="font-bold font-mono text-slate-800">{r.rawVal} {param.unit}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            No duplicate recurring parameters found across visits to plot trends.
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                            All Registered Visits Under This Patient
                                        </h4>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                                                    <tr>
                                                        <th className="p-3">Visit Date</th>
                                                        <th className="p-3">Report ID</th>
                                                        <th className="p-3">Test</th>
                                                        <th className="p-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {patientAllReports.map((r, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="p-3">{r.reportGeneratedDate || "-"}</td>
                                                            <td className="p-3 font-mono font-bold text-blue-600">{r.reportId || r.sampleId}</td>
                                                            <td className="p-3 font-medium">{r.testName}</td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                                    Final
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                            <button
                                type="button"
                                onClick={closeReport}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                                <ShareOutlinedIcon fontSize="small" />
                                Share
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <PrintOutlinedIcon fontSize="small" />
                                Print Current View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Container */}
            {selectedSample && (
                <div className="report-print-container">
                    <ReportPrint sample={selectedSample} />
                </div>
            )}

            {/* Share Modal */}
            {showShareOptions && selectedSample && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
                    onClick={() => setShowShareOptions(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="share-report-title"
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-5">
                            <div>
                                <h2 id="share-report-title" className="text-lg font-bold text-slate-900">Share patient report</h2>
                                <p className="mt-1 text-sm text-slate-600">{selectedSample.patientName} · {selectedSample.patientId}</p>
                            </div>
                            <button type="button" onClick={() => setShowShareOptions(false)} className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-slate-900" aria-label="Close share dialog">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" onClick={() => handleChannelShare("SMS")} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${shareChannel === "SMS" ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"}`}>
                                    <SmsOutlinedIcon /> <span className="text-sm font-semibold">SMS</span>
                                </button>
                                <button type="button" onClick={() => handleChannelShare("Email")} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${shareChannel === "Email" ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"}`}>
                                    <EmailOutlinedIcon /> <span className="text-sm font-semibold">Email</span>
                                </button>
                                <button type="button" onClick={() => handleChannelShare("WhatsApp")} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${shareChannel === "WhatsApp" ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-100" : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50/50"}`}>
                                    <WhatsAppIcon /> <span className="text-sm font-semibold">WhatsApp</span>
                                </button>
                            </div>

                            {shareChannel && (
                                <div className="space-y-4 border-t border-slate-100 pt-4">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        {shareChannel === "Email" ? "Patient email" : "Patient phone number"}
                                        <input
                                            type={shareChannel === "Email" ? "email" : "tel"}
                                            value={shareRecipient}
                                            onChange={(event) => setShareRecipient(event.target.value)}
                                            placeholder={shareChannel === "Email" ? "Enter patient email" : "Enter patient phone number"}
                                            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </label>
                                    {shareChannel === "Email" && (
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Subject
                                            <input value={shareSubject} onChange={(event) => setShareSubject(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                        </label>
                                    )}
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Message
                                        <textarea value={shareMessage} onChange={(event) => setShareMessage(event.target.value)} rows={5} className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal leading-relaxed text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                    </label>
                                    <p className="text-xs text-slate-500">Patient details are filled from the report and registration record. The message opens in your {shareChannel} app for you to review and send.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button type="button" onClick={() => setShowShareOptions(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                {shareChannel && (
                                    <button type="button" onClick={handleSendShare} disabled={!shareRecipient.trim()} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                        Continue to {shareChannel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default ReportHistory;

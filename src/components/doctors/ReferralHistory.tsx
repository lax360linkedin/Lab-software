import { useMemo, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import type { Doctor, Referral, ReferralStatus, } from "./Doctor";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type ReferralHistoryProps = {
    referrals: Referral[];
    doctors: Doctor[];
};

const statusStyles: Record<ReferralStatus, string> = {
    Registered: "bg-blue-50 text-blue-700 border-blue-200",
    "Sample Collected": "bg-purple-50 text-purple-700 border-purple-200",
    Processing: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const reportStatusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Generated: "bg-green-50 text-green-700 border-green-200",
    "Not Started": "bg-slate-50 text-slate-600 border-slate-200",
};

const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const getStatusLabel = (status: ReferralStatus) => status;

const getReportStatusClass = (status: string) =>
    reportStatusStyles[status] ??
    "bg-slate-50 text-slate-600 border-slate-200";

const getStatusClass = (status: ReferralStatus) =>
    statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

const ReferralHistory = ({
    referrals,
    doctors,
}: ReferralHistoryProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [doctorFilter, setDoctorFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState<"All" | ReferralStatus>("All",);
    const [reportStatusFilter, setReportStatusFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

    const filteredReferrals = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return referrals.filter((referral) => {
            const matchesSearch =
                !search ||
                referral.id.toLowerCase().includes(search) ||
                referral.patientId.toLowerCase().includes(search) ||
                referral.patientName.toLowerCase().includes(search) ||
                referral.doctorName.toLowerCase().includes(search) ||
                referral.tests.some((test) =>
                    test.toLowerCase().includes(search),
                );

            const matchesDoctor = doctorFilter === "All" || referral.doctorId === doctorFilter;
            const matchesStatus = statusFilter === "All" || referral.status === statusFilter;
            const matchesReportStatus = reportStatusFilter === "All" || referral.reportStatus === reportStatusFilter;
            const matchesFromDate = !fromDate || referral.referralDate >= fromDate;
            const matchesToDate = !toDate || referral.referralDate <= toDate;

            return (
                matchesSearch &&
                matchesDoctor &&
                matchesStatus &&
                matchesReportStatus &&
                matchesFromDate &&
                matchesToDate
            );
        });
    }, [
        referrals,
        searchTerm,
        doctorFilter,
        statusFilter,
        reportStatusFilter,
        fromDate,
        toDate,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReferrals.length / rowsPerPage),
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const currentReferrals = filteredReferrals.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage,
    );

    const totalReferrals = referrals.length;

    const completedReferrals = referrals.filter(
        (referral) => referral.status === "Completed",
    ).length;

    const processingReferrals = referrals.filter(
        (referral) => referral.status === "Processing",
    ).length;

    const cancelledReferrals = referrals.filter(
        (referral) => referral.status === "Cancelled",
    ).length;

    const clearFilters = () => {
        setSearchTerm("");
        setDoctorFilter("All");
        setStatusFilter("All");
        setReportStatusFilter("All");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    const hasFilters =
        searchTerm ||
        doctorFilter !== "All" ||
        statusFilter !== "All" ||
        reportStatusFilter !== "All" ||
        fromDate ||
        toDate;

    const columns = [
        "Referral ID",
        "Patient ID",
        "Patient Name",
        "Doctor",
        "Referral Date",
        "Tests",
        "Bill Amount",
        "Report Status",
        "Referral Status",
        "Actions",
    ];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Referrals
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        {totalReferrals}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Completed
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                        {completedReferrals}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Processing
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {processingReferrals}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Cancelled
                    </p>
                    <p className="mt-2 text-2xl font-bold text-red-600">
                        {cancelledReferrals}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Referral History
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Search and review previous doctor referrals and their
                        workflow status.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative xl:col-span-2">
                        <SearchOutlinedIcon
                            fontSize="small"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search referral, patient, doctor or test..."
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <select
                        value={doctorFilter}
                        onChange={(event) => {
                            setDoctorFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Doctors</option>

                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.doctorName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(
                                event.target.value as "All" | ReferralStatus,
                            );
                            setCurrentPage(1);
                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Referral Status</option>
                        <option value="Registered">Registered</option>
                        <option value="Sample Collected">
                            Sample Collected
                        </option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={reportStatusFilter}
                        onChange={(event) => {
                            setReportStatusFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Report Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Generated">Generated</option>
                        <option value="Not Started">Not Started</option>
                    </select>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) => {
                                setFromDate(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(event) => {
                                setToDate(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex items-end xl:col-span-2">
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Table
                    columns={columns}
                    data={currentReferrals}
                    maxHeight="500px"
                    renderRow={(referral: Referral) => (
                        <>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-blue-700">
                                {referral.id}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                {referral.patientId}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                                {referral.patientName}
                            </td>

                            <td className="min-w-[170px] px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {referral.doctorName}
                                    </p>
                                </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                {formatDate(referral.referralDate)}
                            </td>

                            <td className="max-w-[180px] px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                    {referral.tests.map((test) => (
                                        <span
                                            key={test}
                                            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                                        >
                                            {test}
                                        </span>
                                    ))}
                                </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">
                                {formatCurrency(referral.billAmount)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                                <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getReportStatusClass(
                                        referral.reportStatus,
                                    )}`}
                                >
                                    {referral.reportStatus}
                                </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                                <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                        referral.status,
                                    )}`}
                                >
                                    {getStatusLabel(referral.status)}
                                </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReferral(referral)}
                                    title="View Referral"
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <VisibilityOutlinedIcon fontSize="small" />
                                </button>
                            </td>
                        </>
                    )}
                />

                {filteredReferrals.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm font-medium text-slate-600">
                            No referral history found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filter criteria.
                        </p>
                    </div>
                )}

                {filteredReferrals.length > 0 && (
                    <div className="border-t border-slate-200 px-4 py-3">
                        <Pagination
                            totalItems={filteredReferrals.length}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={(value) => {
                                setRowsPerPage(value);
                                setCurrentPage(1);
                            }}
                            currentPage={safeCurrentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {selectedReferral && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setSelectedReferral(null)}
                    />

                    <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Referral Details
                                </p>

                                <h3 className="mt-1 text-lg font-semibold text-slate-800">
                                    {selectedReferral.id}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedReferral(null)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <CloseOutlinedIcon />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-slate-800">
                                        Patient Information
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Patient ID
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedReferral.patientId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Patient Name
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedReferral.patientName}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-slate-800">
                                        Referral Information
                                    </h4>

                                    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Doctor
                                            </span>
                                            <span className="text-right text-sm font-medium text-slate-700">
                                                {selectedReferral.doctorName}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Hospital / Clinic
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-slate-500">
                                                Referral Date
                                            </span>
                                            <span className="text-sm font-medium text-slate-700">
                                                {formatDate(selectedReferral.referralDate)}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-slate-800">
                                        Requested Tests
                                    </h4>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedReferral.tests.map((test) => (
                                            <span
                                                key={test}
                                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                                            >
                                                {test}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-slate-800">
                                        Billing Information
                                    </h4>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                                        <span className="text-sm text-slate-500">
                                            Bill Amount
                                        </span>

                                        <span className="text-lg font-bold text-slate-800">
                                            {formatCurrency(selectedReferral.billAmount)}
                                        </span>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-slate-800">
                                        Workflow Status
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <p className="text-xs text-slate-400">
                                                Referral Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                    selectedReferral.status,
                                                )}`}
                                            >
                                                {selectedReferral.status}
                                            </span>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <p className="text-xs text-slate-400">
                                                Report Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getReportStatusClass(
                                                    selectedReferral.reportStatus,
                                                )}`}
                                            >
                                                {selectedReferral.reportStatus}
                                            </span>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2">
                                            <p className="text-xs text-slate-400">
                                                Sample Status
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedReferral.sampleStatus || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 bg-white px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedReferral(null)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default ReferralHistory;
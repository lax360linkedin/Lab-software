import { useMemo, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Pagination from "../../common components/Pagination";
import Table from "../../common components/Table";
import type { Doctor } from "./Doctor";


export type Referral = {
    id: string;
    doctorId: string;
    patientId?: string;
    patientName?: string;
    referralDate?: string;
    status?: string;
};

type DoctorListProps = {
    doctors: Doctor[];
    referrals?: Referral[];
    onAddDoctor: () => void;
    onEditDoctor: (doctor: Doctor) => void;
    onToggleStatus: (doctorId: string) => void;
};

const DoctorList = ({
    doctors,
    referrals = [],
    onAddDoctor,
    onEditDoctor,
    onToggleStatus,
}: DoctorListProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const specializations = useMemo(() => {
        return Array.from(
            new Set(
                doctors
                    .map((doctor) => doctor.specialization)
                    .filter(Boolean)
            )
        ).sort();
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const matchesSearch =
                !search ||
                doctor.doctorName?.toLowerCase().includes(search) ||
                doctor.doctorCode?.toLowerCase().includes(search) ||
                doctor.id?.toLowerCase().includes(search) ||
                doctor.phone?.toLowerCase().includes(search) ||
                doctor.email?.toLowerCase().includes(search);

            const matchesSpecialization =
                specializationFilter === "All" ||
                doctor.specialization === specializationFilter;

            const matchesStatus =
                statusFilter === "All" ||
                doctor.status === statusFilter;

            return (
                matchesSearch &&
                matchesSpecialization &&
                matchesStatus
            );
        });
    }, [
        doctors,
        searchTerm,
        specializationFilter,
        statusFilter,
    ]);

    const totalPages = Math.ceil(
        filteredDoctors.length / rowsPerPage
    );

    const safeCurrentPage =
        totalPages > 0 && currentPage > totalPages
            ? totalPages
            : currentPage;

    const startIndex =
        (safeCurrentPage - 1) * rowsPerPage;

    const currentDoctors = filteredDoctors.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    const getReferralCount = (doctorId: string) => {
        return referrals.filter(
            (referral) => referral.doctorId === doctorId
        ).length;
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSpecializationChange = (value: string) => {
        setSpecializationFilter(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const columns = [
        "Doctor ID",
        "Doctor Name",
        "Specialization",
        "Phone",
        "Total Referrals",
        "Status",
        "Actions",
    ];

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Doctor List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage doctors and referral partners.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onAddDoctor}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            <AddOutlinedIcon fontSize="small" />
                            Add Doctor
                        </button>

                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                        <div className="relative xl:col-span-2">

                            <SearchOutlinedIcon
                                fontSize="small"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    handleSearchChange(event.target.value)
                                }
                                placeholder="Search doctor, code, phone or email..."
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        <select
                            value={specializationFilter}
                            onChange={(event) =>
                                handleSpecializationChange(event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="All">
                                All Specializations
                            </option>

                            {specializations.map((specialization) => (
                                <option
                                    key={specialization}
                                    value={specialization}
                                >
                                    {specialization}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                handleStatusChange(event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="All">
                                All Status
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>

                    </div>
                </div>

                <div className="p-3 sm:p-5">

                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={currentDoctors}
                            maxHeight="400px"
                            renderRow={(doctor: Doctor) => (
                                <>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-600">
                                        {doctor.id}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                {doctor.doctorName}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {doctor.doctorCode}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {doctor.specialization}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {doctor.phone || "-"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-slate-700">
                                        {getReferralCount(doctor.id)}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${doctor.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {doctor.status}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex items-center gap-1">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedDoctor(doctor)
                                                }
                                                title="View Doctor"
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEditDoctor(doctor)
                                                }
                                                title="Edit Doctor"
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onToggleStatus(doctor.id)
                                                }
                                                title={
                                                    doctor.status === "Active"
                                                        ? "Deactivate Doctor"
                                                        : "Activate Doctor"
                                                }
                                                className={`rounded-lg p-2 transition ${doctor.status === "Active"
                                                        ? "text-emerald-600 hover:bg-emerald-50"
                                                        : "text-slate-400 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {doctor.status === "Active" ? (
                                                    <ToggleOnOutlinedIcon fontSize="small" />
                                                ) : (
                                                    <ToggleOffOutlinedIcon fontSize="small" />
                                                )}
                                            </button>

                                        </div>
                                    </td>
                                </>
                            )}
                        />
                    </div>

                    {currentDoctors.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm font-medium text-slate-600">
                                No doctors found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try changing your search or filter.
                            </p>
                        </div>
                    )}

                    {filteredDoctors.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <Pagination
                                totalItems={filteredDoctors.length}
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
            </div>

            {selectedDoctor && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => setSelectedDoctor(null)}
                    />

                    <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Doctor Details
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {selectedDoctor.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedDoctor(null)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseOutlinedIcon />
                            </button>

                        </div>

                        <div className="space-y-6 p-5">

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-start gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                                        {selectedDoctor.doctorName
                                            ?.replace("Dr. ", "")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">

                                        <h3 className="text-base font-semibold text-slate-800">
                                            {selectedDoctor.doctorName}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedDoctor.specialization}
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${selectedDoctor.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-200 text-slate-600"
                                                }`}
                                        >
                                            {selectedDoctor.status}
                                        </span>

                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Contact Information
                                </h3>

                                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Doctor Code
                                        </span>

                                        <span className="text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.doctorCode}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Phone
                                        </span>

                                        <span className="text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.phone || "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Email
                                        </span>

                                        <span className="break-all text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.email || "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Address
                                        </span>

                                        <span className="text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.address || "-"}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Referral Information
                                </h3>

                                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Referral Type
                                        </span>

                                        <span className="text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.referralType || "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Commission
                                        </span>

                                        <span className="text-right text-sm font-medium text-slate-700">
                                            {selectedDoctor.commissionApplicable
                                                ? "Applicable"
                                                : "Not Applicable"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 p-4">
                                        <span className="text-sm text-slate-500">
                                            Total Referrals
                                        </span>

                                        <span className="text-right text-sm font-semibold text-blue-600">
                                            {getReferralCount(selectedDoctor.id)}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {selectedDoctor.notes && (
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                        Notes
                                    </h3>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm leading-6 text-slate-600">
                                            {selectedDoctor.notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 border-t border-slate-200 pt-5">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDoctor(null);
                                        onEditDoctor(selectedDoctor);
                                    }}
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Edit Doctor
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onToggleStatus(selectedDoctor.id);

                                        setSelectedDoctor({
                                            ...selectedDoctor,
                                            status:
                                                selectedDoctor.status === "Active"
                                                    ? "Inactive"
                                                    : "Active",
                                        });
                                    }}
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    {selectedDoctor.status === "Active"
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>

                            </div>

                        </div>
                    </aside>
                </>
            )}
        </>
    );
};

export default DoctorList;
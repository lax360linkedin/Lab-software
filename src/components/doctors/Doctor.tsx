import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorList from "./DoctorList";
import AddDoctor from "./AddDoctor";
import ReferredPatients from "./ReferredPatients";
import ReferralHistory from "./ReferralHistory";

export type DoctorStatus = "Active" | "Inactive";

type DoctorsProps = {
    initialTab?: "list" | "add" | "referred" | "history";
};

export type Doctor = {
    id: string;
    doctorCode: string;
    doctorName: string;
    specialization: string;
    phone: string;
    email: string;
    address: string;
    referralType: string;
    commissionApplicable: boolean;
    notes: string;
    status: DoctorStatus;
    createdAt: string;
    hospitalClinic?: string;
};

export type ReferralStatus =
    | "Registered"
    | "Sample Collected"
    | "Processing"
    | "Completed"
    | "Cancelled";

export type Referral = {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    referralDate: string;
    tests: string[];
    billAmount: number;
    sampleStatus: string;
    reportStatus: string;
    status: ReferralStatus;
};

export const DOCTOR_STORAGE_KEY = "lab_doctors";
export const REFERRAL_STORAGE_KEY = "lab_referrals";

const defaultDoctors: Doctor[] = [
    {
        id: "DOC-001",
        doctorCode: "DR-001",
        doctorName: "Dr. Arun Kumar",
        specialization: "General Medicine",
        phone: "9876543210",
        email: "arun.kumar@example.com",
        address: "Coimbatore",
        referralType: "External Referral",
        commissionApplicable: false,
        notes: "",
        status: "Active",
        createdAt: "2026-09-20T10:00:00.000Z",
    },
    {
        id: "DOC-002",
        doctorCode: "DR-002",
        doctorName: "Dr. Priya Sharma",
        specialization: "Cardiology",
        phone: "9876543211",
        email: "priya.sharma@example.com",
        address: "Coimbatore",
        referralType: "External Referral",
        commissionApplicable: false,
        notes: "",
        status: "Active",
        createdAt: "2026-09-21T10:00:00.000Z",
    },
    {
        id: "DOC-003",
        doctorCode: "DR-003",
        doctorName: "Dr. Suresh Kumar",
        specialization: "Pediatrics",
        phone: "9876543212",
        email: "suresh.kumar@example.com",
        address: "Tiruppur",
        referralType: "External Referral",
        commissionApplicable: false,
        notes: "",
        status: "Active",
        createdAt: "2026-09-22T10:00:00.000Z",
    },
    {
        id: "DOC-004",
        doctorCode: "DR-004",
        doctorName: "Dr. Meena Raj",
        specialization: "Gynecology",
        phone: "9876543213",
        email: "meena.raj@example.com",
        address: "Coimbatore",
        referralType: "External Referral",
        commissionApplicable: false,
        notes: "",
        status: "Active",
        createdAt: "2026-09-23T10:00:00.000Z",
    },
];

const defaultReferrals: Referral[] = [
    {
        id: "REF-0001",
        patientId: "PAT-10001",
        patientName: "Raj Kumar",
        doctorId: "DOC-001",
        doctorName: "Dr. Arun Kumar",
        referralDate: "2026-09-28",
        tests: ["CBC", "LFT"],
        billAmount: 1100,
        sampleStatus: "Collected",
        reportStatus: "Pending",
        status: "Sample Collected",
    },
    {
        id: "REF-0002",
        patientId: "PAT-10002",
        patientName: "Priya Devi",
        doctorId: "DOC-002",
        doctorName: "Dr. Priya Sharma",
        referralDate: "2026-09-28",
        tests: ["FBS", "TSH"],
        billAmount: 520,
        sampleStatus: "Received",
        reportStatus: "Pending",
        status: "Processing",
    },
    {
        id: "REF-0003",
        patientId: "PAT-10003",
        patientName: "Karthik Raj",
        doctorId: "DOC-003",
        doctorName: "Dr. Suresh Kumar",
        referralDate: "2026-09-27",
        tests: ["CBC"],
        billAmount: 350,
        sampleStatus: "Accepted",
        reportStatus: "Generated",
        status: "Completed",
    },
];

const getStoredDoctors = (): Doctor[] => {
    try {
        const stored = localStorage.getItem(DOCTOR_STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored);
        }

        localStorage.setItem(
            DOCTOR_STORAGE_KEY,
            JSON.stringify(defaultDoctors)
        );

        return defaultDoctors;
    } catch {
        return defaultDoctors;
    }
};

const getStoredReferrals = (): Referral[] => {
    try {
        const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored);
        }

        localStorage.setItem(
            REFERRAL_STORAGE_KEY,
            JSON.stringify(defaultReferrals)
        );

        return defaultReferrals;
    } catch {
        return defaultReferrals;
    }
};

const Doctors = ({ initialTab = "list" }: DoctorsProps) => {
    const [doctors, setDoctors] = useState<Doctor[]>( () => getStoredDoctors() );
    const [referrals,] = useState<Referral[]>( () => getStoredReferrals());
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const initialActiveTab =
        tabFromUrl === "referred"
            ? "referred"
            : tabFromUrl === "history"
                ? "history"
                : initialTab;
    const [activeTab, setActiveTab] = useState< "list" | "add" | "referred" | "history" >(initialActiveTab);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const handleSaveDoctor = (doctor: Doctor) => {
        let updatedDoctors: Doctor[];

        const existingDoctor = doctors.some(
            (item) => item.id === doctor.id
        );

        if (existingDoctor) {
            updatedDoctors = doctors.map((item) =>
                item.id === doctor.id ? doctor : item
            );
        } else {
            updatedDoctors = [...doctors, doctor];
        }

        setDoctors(updatedDoctors);

        localStorage.setItem(
            DOCTOR_STORAGE_KEY,
            JSON.stringify(updatedDoctors)
        );

        setEditingDoctor(null);
        setActiveTab("list");
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        setActiveTab("add");
    };

    const handleAddDoctor = () => {
        setEditingDoctor(null);
        setActiveTab("add");
    };

    const handleCancelDoctor = () => {
        setEditingDoctor(null);
        setActiveTab("list");
    };

    const handleDeleteDoctor = (doctorId: string) => {
        const updatedDoctors = doctors.filter((doctor) => doctor.id !== doctorId);
        setDoctors(updatedDoctors);
        localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(updatedDoctors));
    };

    const handleToggleDoctorStatus = (doctorId: string) => {
        const updatedDoctors: Doctor[] = doctors.map((doctor) => {
            if (doctor.id !== doctorId) {
                return doctor;
            }

            return {
                ...doctor,
                status:
                    doctor.status === "Active"
                        ? "Inactive"
                        : "Active",
            };
        });

        setDoctors(updatedDoctors);

        localStorage.setItem(
            DOCTOR_STORAGE_KEY,
            JSON.stringify(updatedDoctors)
        );
    };
    const handleUpdateReferrals = (
        updatedReferrals: Referral[]
    ) => {
        localStorage.setItem(
            REFERRAL_STORAGE_KEY,
            JSON.stringify(updatedReferrals)
        );
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">
                            Doctors
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage doctors and referral information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddDoctor}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + Add Doctor
                    </button>

                </div>
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex min-w-max border-b border-slate-200">

                    {/* Doctor List */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDoctor(null);
                            setActiveTab("list");
                        }}
                        className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${activeTab === "list"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                    >
                        Doctor List
                    </button>

                    {/* Add Doctor */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDoctor(null);
                            setActiveTab("add");
                        }}
                        className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${activeTab === "add"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                    >
                        {editingDoctor ? "Edit Doctor" : "Add Doctor"}
                    </button>

                    {/* Referred Patients */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDoctor(null);
                            setActiveTab("referred");
                        }}
                        className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${activeTab === "referred"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                    >
                        Referred Patients
                    </button>

                    {/* Referral History */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDoctor(null);
                            setActiveTab("history");
                        }}
                        className={`border-b-2 px-5 py-3.5 text-sm font-medium transition ${activeTab === "history"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                    >
                        Referral History
                    </button>

                </div>
            </div>

            {/* Content */}
            <div>

                {activeTab === "list" && (
                    <DoctorList
                        doctors={doctors}
                        referrals={referrals}
                        onAddDoctor={handleAddDoctor}
                        onEditDoctor={handleEditDoctor}
                        onToggleStatus={handleToggleDoctorStatus}
                        onDeleteDoctor={handleDeleteDoctor}
                    />
                )}

                {activeTab === "add" && (
                    <AddDoctor
                        key={editingDoctor?.id ?? "new-doctor"}
                        editingDoctor={editingDoctor}
                        onSave={handleSaveDoctor}
                        onCancel={handleCancelDoctor}
                    />
                )}

                {activeTab === "referred" && (
                    <ReferredPatients
                        referrals={referrals}
                        doctors={doctors}
                        onUpdateReferrals={handleUpdateReferrals}
                    />
                )}

                {activeTab === "history" && (
                    <ReferralHistory
                        referrals={referrals}
                        doctors={doctors}
                    />
                )}

            </div>

        </div>
    );
};
export default Doctors;
import { useState } from "react";
import type { Doctor } from "./Doctor";

type AddDoctorProps = {
    editingDoctor: Doctor | null;
    onSave: (doctor: Doctor) => void;
    onCancel: () => void;
};

const getInitialFormData = (doctor: Doctor | null) => {
    if (!doctor) {
        return {
            doctorCode: "",
            doctorName: "",
            specialization: "",
            hospitalClinic: "",
            phone: "",
            email: "",
            address: "",
            referralType: "External Referral",
            commissionApplicable: false,
            notes: "",
        };
    }

    return {
        doctorCode: doctor.doctorCode,
        doctorName: doctor.doctorName,
        specialization: doctor.specialization,
        phone: doctor.phone,
        email: doctor.email,
        address: doctor.address,
        referralType: doctor.referralType,
        commissionApplicable: doctor.commissionApplicable,
        notes: doctor.notes,
    };
};

const AddDoctor = ({
    editingDoctor,
    onSave,
    onCancel,
}: AddDoctorProps) => {
    const initialForm = getInitialFormData(editingDoctor);
    const [doctorCode, setDoctorCode] = useState(initialForm.doctorCode);
    const [doctorName, setDoctorName] = useState(initialForm.doctorName);
    const [specialization, setSpecialization] = useState(initialForm.specialization);
    const [hospitalClinic, setHospitalClinic] = useState(initialForm.hospitalClinic);
    const [phone, setPhone] = useState(initialForm.phone);
    const [email, setEmail] = useState(initialForm.email);
    const [address, setAddress] = useState(initialForm.address);
    const [referralType, setReferralType] = useState(initialForm.referralType);
    const [commissionApplicable, setCommissionApplicable] = useState(initialForm.commissionApplicable);
    const [notes, setNotes] = useState(initialForm.notes);
    const isEditing = Boolean(editingDoctor);

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !doctorName.trim() ||
            !specialization.trim() ||
            !phone.trim()
        ) {
            alert(
                "Please fill all required fields."
            );
            return;
        }

        if (
            phone.trim().length < 10
        ) {
            alert(
                "Please enter a valid phone number."
            );
            return;
        }

        if (
            email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.trim()
            )
        ) {
            alert(
                "Please enter a valid email address."
            );
            return;
        }

        const doctor: Doctor = {
            id:
                editingDoctor?.id ??
                `DOC-${Date.now()}`,

            doctorCode:
                doctorCode.trim() ||
                `DR-${Date.now()}`,

            doctorName: doctorName.trim(),

            specialization:
                specialization.trim(),

            phone: phone.trim(),

            email: email.trim(),

            address: address.trim(),

            referralType,

            commissionApplicable,

            notes: notes.trim(),

            status:
                editingDoctor?.status ??
                "Active",

            createdAt:
                editingDoctor?.createdAt ??
                new Date().toISOString(),
        };

        onSave(doctor);
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            {isEditing
                                ? "Edit Doctor"
                                : "Add New Doctor"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEditing
                                ? "Update doctor and referral information."
                                : "Register a doctor or referral partner for the laboratory."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to Doctor List
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-800">
                            Doctor Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Enter the doctor's basic professional
                            information.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                        {/* Doctor Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Doctor Name{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={doctorName}
                                onChange={(event) =>
                                    setDoctorName(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Dr. Arun Kumar"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Doctor Code */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Doctor Code
                            </label>

                            <input
                                type="text"
                                value={doctorCode}
                                onChange={(event) =>
                                    setDoctorCode(
                                        event.target.value.toUpperCase()
                                    )
                                }
                                placeholder="e.g. DR-001"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Leave blank to generate automatically.
                            </p>
                        </div>

                        {/* Specialization */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Specialization{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={specialization}
                                onChange={(event) =>
                                    setSpecialization(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. General Medicine"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Hospital / Clinic */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Hospital / Clinic
                            </label>

                            <input
                                type="text"
                                value={hospitalClinic}
                                onChange={(event) =>
                                    setHospitalClinic(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. ABC Hospital"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Phone{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(
                                        event.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                maxLength={15}
                                placeholder="e.g. 9876543210"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. doctor@example.com"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Address
                            </label>

                            <textarea
                                value={address}
                                onChange={(event) =>
                                    setAddress(
                                        event.target.value
                                    )
                                }
                                rows={3}
                                placeholder="Enter hospital, clinic or contact address"
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-800">
                            Referral Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Configure how this doctor is associated
                            with patient referrals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                        {/* Referral Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Referral Type
                            </label>

                            <select
                                value={referralType}
                                onChange={(event) =>
                                    setReferralType(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="External Referral">
                                    External Referral
                                </option>

                                <option value="Internal Referral">
                                    Internal Referral
                                </option>

                                <option value="Hospital Referral">
                                    Hospital Referral
                                </option>

                                <option value="Clinic Referral">
                                    Clinic Referral
                                </option>
                            </select>
                        </div>

                        {/* Commission */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Referral Commission
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5">
                                <input
                                    type="checkbox"
                                    checked={commissionApplicable}
                                    onChange={(event) =>
                                        setCommissionApplicable(
                                            event.target.checked
                                        )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <span className="text-sm text-slate-700">
                                    Commission applicable
                                </span>
                            </label>
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Notes
                            </label>

                            <textarea
                                value={notes}
                                onChange={(event) =>
                                    setNotes(
                                        event.target.value
                                    )
                                }
                                rows={4}
                                placeholder="Add any additional notes about this doctor or referral..."
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {editingDoctor && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Doctor Status
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Doctor status can be changed from the
                                    Doctor List.
                                </p>
                            </div>

                            <span
                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${editingDoctor.status ===
                                        "Active"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                            >
                                {editingDoctor.status}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        {isEditing
                            ? "Update Doctor"
                            : "Save Doctor"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDoctor;
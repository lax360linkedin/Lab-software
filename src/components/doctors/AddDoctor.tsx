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
        hospitalClinic: doctor.hospitalClinic ?? "",
        phone: doctor.phone,
        email: doctor.email,
        address: doctor.address,
        referralType: doctor.referralType,
        commissionApplicable: doctor.commissionApplicable,
        notes: doctor.notes,
    };
};

const compressDoctorPhoto = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
            const maxSize = 480;
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            const context = canvas.getContext("2d");
            URL.revokeObjectURL(objectUrl);
            if (!context) {
                reject(new Error("Could not process this image."));
                return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Could not read this image."));
        };
        image.src = objectUrl;
    });

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
    const [photoUrl, setPhotoUrl] = useState(editingDoctor?.photoUrl ?? "");
    const [photoError, setPhotoError] = useState("");
    const isEditing = Boolean(editingDoctor);

    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !doctorName.trim() ||
            !specialization.trim() ||
            !phone.trim()
        ) {
            showToast(
                "Please fill all required fields."
            );
            return;
        }

        if (
            phone.trim().length < 10
        ) {
            showToast(
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
            showToast(
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

            photoUrl,
            hospitalClinic: hospitalClinic.trim(),

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
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="doctor-photo">
                                Doctor Photo
                            </label>
                            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xl font-bold text-blue-700 ring-1 ring-inset ring-blue-100">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Doctor preview" className="h-full w-full object-cover" />
                                    ) : (
                                        doctorName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DR"
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <input
                                        id="doctor-photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={async (event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            if (!file.type.startsWith("image/")) {
                                                setPhotoError("Choose an image file.");
                                                return;
                                            }
                                            if (file.size > 10 * 1024 * 1024) {
                                                setPhotoError("Choose an image smaller than 10 MB.");
                                                return;
                                            }
                                            try {
                                                setPhotoError("");
                                                setPhotoUrl(await compressDoctorPhoto(file));
                                            } catch {
                                                setPhotoError("Could not load this image. Try another file.");
                                            }
                                            event.target.value = "";
                                        }}
                                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">Upload a professional headshot. JPG, PNG, or WEBP up to 10 MB.</p>
                                    {photoError && <p className="mt-1 text-xs text-red-600">{photoError}</p>}
                                    {photoUrl && (
                                        <button type="button" onClick={() => setPhotoUrl("")} className="mt-2 text-xs font-medium text-red-600 hover:text-red-700">
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                    <span className="text-red-500">*</span>
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

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl transition-all">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default AddDoctor;
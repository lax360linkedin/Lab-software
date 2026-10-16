import { useState, type ChangeEvent, type FormEvent } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { useTheme, DEFAULT_AVATAR } from "../../context/ThemeContext";
type Role = "admin" | "receptionist" | "lab_technician" | string;
type Tab = "profile" | "security";
export interface ProfileData {
    avatarUrl: string;
    fullName: string;
    labName: string;
    email: string;
    phone: string;
    address: string;
    role: Role;
    employeeId: string;
    department: string;
    joiningDate: string;
}
type StoredAccount = Record<string, unknown>;
const EMPTY_PROFILE: ProfileData = {
    avatarUrl: DEFAULT_AVATAR,
    fullName: "",
    labName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    employeeId: "",
    department: "",
    joiningDate: "",
};
type PasswordFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    placeholder: string;
    autoComplete: string;
};
const PasswordField = ({
    label,
    value,
    onChange,
    visible,
    onToggle,
    placeholder,
    autoComplete,
}: PasswordFieldProps) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
        </label>
        <div className="relative">
            <input
                type={visible ? "text" : "password"}
                required
                minLength={label === "Current Password" ? undefined : 8}
                autoComplete={autoComplete}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 placeholder:text-slate-400"
            />
            <button
                type="button"
                onClick={onToggle}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
                {visible ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                )}
            </button>
        </div>
    </div>
);
const readStorageObject = (key: string): StoredAccount => {
    try {
        const value = localStorage.getItem(key);
        const parsed: unknown = value ? JSON.parse(value) : {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as StoredAccount)
            : {};
    } catch {
        return {};
    }
};
const getString = (source: StoredAccount, ...keys: string[]): string => {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return "";
};
const getRoleBadge = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes("admin")) {
        return {
            label: "Administrator",
            className: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-100",
            dotColor: "bg-purple-500",
        };
    }
    if (lower.includes("reception")) {
        return {
            label: "Front Desk Receptionist",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100",
            dotColor: "bg-emerald-500",
        };
    }
    if (lower.includes("tech")) {
        return {
            label: "Lab Technician",
            className: "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-100",
            dotColor: "bg-amber-500",
        };
    }
    return {
        label: role ? role.charAt(0).toUpperCase() + role.slice(1) : "Staff Member",
        className: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100",
        dotColor: "bg-blue-500",
    };
};
const getInitialProfile = (): ProfileData => {
    // Hydrate across signup, user sessions and saved profile
    const signup = readStorageObject("lab_signup_data");
    const loggedInUser = readStorageObject("lab_user");
    const medlabUser = readStorageObject("medlab_user");
    const medlabLab = readStorageObject("medlab_lab");
    const savedProfile = readStorageObject("app_user_profile");
    const email =
        getString(loggedInUser, "email") ||
        getString(medlabUser, "email") ||
        getString(signup, "email", "adminEmail") ||
        getString(savedProfile, "email");
    const sameAccount =
        !getString(savedProfile, "email") ||
        getString(savedProfile, "email").toLowerCase() === email.toLowerCase();
    return {
        ...EMPTY_PROFILE,
        ...savedProfile,
        avatarUrl: getString(savedProfile, "avatarUrl") || DEFAULT_AVATAR,
        fullName:
            getString(loggedInUser, "fullName", "name", "adminName") ||
            getString(medlabUser, "name", "fullName") ||
            getString(signup, "adminName", "fullName", "name") ||
            (sameAccount ? getString(savedProfile, "fullName") : "") ||
            "Dr. Rajesh Sharma, MD",
        labName:
            getString(signup, "labName") ||
            getString(medlabLab, "name", "labName") ||
            (sameAccount ? getString(savedProfile, "labName") : "") ||
            "Apex Clinical Diagnostic Center",
        email: email || "admin@apexdiagnostics.com",
        phone:
            getString(loggedInUser, "phone") ||
            getString(medlabUser, "phone") ||
            getString(signup, "phone", "labPhone") ||
            (sameAccount ? getString(savedProfile, "phone") : "") ||
            "+91 98765 43210",
        address:
            getString(signup, "address", "labAddress") ||
            getString(medlabLab, "address") ||
            (sameAccount ? getString(savedProfile, "address") : "") ||
            "Plot No 42, Medical Enclave, Ring Road",
        role:
            getString(loggedInUser, "role") ||
            getString(medlabUser, "role") ||
            getString(signup, "role") ||
            (sameAccount ? getString(savedProfile, "role") : "") ||
            "admin",
        employeeId:
            (sameAccount ? getString(savedProfile, "employeeId") : "") ||
            (getString(loggedInUser, "id") ? `EMP-${getString(loggedInUser, "id")}` : "EMP-001"),
        department:
            (sameAccount ? getString(savedProfile, "department") : "") ||
            "Pathology & Laboratory Administration",
        joiningDate:
            (sameAccount ? getString(savedProfile, "joiningDate") : "") ||
            "15 Jan 2024",
    };
};
export default function Profile() {
    const { accentColor } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [profileData, setProfileData] = useState<ProfileData>(getInitialProfile);
    const [editFormData, setEditFormData] = useState<ProfileData>(getInitialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastError, setToastError] = useState(false);
    // Password fields & visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // Forgot password states
    const [forgotEmail, setForgotEmail] = useState(profileData.email);
    const [forgotMessage, setForgotMessage] = useState("");
    const [forgotError, setForgotError] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const showToast = (message: string, error = false) => {
        setToastMsg(message);
        setToastError(error);
        window.setTimeout(() => setToastMsg(""), 3800);
    };
    const handleOpenEdit = () => {
        setEditFormData(profileData);
        setIsEditing(true);
    };
    const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("Please select a valid image file.", true);
            event.target.value = "";
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("Choose an image smaller than 2 MB.", true);
            event.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                setEditFormData((current) => ({
                    ...current,
                    avatarUrl: reader.result as string,
                }));
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };
    const handleSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const updated: ProfileData = {
            ...editFormData,
            fullName: editFormData.fullName.trim(),
            labName: editFormData.labName.trim(),
            email: editFormData.email.trim(),
            phone: editFormData.phone.trim(),
            address: editFormData.address.trim(),
        };
        setProfileData(updated);
        localStorage.setItem("app_user_profile", JSON.stringify(updated));
        // Synchronize with stored accounts for consistent app-wide state
        const signup = readStorageObject("lab_signup_data");
        const signedIn = readStorageObject("lab_user");
        const medlabUser = readStorageObject("medlab_user");
        if (getString(signup, "email").toLowerCase() === updated.email.toLowerCase()) {
            localStorage.setItem(
                "lab_signup_data",
                JSON.stringify({
                    ...signup,
                    adminName: updated.fullName,
                    labName: updated.labName,
                    email: updated.email,
                    phone: updated.phone,
                    address: updated.address,
                    role: updated.role,
                })
            );
        }
        if (getString(signedIn, "email").toLowerCase() === updated.email.toLowerCase()) {
            localStorage.setItem(
                "lab_user",
                JSON.stringify({
                    ...signedIn,
                    fullName: updated.fullName,
                    name: updated.fullName,
                    email: updated.email,
                    phone: updated.phone,
                    role: updated.role,
                })
            );
        }
        if (getString(medlabUser, "email").toLowerCase() === updated.email.toLowerCase()) {
            localStorage.setItem(
                "medlab_user",
                JSON.stringify({
                    ...medlabUser,
                    name: updated.fullName,
                    email: updated.email,
                    phone: updated.phone,
                    role: updated.role,
                })
            );
        }
        setIsEditing(false);
        showToast("Profile details updated successfully.");
    };
    const handleChangePassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newPassword.length < 8) {
            showToast("New password must contain at least 8 characters.", true);
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New password and confirmation do not match.", true);
            return;
        }
        const signup = readStorageObject("lab_signup_data");
        const savedPass = getString(signup, "password", "adminPassword");
        if (savedPass && savedPass !== currentPassword) {
            showToast("Current password is incorrect.", true);
            return;
        }
        // Demo fallback & local persistence
        localStorage.setItem(
            "lab_signup_data",
            JSON.stringify({
                ...signup,
                password: newPassword,
                adminPassword: newPassword,
            })
        );
        localStorage.setItem("medlab_password_last_changed", new Date().toISOString());
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully! Your credentials are now active.");
    };
    const handleForgotPassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = forgotEmail.trim().toLowerCase();
        const signup = readStorageObject("lab_signup_data");
        const signedIn = readStorageObject("lab_user");
        const medlabUser = readStorageObject("medlab_user");
        const knownEmail =
            getString(signup, "email", "adminEmail").toLowerCase() === email ||
            getString(signedIn, "email").toLowerCase() === email ||
            getString(medlabUser, "email").toLowerCase() === email ||
            profileData.email.toLowerCase() === email;
        if (!email) {
            setForgotError(true);
            setForgotMessage("Please enter your account email address.");
            return;
        }
        if (!knownEmail) {
            setForgotError(false);
            setForgotMessage(
                "If this email is associated with a laboratory account, password reset instructions will be dispatched."
            );
            return;
        }
        setForgotError(false);
        setForgotMessage(
            `Password reset link dispatched to ${email}. Check your inbox to complete recovery.`
        );
    };
    const roleInfo = getRoleBadge(profileData.role);
    // Dynamic password checklist
    const hasMinLen = newPassword.length >= 8;
    const hasNum = /[0-9]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const isMatching = Boolean(confirmPassword && newPassword === confirmPassword);
    return (
        <div className="min-h-full space-y-6 bg-slate-50/60 px-4 py-6 sm:px-6 lg:px-8">
            
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <span>Laboratory Portal</span>
                        <span>•</span>
                        <span>Account Center</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                        My Profile & Credentials
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View and manage your registered laboratory profile, personal details, and sign-in security.
                    </p>
                </div>
            </div>
            {/* Profile Hero Banner */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                {/* Accent Ribbon */}
                <div className="h-2.5 w-full" style={{ backgroundColor: accentColor }} />
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        
                        {/* Avatar & Key Metadata */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                            <div className="relative group">
                                <img
                                    src={profileData.avatarUrl || DEFAULT_AVATAR}
                                    alt={profileData.fullName || "User Profile"}
                                    className="h-24 w-24 rounded-2xl border-2 border-slate-100 object-cover shadow-sm ring-4 ring-slate-50"
                                />
                                <button
                                    type="button"
                                    onClick={handleOpenEdit}
                                    title="Change Photo"
                                    className="absolute -bottom-1.5 -right-1.5 rounded-xl bg-white p-2 text-slate-600 shadow-md border border-slate-200 hover:bg-slate-50 transition"
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                        {profileData.fullName || "Staff Member"}
                                    </h2>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${roleInfo.className}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dotColor}`} />
                                        {roleInfo.label}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 font-mono">
                                    {profileData.email || "Email not registered"}
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-600">
                                    {profileData.labName && (
                                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 font-medium">
                                            <BusinessOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-500" />
                                            <span>{profileData.labName}</span>
                                        </div>
                                    )}
                                    {profileData.employeeId && (
                                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 font-mono font-medium">
                                            <BadgeOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-500" />
                                            <span>ID: {profileData.employeeId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Edit Profile Action */}
                        <div className="flex justify-center md:justify-end">
                            <button
                                type="button"
                                onClick={handleOpenEdit}
                                style={{ backgroundColor: accentColor }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
                            >
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "profile"
                            ? "bg-slate-100 text-slate-900 shadow-xs"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                    style={
                        activeTab === "profile"
                            ? { color: accentColor }
                            : undefined
                    }
                >
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                    Profile Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "security"
                            ? "bg-slate-100 text-slate-900 shadow-xs"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                    style={
                        activeTab === "security"
                            ? { color: accentColor }
                            : undefined
                    }
                >
                    <LockOutlinedIcon sx={{ fontSize: 18 }} />
                    Password & Security
                </button>
            </div>
            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === "profile" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left 2 Cols: Personal & Contact Information */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <PersonOutlineOutlinedIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Personal & Contact Information
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Registered identity details captured during lab signup and verification.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Full Name */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Full Name
                                </span>
                                <span className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                                    <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} className="text-slate-400" />
                                    {profileData.fullName || "Not specified"}
                                </span>
                            </div>
                            {/* Registered Email */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Registered Email
                                </span>
                                <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 break-all font-mono">
                                    <EmailOutlinedIcon sx={{ fontSize: 17 }} className="text-slate-400" />
                                    {profileData.email || "Not provided"}
                                </span>
                            </div>
                            {/* Phone Number */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Phone Number
                                </span>
                                <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 font-mono">
                                    <PhoneOutlinedIcon sx={{ fontSize: 17 }} className="text-slate-400" />
                                    {profileData.phone || "Not provided"}
                                </span>
                            </div>
                            {/* Laboratory Center */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Laboratory Center Name
                                </span>
                                <span className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                                    <BusinessOutlinedIcon sx={{ fontSize: 17 }} className="text-slate-400" />
                                    {profileData.labName || "Not assigned"}
                                </span>
                            </div>
                            {/* Registered Address */}
                            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Physical Address / Report Header Location
                                </span>
                                <span className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-800">
                                    <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="text-slate-400 shrink-0 mt-0.5" />
                                    {profileData.address || "Address not entered during registration"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Right 1 Col: Institutional & Account Role */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <SecurityOutlinedIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Institutional Role
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Permission scope & credentials
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Role card */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Active System Role
                                </span>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${roleInfo.className}`}>
                                        <VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />
                                        {roleInfo.label}
                                    </span>
                                </div>
                            </div>
                            {/* Employee ID */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Employee / Staff ID
                                </span>
                                <p className="mt-1 font-mono font-bold text-sm text-slate-800">
                                    {profileData.employeeId || "EMP-001"}
                                </p>
                            </div>
                            {/* Department */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Department
                                </span>
                                <p className="mt-1 font-semibold text-sm text-slate-800">
                                    {profileData.department || "Pathology & Diagnostics"}
                                </p>
                            </div>
                            {/* Joining Date */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Registration / Joining Date
                                </span>
                                <p className="mt-1 font-medium text-sm text-slate-700">
                                    {profileData.joiningDate || "15 Jan 2024"}
                                </p>
                            </div>
                            {/* Notice Banner */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-900">
                                <div className="flex items-start gap-2">
                                    <LockOutlinedIcon sx={{ fontSize: 17 }} className="mt-0.5 text-blue-700 shrink-0" />
                                    <p className="leading-relaxed">
                                        Your role governs module access (Admin, Receptionist, or Lab Technician).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB 2: PASSWORD & SECURITY */
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    
                    {/* Left Col: Direct Change Password Form */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <LockOutlinedIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Change Password
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Update your login credentials when you know your current password.
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <PasswordField
                                label="Current Password"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                visible={showCurrentPassword}
                                onToggle={() => setShowCurrentPassword((prev) => !prev)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={setNewPassword}
                                visible={showNewPassword}
                                onToggle={() => setShowNewPassword((prev) => !prev)}
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                            />
                            {/* Real-time Password Requirements Checklist */}
                            {newPassword && (
                                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs space-y-1.5">
                                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                                        Password Checklist:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                                        <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                                            <span>{hasMinLen ? "✓" : "○"}</span>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${hasNum ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                                            <span>{hasNum ? "✓" : "○"}</span>
                                            <span>Contains a number (0-9)</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                                            <span>{hasUpper ? "✓" : "○"}</span>
                                            <span>Contains uppercase (A-Z)</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${isMatching ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                                            <span>{isMatching ? "✓" : "○"}</span>
                                            <span>Passwords match</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <PasswordField
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                visible={showConfirmPassword}
                                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-600 font-semibold">
                                    Passwords do not match
                                </p>
                            )}
                            <button
                                type="submit"
                                style={{ backgroundColor: accentColor }}
                                className="w-full rounded-xl py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:opacity-95 cursor-pointer mt-2"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                    {/* Right Col: Forgot Password via Email Recovery */}
                    <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <KeyOutlinedIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Forgot Password?
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Recover account credentials via verified email
                                </p>
                            </div>
                        </div>
                        {!showForgotPassword ? (
                            <div className="space-y-4">
                                <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xs border border-slate-200/80">
                                        <EmailOutlinedIcon />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        Email Password Recovery
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        If you cannot remember your current password, request a secure recovery link sent to your registered sign-in email address (<strong>{profileData.email}</strong>).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotEmail(profileData.email);
                                        setForgotMessage("");
                                        setForgotError(false);
                                        setShowForgotPassword(true);
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                                >
                                    <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} className="text-emerald-600" />
                                    Reset Password via Email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Registered Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={forgotEmail}
                                            onChange={(event) => {
                                                setForgotEmail(event.target.value);
                                                setForgotMessage("");
                                            }}
                                            placeholder="you@laboratory.com"
                                            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 placeholder:text-slate-400"
                                        />
                                        <EmailOutlinedIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 18 }} />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-400">
                                        A single-use security reset link will be sent to this email.
                                    </p>
                                </div>
                                {forgotMessage && (
                                    <div
                                        className={`rounded-xl border p-3.5 text-xs leading-relaxed ${
                                            forgotError
                                                ? "border-red-200 bg-red-50 text-red-700"
                                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} className="mt-0.5 shrink-0" />
                                            <span>{forgotMessage}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 pt-1">
                                    <button
                                        type="submit"
                                        style={{ backgroundColor: accentColor }}
                                        className="w-full rounded-xl py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
                                    >
                                        Send Reset Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setForgotMessage("");
                                        }}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Back to Security Overview
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {/* EDIT PROFILE SLIDE-OVER DRAWER */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <button
                        type="button"
                        aria-label="Close edit profile"
                        onClick={() => setIsEditing(false)}
                        className="absolute inset-0 h-full w-full bg-slate-950/40 backdrop-blur-xs"
                    />
                    <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Edit Profile Information
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Update your personal, laboratory, and contact details
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        {/* Drawer Form */}
                        <form
                            id="editProfileForm"
                            onSubmit={handleSave}
                            className="flex-1 space-y-5 overflow-y-auto p-6 text-xs sm:text-sm"
                        >
                            {/* Photo Upload Area */}
                            <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-5 border border-slate-100">
                                <img
                                    src={editFormData.avatarUrl || DEFAULT_AVATAR}
                                    alt="Profile preview"
                                    className="h-20 w-20 rounded-2xl border-2 border-slate-200 object-cover shadow-sm"
                                />
                                <label className="mt-3 cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition">
                                    Change Profile Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </label>
                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    JPG, PNG, or WebP • Max 2 MB
                                </p>
                            </div>
                            {/* Full Name & Lab Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        value={editFormData.fullName}
                                        onChange={(event) =>
                                            setEditFormData({
                                                ...editFormData,
                                                fullName: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="e.g. Dr. Rajesh Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Laboratory Center Name
                                    </label>
                                    <input
                                        value={editFormData.labName}
                                        onChange={(event) =>
                                            setEditFormData({
                                                ...editFormData,
                                                labName: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="e.g. Apex Clinical Diagnostics"
                                    />
                                </div>
                            </div>
                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={editFormData.email}
                                        onChange={(event) =>
                                            setEditFormData({
                                                ...editFormData,
                                                email: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                                        placeholder="admin@laboratory.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone}
                                        onChange={(event) =>
                                            setEditFormData({
                                                ...editFormData,
                                                phone: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                            {/* Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Laboratory Physical Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={editFormData.address}
                                    onChange={(event) =>
                                        setEditFormData({
                                            ...editFormData,
                                            address: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                                    placeholder="Enter clinic/laboratory street address"
                                />
                            </div>
                            {/* Employment & Institutional Details */}
                            <div className="border-t border-slate-100 pt-4 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Employment & System Credentials
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Employee ID
                                        </label>
                                        <input
                                            value={editFormData.employeeId}
                                            onChange={(event) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    employeeId: event.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-mono"
                                            placeholder="e.g. EMP-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            value={editFormData.department}
                                            onChange={(event) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    department: event.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                                            placeholder="e.g. Pathology & Diagnostics"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Registration / Joining Date
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.joiningDate}
                                            onChange={(event) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    joiningDate: event.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                                            placeholder="e.g. 15 Jan 2024"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                        {/* Drawer Actions */}
                        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="editProfileForm"
                                style={{ backgroundColor: accentColor }}
                                className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Floating Toast Notification */}
            {toastMsg && (
                <div
                    role="status"
                    className={`fixed right-5 top-5 z-[10000] flex max-w-md items-center gap-3 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white shadow-2xl animate-in fade-in slide-in-from-top-2 ${
                        toastError ? "bg-red-600" : "bg-slate-900"
                    }`}
                >
                    <CheckCircleOutlineOutlinedIcon
                        className={toastError ? "text-red-200" : "text-emerald-400"}
                        sx={{ fontSize: 20 }}
                    />
                    <span className="font-medium flex-1">{toastMsg}</span>
                    <button
                        type="button"
                        onClick={() => setToastMsg("")}
                        className="ml-2 text-white/70 hover:text-white"
                        aria-label="Dismiss notification"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
            )}
        </div>
    );
}
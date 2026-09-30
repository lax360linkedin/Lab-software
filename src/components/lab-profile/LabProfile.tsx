import { useState, useEffect } from "react";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { getFormattedCurrentDate, getFormattedCurrentDateTime } from "../../common components/dateUtils";
import "./labProfile.css";

export interface LabProfileConfig {
  labName: string;
  tagline: string;
  logoUrl: string;
  logoHeight: number;
  phone: string;
  helpline: string;
  emergencyMobile: string;
  email: string;
  dispatchEmail: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  ceaLicenseNo: string;
  nablCertNo: string;
  icmrCode: string;
  gstin: string;
  bmwAuthNo: string;
  directorName: string;
  directorDesignation: string;
  headerTemplate: "split" | "centered" | "accent-banner";
  headerAccentColor: string;
  showNablBadge: boolean;
  showIcmrBadge: boolean;
  showIsoBadge: boolean;
  showQrCode: boolean;
  enableBioRadIqc: boolean;
  headerNotice: string;
  footerDisclaimer: string;
}

export const DEFAULT_LAB_PROFILE: LabProfileConfig = {
  labName: "Lax360 Clinical Laboratory & Diagnostic Services",
  tagline: "Advanced Automated Diagnostic Pathology & Molecular Medicine",
  logoUrl: "",
  logoHeight: 64,
  phone: "+91 44 2841 9900",
  helpline: "1800 425 9900 (Toll-Free)",
  emergencyMobile: "+91 98401 22334",
  email: "info@lax360lab.com",
  dispatchEmail: "reports@lax360lab.com",
  website: "www.lax360lab.com",
  addressLine1: "Plot 42, Healthcare Avenue, Industrial Tech Park",
  addressLine2: "Guindy Institutional Area",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600032",
  country: "India",
  ceaLicenseNo: "CEA/TN/CHN/2026/0991",
  nablCertNo: "NABL-MC-44819 (ISO 15189:2022)",
  icmrCode: "ICMR-TN-CHN-0048",
  gstin: "33AAAAA0000A1Z5",
  bmwAuthNo: "BMW/TNPCB/CHN/8812",
  directorName: "Dr. Arvind Swamy, MBBS, MD (Clinical Pathology)",
  directorDesignation: "Chief Pathologist & Medical Director",
  headerTemplate: "split",
  headerAccentColor: "#1e3a8a", // Blue 900
  showNablBadge: true,
  showIcmrBadge: true,
  showIsoBadge: true,
  showQrCode: true,
  enableBioRadIqc: false,
  headerNotice: "Computer Generated Validated Diagnostic Laboratory Report • NABL Accredited",
  footerDisclaimer: "Tests performed on automated calibrated analyzers according to ISO 15189 standards. Results relate strictly to the received sample specimen. Please correlate clinically with treating physician.",
};

const STORAGE_KEY = "lab_profile_config";

export function getStoredLabProfile(): LabProfileConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_LAB_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to parse lab profile from localStorage", e);
  }
  return DEFAULT_LAB_PROFILE;
}

export function saveStoredLabProfile(config: LabProfileConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save lab profile to localStorage", e);
  }
}

// Code 39 Barcode Encoding Dictionary (5 bars, 4 spaces; 3 wide, 6 narrow)
// 1 = wide element, 0 = narrow element
const CODE39_MAP: Record<string, string> = {
  "0": "000110100",
  "1": "100100001",
  "2": "001100001",
  "3": "101100000",
  "4": "000110001",
  "5": "100110000",
  "6": "001110000",
  "7": "000100101",
  "8": "100100100",
  "9": "001100100",
  "A": "100001001",
  "B": "001001001",
  "C": "101001000",
  "D": "000011001",
  "E": "100011000",
  "F": "001011000",
  "G": "000001101",
  "H": "100001100",
  "I": "001001100",
  "J": "000011100",
  "K": "100000011",
  "L": "001000011",
  "M": "101000010",
  "N": "000010011",
  "O": "100010010",
  "P": "001010010",
  "Q": "000000111",
  "R": "100000110",
  "S": "001000110",
  "T": "000010110",
  "U": "110000001",
  "V": "011000001",
  "W": "111000000",
  "X": "010010001",
  "Y": "110010000",
  "Z": "011010000",
  "-": "010000101",
  ".": "110000100",
  " ": "011000100",
  "$": "010101000",
  "/": "010100010",
  "+": "010001010",
  "%": "000101010",
  "*": "010010100",
};

export interface Code39BarcodeProps {
  value: string;
  height?: number;
  narrowWidth?: number;
  wideWidthRatio?: number;
  quietZone?: number;
  className?: string;
  displayValue?: boolean;
}

export function Code39Barcode({
  value,
  height = 26,
  narrowWidth = 1.1,
  wideWidthRatio = 2.5,
  quietZone = 8,
  className = "",
  displayValue = true,
}: Code39BarcodeProps) {
  // Strip asterisks from input value to get clean readable ID
  const cleanId = value.toUpperCase().replace(/^\*+|\*+$/g, "").trim();
  const fullText = `*${cleanId}*`;
  const wideWidth = Number((narrowWidth * wideWidthRatio).toFixed(2));

  const bars: { x: number; width: number }[] = [];
  let currentX = quietZone;

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const pattern = CODE39_MAP[char];
    if (!pattern) continue;

    for (let p = 0; p < 9; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === "1";
      const w = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        bars.push({ x: Number(currentX.toFixed(2)), width: Number(w.toFixed(2)) });
      }
      currentX += w;
    }

    // Inter-character narrow space gap
    if (i < fullText.length - 1) {
      currentX += narrowWidth;
    }
  }

  currentX += quietZone;
  const totalWidth = Number(currentX.toFixed(2));

  return (
    <div className={`inline-flex flex-col items-center bg-white py-1 px-1.5 rounded border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        width={totalWidth}
        height={height}
        className="block max-w-[165px] h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label={`Code 39 barcode for sample ${cleanId}`}
      >
        <rect x="0" y="0" width={totalWidth} height={height} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y="0"
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {displayValue && (
        <span className="font-mono text-[9px] font-bold tracking-widest text-slate-800 mt-0.5 select-all">
          {cleanId}
        </span>
      )}
    </div>
  );
}

export default function LabProfile() {
  const [profile, setProfile] = useState<LabProfileConfig>(getStoredLabProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<"letterhead" | "sample-report">("sample-report");

  useEffect(() => {
    saveStoredLabProfile(profile);
  }, [profile]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredLabProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all lab profile settings to factory defaults?")) {
      setProfile(DEFAULT_LAB_PROFILE);
      saveStoredLabProfile(DEFAULT_LAB_PROFILE);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logoUrl: "" }));
  };

  const fullAddressString = `${profile.addressLine1}, ${profile.addressLine2 ? profile.addressLine2 + ", " : ""}${profile.city}, ${profile.state} - ${profile.pincode}, ${profile.country}`;
  const currentFormattedDate = getFormattedCurrentDate();
  const currentFormattedDateTime = getFormattedCurrentDateTime();
  const sampleCollTime = `${currentFormattedDate}, 08:30 AM`;

  const handlePrint = () => {
    if (previewTab !== "sample-report") {
      setPreviewTab("sample-report");
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  return (
    <div className="lab-profile-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Settings</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Lab Profile & Report Header</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laboratory Profile & Header Configuration
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Configure official lab entity details, logo, accreditation credentials, and reusable report header styling for all generated diagnostic reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <LockResetOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <PrintOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Print Sample Report</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <SaveOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm shadow-sm animate-in fade-in">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
          <span className="font-semibold">Lab profile saved successfully!</span>
          <span className="text-emerald-700 text-xs">
            These details are now synchronized and will be dynamically reused across all patient reports and bill invoices.
          </span>
        </div>
      )}

      {/* Main Grid: Form on Left (7 cols), Live Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Configuration Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-6 lab-profile-config-column">
          {/* Card 1: Lab Name & Brand Logo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Laboratory Name & Brand Identity</h3>
                <p className="text-xs text-slate-500">Official entity branding displayed on top of diagnostic reports.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Laboratory Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.labName}
                  onChange={(e) => setProfile({ ...profile, labName: e.target.value })}
                  placeholder="e.g. Lax360 Clinical Laboratory & Diagnostic Services"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tagline / Sub-Heading
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="e.g. Advanced Automated Diagnostic Pathology & Molecular Medicine"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Logo Management */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Laboratory Logo (PNG, JPG, SVG)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  {profile.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-24 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={profile.logoUrl}
                          alt="Lab Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} /> Custom Logo Active
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700">
                            <span>Change</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-lg">
                        {profile.labName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">No custom logo uploaded. System default emblem will be used.</p>
                        <label className="mt-1.5 inline-flex items-center gap-1.5 cursor-pointer rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm">
                          <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
                          <span>Upload High-Res Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Numbers & Communication */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Communication & Contact Details</h3>
                <p className="text-xs text-slate-500">Printed in header contact strip and patient inquiry cards.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Telephone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 44 2841 9900"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Toll-Free Helpline
                </label>
                <input
                  type="text"
                  value={profile.helpline}
                  onChange={(e) => setProfile({ ...profile, helpline: e.target.value })}
                  placeholder="1800 425 9900"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Emergency Lab Mobile
                </label>
                <input
                  type="text"
                  value={profile.emergencyMobile}
                  onChange={(e) => setProfile({ ...profile, emergencyMobile: e.target.value })}
                  placeholder="+91 98401 22334"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="info@lax360lab.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Report Dispatch Email
                </label>
                <input
                  type="email"
                  value={profile.dispatchEmail}
                  onChange={(e) => setProfile({ ...profile, dispatchEmail: e.target.value })}
                  placeholder="reports@lax360lab.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Website
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="www.lax360lab.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Address & Facility Location */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Facility Location & Physical Address</h3>
                <p className="text-xs text-slate-500">Complete legal premises address rendered on report header.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Premise / Street Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.addressLine1}
                  onChange={(e) => setProfile({ ...profile, addressLine1: e.target.value })}
                  placeholder="Plot 42, Healthcare Avenue"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Area / Landmark Line 2
                </label>
                <input
                  type="text"
                  value={profile.addressLine2}
                  onChange={(e) => setProfile({ ...profile, addressLine2: e.target.value })}
                  placeholder="Guindy Institutional Area"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Chennai"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="Tamil Nadu"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  placeholder="600032"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  placeholder="India"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Legal Registration & Accreditation Credentials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="rounded-lg bg-teal-50 p-2 text-teal-600">
                <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Legal Registration & Accreditation Credentials</h3>
                <p className="text-xs text-slate-500">Government approvals and quality accreditations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Establishment License No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.ceaLicenseNo}
                  onChange={(e) => setProfile({ ...profile, ceaLicenseNo: e.target.value })}
                  placeholder="CEA/TN/CHN/2026/0991"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NABL Accreditation Certificate (ISO 15189)
                </label>
                <input
                  type="text"
                  value={profile.nablCertNo}
                  onChange={(e) => setProfile({ ...profile, nablCertNo: e.target.value })}
                  placeholder="NABL-MC-44819 (ISO 15189:2022)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ICMR Diagnostic Registration
                </label>
                <input
                  type="text"
                  value={profile.icmrCode}
                  onChange={(e) => setProfile({ ...profile, icmrCode: e.target.value })}
                  placeholder="ICMR-TN-CHN-0048"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN / Tax Registration No
                </label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bio-Medical Waste Auth No
                </label>
                <input
                  type="text"
                  value={profile.bmwAuthNo}
                  onChange={(e) => setProfile({ ...profile, bmwAuthNo: e.target.value })}
                  placeholder="BMW/TNPCB/CHN/8812"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chief Medical Director / Pathologist
                </label>
                <input
                  type="text"
                  value={profile.directorName}
                  onChange={(e) => setProfile({ ...profile, directorName: e.target.value })}
                  placeholder="Dr. Arvind Swamy, MBBS, MD (Pathology)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Signatory Title / Designation
                </label>
                <input
                  type="text"
                  value={profile.directorDesignation}
                  onChange={(e) => setProfile({ ...profile, directorDesignation: e.target.value })}
                  placeholder="Chief Pathologist & Medical Director"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Report Header & Layout Styling */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report Header & Layout Customization</h3>
                <p className="text-xs text-slate-500">Configure visual letterhead and accreditation badges on patient reports.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Header Layout Structure
                </label>
                <select
                  value={profile.headerTemplate}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      headerTemplate: e.target.value as LabProfileConfig["headerTemplate"],
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="split">Modern Split (Logo Left, Accreditation Right)</option>
                  <option value="centered">Classic Centered Letterhead</option>
                  <option value="accent-banner">Accent Band Letterhead</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Letterhead Accent Color
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[
                    { color: "#1e3a8a", name: "Navy Blue" },
                    { color: "#0f766e", name: "Teal" },
                    { color: "#2563eb", name: "Royal Blue" },
                    { color: "#312e81", name: "Indigo" },
                    { color: "#1e293b", name: "Slate Dark" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setProfile({ ...profile, headerAccentColor: c.color })}
                      style={{ backgroundColor: c.color }}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        profile.headerAccentColor === c.color
                          ? "ring-2 ring-offset-2 ring-blue-600 scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accreditation Badge Toggles */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 text-xs mb-2">
                Accreditation Badges to Display on Header:
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showNablBadge}
                    onChange={(e) => setProfile({ ...profile, showNablBadge: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">NABL Accredited</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showIsoBadge}
                    onChange={(e) => setProfile({ ...profile, showIsoBadge: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">ISO 15189:2022</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showIcmrBadge}
                    onChange={(e) => setProfile({ ...profile, showIcmrBadge: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">ICMR Registered</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showQrCode}
                    onChange={(e) => setProfile({ ...profile, showQrCode: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">Verify QR Tag</span>
                </label>
              </div>
            </div>

            {/* Quality Control (QC) Verification Endorsement */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                Quality Control (QC) Verification Endorsement:
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.enableBioRadIqc}
                    onChange={(e) => setProfile({ ...profile, enableBioRadIqc: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">
                      Bio-Rad Unity™ IQC Interfaced
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Enable only when the laboratory has an active interfaced Bio-Rad Unity Real Time® program. When unchecked, reports display the accurate truthful status: <span className="font-semibold text-emerald-700">Internal QC: Validated (Within 2SD)</span>.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Header & Footer Text */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Report Header Banner Note
                </label>
                <input
                  type="text"
                  value={profile.headerNotice}
                  onChange={(e) => setProfile({ ...profile, headerNotice: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Report Footer Quality Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={profile.footerDisclaimer}
                  onChange={(e) => setProfile({ ...profile, footerDisclaimer: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Report Letterhead Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lab-profile-preview-column">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 preview-top-toolbar">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Report Letterhead Preview</h3>
                <p className="text-[11px] text-slate-500">Real-time dynamic preview of generated patient test reports.</p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("sample-report")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    previewTab === "sample-report" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Full Report
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("letterhead")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    previewTab === "letterhead" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Header Only
                </button>
              </div>
            </div>

            {/* Simulated A4 Report Sheet */}
            <div
              id="report-printable-sheet"
              className="bg-white border border-slate-200 rounded-xl shadow-lg p-5 text-slate-900 font-sans transition-all"
              style={{
                borderTop: `4px solid ${profile.headerAccentColor}`,
              }}
            >
              {/* Report Header Block */}
              {profile.headerTemplate === "centered" ? (
                /* Centered Layout */
                <div className="text-center pb-4 border-b-2 border-slate-300 space-y-1.5">
                  <div className="flex justify-center mb-1.5">
                    {profile.logoUrl ? (
                      <img src={profile.logoUrl} alt="Logo" className="h-14 object-contain" />
                    ) : (
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
                        style={{ backgroundColor: profile.headerAccentColor }}
                      >
                        {profile.labName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h4 className="font-black text-xl tracking-tight text-slate-950">{profile.labName}</h4>
                  <p className="text-xs text-slate-700 font-bold">{profile.tagline}</p>
                  <p className="text-xs text-slate-800 max-w-md mx-auto font-medium">{fullAddressString}</p>
                  <p className="text-xs text-slate-800 font-semibold">
                    Phone: {profile.phone} | Email: {profile.dispatchEmail} | Web: {profile.website}
                  </p>
                </div>
              ) : (
                /* Modern Split Layout (Default) */
                <div className="pb-4 border-b-2 border-slate-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="h-14 object-contain" />
                      ) : (
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm"
                          style={{ backgroundColor: profile.headerAccentColor }}
                        >
                          {profile.labName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-base tracking-tight text-slate-950 leading-tight">
                          {profile.labName}
                        </h4>
                        <p className="text-xs text-slate-700 font-bold mt-0.5">{profile.tagline}</p>
                        <p className="text-xs text-slate-800 mt-1 max-w-[280px] leading-snug font-medium">
                          {fullAddressString}
                        </p>
                        <p className="text-xs text-slate-800 font-semibold mt-0.5">
                          📞 {profile.phone} • ✉️ {profile.dispatchEmail}
                        </p>
                      </div>
                    </div>

                    {/* Accreditations on Right */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        {profile.showNablBadge && (
                          <span className="rounded bg-blue-100 border border-blue-400 px-2 py-0.5 text-[11px] font-black text-blue-950">
                            NABL MC-44819
                          </span>
                        )}
                        {profile.showIsoBadge && (
                          <span className="rounded bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-[11px] font-black text-emerald-950">
                            ISO 15189
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-800 font-mono font-bold">Lic: {profile.ceaLicenseNo}</p>
                      <p className="text-[11px] text-slate-800 font-mono font-bold">ICMR: {profile.icmrCode}</p>
                      {profile.showQrCode && (
                        <div className="mt-1 flex justify-end">
                          <QrCode2OutlinedIcon sx={{ fontSize: 32 }} className="text-slate-900" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Banner Notice */}
              <div
                className="py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: profile.headerAccentColor }}
              >
                {profile.headerNotice}
              </div>

              {/* Patient Demographics Strip (Simulated Report Body) */}
              {previewTab === "sample-report" && (
                <div className="mt-3.5 space-y-3.5">
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div>
                        <span className="text-slate-600 font-semibold">Patient Name:</span>{" "}
                        <strong className="text-slate-950 font-black">Mr. Rajesh Sharma</strong>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold">Age / Gender:</span>{" "}
                        <span className="font-bold text-slate-950">42 Yrs / Male</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold">Patient ID:</span>{" "}
                        <span className="font-mono font-bold text-slate-950">PAT-2026-8812</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold">Ref Doctor:</span>{" "}
                        <span className="font-bold text-slate-950">Dr. K. Ramanathan, MD</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold">Sample Coll:</span>{" "}
                        <span className="font-bold text-slate-950">{sampleCollTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold">Report Auth:</span>{" "}
                        <span className="text-emerald-800 font-black">{currentFormattedDateTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Test Result Table */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-200/90 font-black px-3 py-1.5 text-slate-950 border-b border-slate-300 flex justify-between">
                      <span>COMPLETE BLOOD COUNT (CBC - HEMOGRAM)</span>
                      <span className="font-bold text-[11px] text-slate-700">Method: Flow Cytometry</span>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-800 text-[11px] bg-slate-100">
                          <th className="py-2 px-3 text-left font-bold">Investigation</th>
                          <th className="py-2 px-3 text-right font-bold">Observed</th>
                          <th className="py-2 px-3 text-center font-bold">Ref. Interval</th>
                          <th className="py-2 px-3 text-right font-bold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-900">
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-950">Hemoglobin (Hb)</td>
                          <td className="py-2 px-3 text-right font-black text-slate-950 text-sm">14.8</td>
                          <td className="py-2 px-3 text-center text-slate-800 font-bold">13.0 - 17.0</td>
                          <td className="py-2 px-3 text-right text-slate-800 font-bold">g/dL</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-950">Total WBC Count</td>
                          <td className="py-2 px-3 text-right font-black text-slate-950 text-sm">7,200</td>
                          <td className="py-2 px-3 text-center text-slate-800 font-bold">4,000 - 11,000</td>
                          <td className="py-2 px-3 text-right text-slate-800 font-bold">/cu.mm</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-950">Platelet Count</td>
                          <td className="py-2 px-3 text-right font-black text-slate-950 text-sm">2.65</td>
                          <td className="py-2 px-3 text-center text-slate-800 font-bold">1.50 - 4.50</td>
                          <td className="py-2 px-3 text-right text-slate-800 font-bold">Lakhs/cu.mm</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-950">Packed Cell Volume (PCV)</td>
                          <td className="py-2 px-3 text-right font-black text-slate-950 text-sm">44.2</td>
                          <td className="py-2 px-3 text-center text-slate-800 font-bold">40.0 - 50.0</td>
                          <td className="py-2 px-3 text-right text-slate-800 font-bold">%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Doctor Signature Block */}
                  <div className="pt-3 flex justify-between items-end border-t border-slate-300 text-xs">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                        Sample ID
                      </div>
                      <Code39Barcode
                        value="SML-8812-CB"
                        height={32}
                        narrowWidth={1.3}
                        wideWidthRatio={2.6}
                        quietZone={10}
                      />
                      <p className="text-xs text-emerald-800 font-extrabold flex items-center gap-1">
                        {profile.enableBioRadIqc ? "✓ Verified with Bio-Rad IQC" : "✓ Internal QC: Validated (Within 2SD)"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic font-black text-blue-950 text-sm">Arvind Swamy</div>
                      <p className="font-black text-slate-950 text-xs">{profile.directorName}</p>
                      <p className="text-[11px] font-bold text-slate-700">{profile.directorDesignation}</p>
                    </div>
                  </div>

                  {/* Quality Footer Disclaimer */}
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 leading-normal font-medium">
                    {profile.footerDisclaimer}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 preview-info-box">
              <strong>Report Reusability Guarantee:</strong>
              <p className="mt-0.5 text-[11px] text-blue-700 leading-relaxed">
                When you click <strong>Save Configuration</strong>, these exact letterhead credentials, logos, and licensing codes are automatically stored in the local laboratory runtime and will be pulled by all generated report sheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { ACCENT_COLORS, DEFAULT_ACCENT } from "../../context/ThemeContext";

export default function Appearance() {
  const [appliedColor, setAppliedColor] = useState<string>(() => {
    const saved = localStorage.getItem("dashboard_accent_color");
    return saved && saved.trim() ? saved : DEFAULT_ACCENT;
  });

  // Temporary selected color for the preview box
  const [selectedColor, setSelectedColor] = useState<string>(appliedColor);

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Swatch click: ONLY updates preview
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
  };

  // Cancel: Resets preview and selection back to currently saved/applied color
  const handleCancel = () => {
    setSelectedColor(appliedColor);
  };

  // Update: Applies selected color to REAL dashboard, saves in localStorage, and shows toast
  const handleUpdate = () => {
    setAppliedColor(selectedColor);
    document.documentElement.style.setProperty("--dashboard-accent", selectedColor);
    localStorage.setItem("dashboard_accent_color", selectedColor);
    showToast("Appearance updated successfully");
  };

  return (
    <div className="appearance-page min-h-full w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
        <p className="mt-1 text-xs text-slate-500">
          Customize your dashboard appearance and typography.
        </p>
      </div>

      {/* Main Grid: Accent Color Card (Left) and Dashboard Preview Box (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* a) Accent Color Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm lg:col-span-6">
          <h2 className="text-sm font-bold text-slate-800 mb-6">
            Accent Color
          </h2>

          <div className="grid grid-cols-5 gap-4 max-w-sm">
            {ACCENT_COLORS.map((color) => {
              const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  aria-label={`Select accent color ${color}`}
                  style={{ backgroundColor: color }}
                  className={`h-11 w-11 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm focus:outline-none ${
                    isSelected
                      ? "ring-4 ring-blue-300 ring-offset-2 scale-105"
                      : "hover:ring-2 hover:ring-slate-300"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* b) Dashboard Preview Box */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md lg:col-span-6">
          {/* Mini Header (changes with selectedColor) */}
          <div
            style={{ backgroundColor: selectedColor }}
            className="flex h-14 items-center justify-between px-5 text-white transition-colors duration-200"
          >
            <span className="text-sm font-bold tracking-tight">
              Lax Lab Dashboard
            </span>

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white/25" />
              <div className="h-2.5 w-16 rounded-full bg-white/25" />
            </div>
          </div>

          {/* Mini Sidebar + Content Area */}
          <div className="flex min-h-[220px]">
            {/* Mini Sidebar (changes with selectedColor) */}
            <div
              style={{ backgroundColor: selectedColor }}
              className="w-32 shrink-0 p-3 space-y-1.5 transition-colors duration-200 border-t border-white/10"
            >
              <div className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white">
                Dashboard
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                Patients
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                Reports
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                Settings
              </div>
            </div>

            {/* Mini Dashboard Overview Content */}
            <div className="flex flex-1 flex-col justify-between bg-white p-6">
              <div>
                <h3
                  style={{ color: selectedColor }}
                  className="text-xl font-bold transition-colors duration-200"
                >
                  Dashboard Overview
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs">
                  This is how your dashboard appearance will look after applying the selected settings.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  style={{ backgroundColor: selectedColor }}
                  className="rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

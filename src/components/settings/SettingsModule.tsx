import { useState } from "react";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import Profile from "./Profile";
import Appearance from "./Appearance";

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState<"profile" | "appearance">("profile");

  return (
    <div className="w-full space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === "profile"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === "appearance"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <PaletteOutlinedIcon sx={{ fontSize: 18 }} />
          Appearance
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" ? <Profile /> : <Appearance />}
      </div>
    </div>
  );
}

import { useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useTheme, DEFAULT_AVATAR } from "../../context/ThemeContext";

interface ProfileData {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  employeeId: string;
  department: string;
  joiningDate: string;
}

const DEFAULT_PROFILE: ProfileData = {
  fullName: "Dr. John Smith",
  gender: "Male",
  dob: "12 May 1985",
  email: "doctor@gmail.com",
  phone: "9876543210",
  address: "Chennai, Tamil Nadu",
  city: "Chennai",
  employeeId: "EMP001",
  department: "Laboratory",
  joiningDate: "15 Jan 2022",
};

export default function Profile() {
  const { accentColor } = useTheme();

  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("app_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<ProfileData>(profileData);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenEdit = () => {
    setEditFormData(profileData);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData(editFormData);
    localStorage.setItem("app_user_profile", JSON.stringify(editFormData));
    setIsEditing(false);
    showToast("Profile updated successfully");
  };

  return (
    <div className="profile-page min-h-full w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
      </div>

      {/* Main Profile Card matching Screenshot 2 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
          {/* Left Column: Avatar, Name, Edit Button */}
          <div className="flex flex-col items-center text-center md:col-span-4 lg:col-span-3 pt-4">
            <div className="relative">
              <img
                src={DEFAULT_AVATAR}
                alt={profileData.fullName}
                className="h-36 w-36 rounded-full object-cover ring-4 ring-slate-100 shadow-sm"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              {profileData.fullName}
            </h2>

            <button
              type="button"
              onClick={handleOpenEdit}
              style={{ backgroundColor: accentColor }}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
              Edit Profile
            </button>
          </div>

          {/* Right Column: Information Sections */}
          <div className="md:col-span-8 lg:col-span-9 md:border-l md:border-slate-100 md:pl-10 space-y-7">
            {/* 1. Personal Information */}
            <div>
              <h3
                style={{ color: accentColor }}
                className="text-sm font-bold tracking-wide uppercase"
              >
                Personal Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Full Name
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.fullName}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Gender
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.gender}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Date of Birth
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.dob}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Contact Details */}
            <div className="border-t border-slate-100 pt-6">
              <h3
                style={{ color: accentColor }}
                className="text-sm font-bold tracking-wide uppercase"
              >
                Contact Details
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Email
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.email}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Phone
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.phone}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Address
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.address}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    City
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.city}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Account Information */}
            <div className="border-t border-slate-100 pt-6">
              <h3
                style={{ color: accentColor }}
                className="text-sm font-bold tracking-wide uppercase"
              >
                Account Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Employee ID
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.employeeId}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Department
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.department}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">
                    Joining Date
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {profileData.joiningDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Slide-Over Drawer */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsEditing(false)}
          />
          <div
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Update your personal and contact details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <form
              id="editProfileForm"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, gender: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={editFormData.dob}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dob: e.target.value })
                    }
                    placeholder="e.g. 12 May 1985"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={editFormData.city}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, city: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[11px] font-bold uppercase text-slate-400 mb-3">
                  Account Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.employeeId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          employeeId: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editFormData.department}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          department: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="text"
                    value={editFormData.joiningDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        joiningDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editProfileForm"
                style={{ backgroundColor: accentColor }}
                className="rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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

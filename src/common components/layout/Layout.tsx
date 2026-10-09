import { useState, useEffect, type ReactNode } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Sidebar from "./Sidebar";
import "./layout.css";
import { useAuth } from "../../components/auth/useAuth";
import { Outlet, useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../context/ThemeContext";
import laxLogo from "../../assets/laxlogo.jpg";

interface LayoutProps {
  children?: ReactNode;
}

interface StoredPatient {
  patientId?: string;
  registrationId?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  accessionNumber?: string;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StoredPatient[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: unknown) => {
      setGlobalToast(String(msg ?? ""));
    };

    const handleCustomToast = (e: Event) => {
      const custom = e as CustomEvent<{ message: string }>;
      if (custom.detail?.message) {
        setGlobalToast(custom.detail.message);
      }
    };
    window.addEventListener("app-toast", handleCustomToast);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener("app-toast", handleCustomToast);
    };
  }, []);

  useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => {
        setGlobalToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard_accent_color");
    if (saved && saved.trim() && saved !== "#702459") {
      document.documentElement.style.setProperty(
        "--dashboard-accent",
        saved
      );
    }

    const brandTitle = document.querySelector(
      ".sidebar-brand-text strong"
    );

    if (brandTitle) {
      brandTitle.textContent = "Lax Lab";
    }

    const brandIcon = document.querySelector(
      ".sidebar-brand-icon"
    );

    if (brandIcon && !brandIcon.querySelector("img")) {
      brandIcon.innerHTML = `
        <img
          src="${laxLogo}"
          alt="Lax Lab Logo"
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"
        />
      `;
    }
  }, []);

  if (!user) {
    return null;
  }

  const roleLabel =
    user.role === "lab_technician"
      ? "Lab Technician"
      : user.role === "receptionist"
        ? "Receptionist"
        : "Administrator";

  const handleGlobalSearch = (
    value: string
  ) => {
    setGlobalSearch(value);

    const searchValue = value.trim().toLowerCase();

    if (!searchValue) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    try {
      const storedPatients =
        localStorage.getItem("lab_patients");

      if (!storedPatients) {
        setSearchResults([]);
        setSearchOpen(true);
        return;
      }

      const patients: StoredPatient[] =
        JSON.parse(storedPatients);

      const filteredPatients = patients
        .filter((patient) => {
          const patientId =
            String(patient.patientId ?? "").toLowerCase();

          const registrationId =
            String(
              patient.registrationId ?? ""
            ).toLowerCase();

          const name =
            String(
              patient.name ??
              patient.fullName ??
              ""
            ).toLowerCase();

          const phone =
            String(
              patient.phone ?? ""
            ).toLowerCase();

          const accessionNumber =
            String(
              patient.accessionNumber ?? ""
            ).toLowerCase();

          return (
            patientId.includes(searchValue) ||
            registrationId.includes(searchValue) ||
            name.includes(searchValue) ||
            phone.includes(searchValue) ||
            accessionNumber.includes(searchValue)
          );
        })
        .slice(0, 5);

      setSearchResults(filteredPatients);
      setSearchOpen(true);
    } catch (error) {
      console.error(
        "Global search error:",
        error
      );

      setSearchResults([]);
      setSearchOpen(true);
    }
  };

  const handlePatientSearch = (
    patient: StoredPatient
  ) => {
    const patientId =
      patient.patientId;

    if (!patientId) {
      return;
    }

    setGlobalSearch("");
    setSearchResults([]);
    setSearchOpen(false);

    navigate(
      `/patients/history?patientId=${encodeURIComponent(
        patientId
      )}`
    );
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    if (searchResults.length > 0) {
      handlePatientSearch(
        searchResults[0]
      );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>

            <div className="header-page-info">
              <h1>Lax Lab</h1>

              <img
                src={laxLogo}
                alt="Lax Lab Logo"
                className="header-logo rounded-xl object-contain shadow-md"
              />
            </div>
          </div>

          <div className="global-search-wrapper">
            <div className="global-search">
              <SearchOutlinedIcon />

              <input
                type="text"
                value={globalSearch}
                onChange={(event) =>
                  handleGlobalSearch(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder="Search patient ID, name, registration..."
                aria-label="Global search"
              />
            </div>

            {searchOpen && globalSearch.trim() && (
              <div className="global-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map(
                    (patient, index) => {
                      const patientId =
                        patient.patientId ?? "";

                      const patientName =
                        patient.name ??
                        patient.fullName ??
                        "Unknown Patient";

                      return (
                        <button
                          key={
                            patientId ||
                            `patient-${index}`
                          }
                          type="button"
                          className="global-search-result"
                          onClick={() =>
                            handlePatientSearch(
                              patient
                            )
                          }
                        >
                          <div className="search-result-icon">
                            <SearchOutlinedIcon />
                          </div>

                          <div className="search-result-info">
                            <strong>
                              {patientName}
                            </strong>

                            <span>
                              {patientId}

                              {patient.registrationId
                                ? ` • ${patient.registrationId}`
                                : ""}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="global-search-empty">
                    No patient found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="header-right">
            <button
              type="button"
              className="header-action-button report-history-button"
              aria-label="Report History"
              title="Report History"
              onClick={() =>
                navigate("/reports/history")
              }
            >
              <DescriptionOutlinedIcon />
              <span>Reports</span>
            </button>

            <div className="header-divider" />

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                navigate(
                  "/notifications/settings"
                )
              }
            >
              <NotificationsNoneOutlinedIcon />

              <span className="notification-dot" />
            </button>

            <div className="header-divider" />

            <div className="profile-wrapper">
              <button
                type="button"
                className="header-profile"
                onClick={() =>
                  setProfileOpen(
                    (previous) =>
                      !previous
                  )
                }
              >
                <div className="header-avatar">
                  <img
                    src={DEFAULT_AVATAR}
                    alt={user.name}
                  />
                </div>

                <div className="header-user-info">
                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {roleLabel}
                  </span>
                </div>

                <KeyboardArrowDownIcon
                  className={`profile-arrow ${profileOpen
                      ? "profile-arrow-open"
                      : ""
                    }`}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>
                      {user.name}
                    </strong>

                    <span>
                      {user.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          {children || <Outlet />}
        </main>
      </div>

      {globalToast && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />

          <span>
            {globalToast}
          </span>
        </div>
      )}
    </div>
  );
};

export default Layout;
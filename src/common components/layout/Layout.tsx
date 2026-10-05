import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Sidebar from "./Sidebar";
import "./layout.css";
import { useAuth } from "../../components/auth/useAuth";
import { Outlet, useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../context/ThemeContext";
import laxLogo from "../../assets/laxlogo.jpg";


interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard_accent_color");
    if (saved && saved.trim() && saved !== "#702459") {
      document.documentElement.style.setProperty("--dashboard-accent", saved);
    }

    // Ensure left-side sidebar brand text & icon are updated to Lax Lab
    const brandTitle = document.querySelector(".sidebar-brand-text strong");
    if (brandTitle) {
      brandTitle.textContent = "Lax Lab";
    }
    const brandIcon = document.querySelector(".sidebar-brand-icon");
    if (brandIcon && !brandIcon.querySelector("img")) {
      brandIcon.innerHTML = `<img src="${laxLogo}" alt="Lax Lab Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" />`;
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
              onClick={() => setSidebarOpen(true)}
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

          <div className="header-right">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              onClick={() => navigate("/notifications/settings")}
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
                  setProfileOpen((previous) => !previous)
                }
              >
                <div className="header-avatar">
                  <img src={DEFAULT_AVATAR} alt={user.name} />
                </div>

                <div className="header-user-info">
                  <strong>{user.name}</strong>
                  <span>{roleLabel}</span>
                </div>

                <KeyboardArrowDownIcon
                  className={`profile-arrow ${
                    profileOpen
                      ? "profile-arrow-open"
                      : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
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
    </div>
  );
};

export default Layout;
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Sidebar from "./Sidebar";
import "./layout.css";
import { useAuth } from "../../components/auth/useAuth";
import { Outlet, useNavigate } from "react-router-dom";


const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
              <h1>Lax 360</h1>
              <img
                src="/favicon.svg"
                alt="Lax 360 Logo"
                className="header-logo"
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
                  {user.name.charAt(0).toUpperCase()}
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
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
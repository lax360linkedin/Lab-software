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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StoredPatient[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const topics = [
      { match: /patient/i, path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
      { match: /bill|invoice/i, path: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm0 2 4 4h-4zm-6 8h8v2H8zm0 4h8v2H8z", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
      { match: /test|analysis/i, path: "M9 3v2l1 1v5.59L4.59 17A2 2 0 0 0 6 20h12a2 2 0 0 0 1.41-3L14 11.59V6l1-1V3H9zm3 9 5 6H7l5-6z", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
      { match: /sample|specimen/i, path: "M9 2v2h1v5.59l-5.7 7.6A3 3 0 0 0 6.7 22h10.6a3 3 0 0 0 2.4-4.8L14 9.59V4h1V2zm3 9 5.7 7.6a1 1 0 0 1-.8 1.6H6.7a1 1 0 0 1-.8-1.6z", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
      { match: /amount|payment|subtotal|total/i, path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16zm0-10H4V6h16z", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
      { match: /quality|\bqc\b|verified/i, path: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm-1 16-4-4 1.41-1.41L11 14.17l5.59-5.58L18 10z", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
      { match: /result/i, path: "M3 17h18v2H3zm1-2 5-6 4 3 6-8 2 1.5-7.2 9.5-4.2-3.2L5.6 16z", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
      { match: /report|document/i, path: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm0 2 4 4h-4zm-6 8h8v2H8zm0 4h8v2H8z", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
      { match: /doctor|referral/i, path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
      { match: /equipment|instrument/i, path: "M22.7 19 13.6 9.9a6 6 0 0 0-7.7-7.2l3.5 3.5-3.2 3.2-3.5-3.5a6 6 0 0 0 7.2 7.7l9.1 9.1a1.2 1.2 0 0 0 1.7 0l2-2a1.2 1.2 0 0 0 0-1.7z", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
      { match: /department|laboratory|\blab\b/i, path: "M3 21V3h12v4h6v14H3zm2-2h8V5H5zm10 0h4V9h-4zM7 7h2v2H7zm4 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2z", color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
      { match: /staff|role|permission|user/i, path: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13z", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
      { match: /expense|category|vendor/i, path: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5zm-2 14H7v-2h10zm0-4H7v-2h10zm0-4H7V7h10z", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
      { match: /history|timeline/i, path: "M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5l4.25 2.52 1.03-1.71L14 12V8z", color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
      { match: /status|details|information|summary/i, path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
    ];

    const enhancePanel = (panel: HTMLElement) => {
      panel.classList.add("app-enhanced-drawer");
      panel.querySelectorAll<HTMLElement>("h2, h3").forEach((heading) => {
        if (heading.tagName.toLowerCase() === "h2") {
          let headerRow = heading.parentElement;
          while (headerRow && headerRow !== panel) {
            if (headerRow.classList.contains("justify-between") && headerRow.querySelector("button")) {
              headerRow.querySelectorAll<HTMLButtonElement>("button").forEach((button) =>
                button.classList.add("app-drawer-close-button")
              );
              break;
            }
            headerRow = headerRow.parentElement;
          }
        }
        if (!heading.dataset.drawerHeadingEnhanced) {
          heading.dataset.drawerHeadingEnhanced = "true";
          const headingText = heading.textContent?.trim() ?? "";
          const topic = topics.find(({ match }) => match.test(headingText)) ?? topics[topics.length - 1];
          const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"${topic.color}\" d=\"${topic.path}\"/></svg>`;
          heading.style.setProperty("--drawer-topic-icon", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
          heading.style.setProperty("--drawer-topic-color", topic.color);
          heading.style.setProperty("--drawer-topic-bg", topic.bg);
          heading.style.setProperty("--drawer-topic-border", topic.border);
          heading.classList.add("drawer-topic-heading", "font-bold", "text-slate-950");

          let cursor = heading;
          let existingIcon: Element | null = null;
          const headingIcon = heading.querySelector("svg");
          if (headingIcon) {
            existingIcon = headingIcon;
            headingIcon.setAttribute("class", `${headingIcon.getAttribute("class") ?? ""} drawer-topic-existing-icon`);
          }
          const directPrevious = heading.previousElementSibling;
          const directIcon = existingIcon ?? directPrevious?.querySelector("svg") ??
            (directPrevious?.tagName.toLowerCase() === "svg" ? directPrevious : null);
          if (directIcon) {
            existingIcon = directIcon;
            if (directPrevious instanceof HTMLElement && directPrevious.tagName.toLowerCase() !== "svg") {
              directPrevious.classList.add("drawer-topic-icon-box");
              directPrevious.style.setProperty("--drawer-topic-color", topic.color);
              directPrevious.style.setProperty("--drawer-topic-bg", topic.bg);
              directPrevious.style.setProperty("--drawer-topic-border", topic.border);
            } else {
              directIcon.setAttribute("class", `${directIcon.getAttribute("class") ?? ""} drawer-topic-existing-icon`);
            }
          }
          while (cursor.parentElement && cursor.parentElement !== panel) {
            if (existingIcon) break;
            const previous = cursor.parentElement.previousElementSibling;
            const candidate = previous?.querySelector("svg") ?? (previous?.tagName.toLowerCase() === "svg" ? previous : null);
            if (candidate) {
              existingIcon = candidate;
              if (previous instanceof HTMLElement && previous.tagName.toLowerCase() !== "svg") {
                previous.classList.add("drawer-topic-icon-box");
                previous.style.setProperty("--drawer-topic-color", topic.color);
                previous.style.setProperty("--drawer-topic-bg", topic.bg);
                previous.style.setProperty("--drawer-topic-border", topic.border);
              } else {
                candidate.setAttribute("class", `${candidate.getAttribute("class") ?? ""} drawer-topic-existing-icon`);
              }
              break;
            }
            cursor = cursor.parentElement;
          }
          if (existingIcon) heading.classList.add("drawer-topic-heading-has-icon");
        }

        // Recheck on every mutation: React may mount the heading before its real icon.
        // If one appears later, suppress the generated pseudo-icon to avoid duplicates.
        const activeHeadingText = heading.textContent?.trim() ?? "";
        const activeTopic = topics.find(({ match }) => match.test(activeHeadingText)) ?? topics[topics.length - 1];
        let liveIcon: Element | null = heading.querySelector("svg");
        let iconWrapper: Element | null = null;
        let iconCursor = heading;
        while (!liveIcon && iconCursor.parentElement && iconCursor.parentElement !== panel) {
          const previous = iconCursor.parentElement.previousElementSibling;
          liveIcon = previous?.querySelector("svg") ??
            (previous?.tagName.toLowerCase() === "svg" ? previous : null);
          if (liveIcon) iconWrapper = previous;
          iconCursor = iconCursor.parentElement;
        }
        if (liveIcon) {
          heading.classList.add("drawer-topic-heading-has-icon");
          if (!liveIcon.classList.contains("drawer-topic-existing-icon")) {
            liveIcon.classList.add("drawer-topic-existing-icon");
          }
          if (iconWrapper instanceof HTMLElement && iconWrapper.tagName.toLowerCase() !== "svg") {
            iconWrapper.classList.add("drawer-topic-icon-box");
            iconWrapper.style.setProperty("--drawer-topic-color", activeTopic.color);
            iconWrapper.style.setProperty("--drawer-topic-bg", activeTopic.bg);
            iconWrapper.style.setProperty("--drawer-topic-border", activeTopic.border);
          }
        }
      });

      panel.querySelectorAll<HTMLElement>("p, span, label, th, td, li").forEach((node) => {
        if (node.dataset.drawerTextEnhanced) return;
        const muted = [...node.classList].filter((name) =>
          /^(text-(slate|gray)-(400|500|600))$/.test(name)
        );
        if (muted.length) {
          node.classList.remove(...muted);
          node.classList.add("text-slate-800");
          node.dataset.drawerTextEnhanced = "true";
        }
      });
    };

    const scan = () => {
      document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
        if (button.textContent?.trim().toLowerCase() === "cancel") {
          button.classList.add("app-cancel-button");
        }
      });
      document.querySelectorAll<HTMLElement>(".fixed, .absolute, aside").forEach((panel) => {
        if (!panel.querySelector("h2, h3")) return;
        const isRightDrawer = panel.classList.contains("right-0") ||
          (panel.classList.contains("fixed") && panel.classList.contains("justify-end"));
        if (isRightDrawer) enhancePanel(panel);
      });
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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
    if (event.key === "Escape") {
      setGlobalSearch("");
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

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
        isCollapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
        onHoverExpandedChange={setSidebarHoverExpanded}
      />

      <div className={`app-main ${sidebarCollapsed && !sidebarHoverExpanded ? "sidebar-main-collapsed" : ""}`}>
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
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) =>
                  handleGlobalSearch(
                    event.target.value
                  )
                }
                onBlur={() => {
                  setGlobalSearch("");
                  setSearchResults([]);
                  setSearchOpen(false);
                }}
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder="Search patient ID, name, registration..."
                aria-label="Global search"
              />
            </div>

            {searchOpen && globalSearch.trim() && searchResults.length > 0 && (
              <div className="global-search-results">
                {searchResults.map(
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
                          onMouseDown={(event) => event.preventDefault()}
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

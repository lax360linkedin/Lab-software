import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ScienceIcon from "@mui/icons-material/Science";
import VerifiedIcon from "@mui/icons-material/Verified";
import "./sidebar.css";
import type { UserRole } from "../../components/auth/authTypes";
import { useAuth } from "../../components/auth/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: {
    label: string;
    path: string;
  }[];
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  // ==================== DASHBOARD ====================
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon />,
    roles: ["admin", "receptionist", "lab_technician"],
  },

  // ==================== MASTER DATA ====================
  {
    label: "Tests",
    path: "/tests",
    icon: <HealthAndSafetyOutlinedIcon />,
    roles: ["admin"],
  },

  {
    label: "Doctors / Referrals",
    path: "/doctors",
    icon: <LocalHospitalOutlinedIcon />,
    roles: ["admin", "receptionist"],
  },

  // ==================== PATIENT ====================
  {
    label: "Patients",
    icon: <PeopleOutlineOutlinedIcon />,
    roles: ["admin", "receptionist"],
    children: [
      {
        label: "New Registration",
        path: "/patients/new-registration",
      },
      {
        label: "Patient List",
        path: "/patients",
      },
      {
        label: "Patient History",
        path: "/patients/history",
      },
    ],
  },

  // ==================== BILLING ====================
  {
    label: "Billing",
    icon: <ReceiptLongOutlinedIcon />,
    roles: ["admin", "receptionist"],
    children: [
      {
        label: "New Bill",
        path: "/billing/new",
      },
      {
        label: "Pending Payments",
        path: "/billing/pending-payments",
      },
      {
        label: "Payments",
        path: "/billing/payments",
      },
    ],
  },

  // ==================== ACCESSION ====================
  {
    label: "Accession",
    icon: <BiotechOutlinedIcon />,
    roles: ["admin", "lab_technician"],
    children: [
      {
        label: "Sample Collection",
        path: "/accession/sample-collection",
      },
      {
        label: "Received Samples",
        path: "/accession/received-samples",
      },
      {
        label: "Accepted Samples",
        path: "/accession/accepted-samples",
      },
      {
        label: "Rejected Samples",
        path: "/accession/rejected-samples",
      },
      {
        label: "Sample Tracking",
        path: "/accession/sample-tracking",
      },
    ],
  },

  // ==================== ANALYSIS ====================
  {
    label: "Analysis",
    icon: <ScienceOutlinedIcon />,
    roles: ["admin", "lab_technician"],
    children: [
      {
        label: "Pending Tests",
        path: "/analysis/pending",
      },
      {
        label: "Processing",
        path: "/analysis/processing",
      },
      {
        label: "Completed",
        path: "/analysis/completed",
      },
    ],
  },
  // ==================== RESULTS ====================
  {
    label: "Results",
    icon: <AssignmentOutlinedIcon />,
    roles: ["admin", "lab_technician"],
    children: [
      {
        label: "Pending Results",
        path: "/results/pending-results",
      },
      {
        label: "Enter Results",
        path: "/results/entry",
      },
    ],
  },

  // ==================== QUALITY CONTROL ====================
  {
    label: "Quality Control",
    icon: <ScienceIcon />,
    roles: ["admin", "lab_technician"],
    children: [
      {
        label: "Pending QC",
        path: "/qc/pending",
      },
      {
        label: "QC Passed",
        path: "qc/passed",
      },
      {
        label: "Failed QC",
        path: "qc/failed",
      },
      {
        label: "Corrective Actions",
        path: "/quality-control/corrective-actions",
      },
    ],
  },

  {
    label: "Verification",
    icon: <VerifiedIcon />,
    roles: ["admin", "lab_technician"],
    children: [
      {
        label: "Pending Verification",
        path: "/verification/pending",
      },
      {
        label: "Verified Results",
        path: "/verification/verified",
      },
    ],
  },

  // ==================== REPORTS ====================
  {
    label: "Reports",
    icon: <DescriptionOutlinedIcon />,
    roles: ["admin", "receptionist"],
    children: [
      {
        label: "Pending Reports",
        path: "/reports/pending",
      },
      {
        label: "Generated Reports",
        path: "/reports/final",
      },
      {
        label: "Report History",
        path: "/reports/history",
      },
    ],
  },

  // ==================== NOTIFICATIONS ====================
  {
    label: "Notifications",
    icon: <NotificationsNoneOutlinedIcon />,
    roles: ["admin"],
    children: [
      {
        label: "Report Notifications",
        path: "/notifications/history",
      },
      {
        label: "Message Templates",
        path: "/notifications/templates",
      },
      {
        label: "Notification Settings",
        path: "/notifications/settings",
      },
    ],
  },

  // ==================== FINANCE ====================
  {
    label: "Financial Analysis",
    icon: <AccountBalanceOutlinedIcon />,
    roles: ["admin"],
    children: [
      {
        label: "Today's Collection",
        path: "/financial-analysis/collections",
      },
      {
        label: "Test-wise Revenue",
        path: "/financial-analysis/revenue",
      },
      {
        label: "Total Billing",
        path: "/financial-analysis/total-billing",
      },
      {
        label: "Discounts",
        path: "/financial-analysis/discounts",
      },
      {
        label: "Pending Payments",
        path: "/financial-analysis/pending-payments",
      },
      {
        label: "Monthly Revenue",
        path: "/financial-analysis/monthly-revenue",
      },
      {
        label: "Payment Statistics",
        path: "/financial-analysis/payment-statistics",
      },
    ],
  },

  {
    label: "Expenses",
    icon: <ReceiptOutlinedIcon />,
    roles: ["admin"],
    children: [
      {
        label: "Expense Dashboard",
        path: "/expenses",
      },
      {
        label: "Add Expense",
        path: "/expenses/add",
      },
      {
        label: "Expense List",
        path: "/expenses/list",
      },
      {
        label: "Categories",
        path: "/expenses/categories",
      },
      {
        label: "Expense Reports",
        path: "/expenses/reports",
      },
    ],
  },

  // ==================== ADMINISTRATION ====================
  {
    label: "Staff / Users",
    icon: <GroupsOutlinedIcon />,
    roles: ["admin"],
    children: [
      {
        label: "Users",
        path: "/staff/users",
      },
      {
        label: "Roles",
        path: "/staff/roles",
      },
      {
        label: "Permissions",
        path: "/staff/permissions",
      },
    ],
  },

  {
    label: "Lab Management",
    icon: <BusinessOutlinedIcon />,
    roles: ["admin"],
    children: [
      {
        label: "Departments",
        path: "/lab-management/departments",
      },
      {
        label: "Equipment",
        path: "/lab-management/equipment",
      },
      {
        label: "Lab Settings",
        path: "/lab-management/settings",
      },
    ],
  },

  {
    label: "Lab Profile",
    path: "/lab-profile",
    icon: <BadgeOutlinedIcon />,
    roles: ["admin"],
  },

  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsOutlinedIcon />,
    roles: ["admin"],
  },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    const initial = ["Patients"];
    menuItems.forEach((item) => {
      if (item.children?.some((child) => window.location.pathname.startsWith(child.path))) {
        if (!initial.includes(item.label)) {
          initial.push(item.label);
        }
      }
    });
    return initial;
  });

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
        setOpenMenus((previous) =>
          previous.includes(item.label) ? previous : [...previous, item.label]
        );
      }
    });
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const toggleMenu = (label: string) => {
    setOpenMenus((previous) =>
      previous.includes(label)
        ? previous.filter((item) => item !== label)
        : [...previous, label]
    );
  };

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-lab">
            <div className="sidebar-lab-icon">
              <ScienceOutlinedIcon />
            </div>

            <div className="sidebar-lab-info">
              <strong>{user.labName}</strong>
              <span>
                {user.role === "lab_technician"
                  ? "Lab Technician"
                  : user.role === "receptionist"
                    ? "Receptionist"
                    : "Administrator"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {visibleItems.map((item) => {
            const hasChildren =
              item.children && item.children.length > 0;

            if (!hasChildren && item.path) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? "sidebar-nav-active" : ""
                    }`
                  }
                >
                  <span className="sidebar-nav-icon">
                    {item.icon}
                  </span>

                  <span className="sidebar-nav-label">
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            const isOpenMenu = openMenus.includes(item.label);

            return (
              <div
                className="sidebar-menu-group"
                key={item.label}
              >
                <button
                  type="button"
                  className={`sidebar-nav-item sidebar-menu-button ${isOpenMenu
                    ? "sidebar-menu-open"
                    : ""
                    }`}
                  onClick={() => toggleMenu(item.label)}
                >
                  <span className="sidebar-nav-icon">
                    {item.icon}
                  </span>

                  <span className="sidebar-nav-label">
                    {item.label}
                  </span>

                  <ExpandMoreIcon
                    className={`sidebar-expand-icon ${isOpenMenu ? "sidebar-expand-active" : ""
                      }`}
                  />
                </button>

                {isOpenMenu && item.children && (
                  <div className="sidebar-submenu">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `sidebar-submenu-item ${isActive
                            ? "sidebar-submenu-active"
                            : ""
                          }`
                        }
                      >
                        <span className="sidebar-submenu-dot" />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>Medical Laboratory Management</span>
          <small>v1.0.0</small>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
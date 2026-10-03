import { useNavigate } from "react-router-dom";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../auth/authTypes";

interface DashboardProps {
  role?: UserRole;
}

const Dashboard = ({ role }: DashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole: UserRole = role || user?.role || "admin";

  const allStatistics = [
    {
      id: "total_patients",
      title: "Total Patients",
      value: "1,248",
      description: "Registered patients",
      icon: PeopleAltOutlinedIcon,
      roles: ["admin", "receptionist"] as UserRole[],
    },
    {
      id: "today_patients",
      title: "Today's Patients",
      value: "42",
      description: "Today's registrations",
      icon: PersonAddAltOutlinedIcon,
      roles: ["admin", "receptionist"] as UserRole[],
    },
    {
      id: "today_tests",
      title: "Today's Tests",
      value: "86",
      description: "Tests scheduled today",
      icon: ScienceOutlinedIcon,
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "pending_samples",
      title: "Pending Samples",
      value: "18",
      description: "Waiting for processing",
      icon: Inventory2OutlinedIcon,
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "processing",
      title: "Processing",
      value: "24",
      description: "Samples under analysis",
      icon: PendingActionsOutlinedIcon,
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "pending_verification",
      title: "Pending Verification",
      value: "12",
      description: "Results awaiting review",
      icon: VerifiedOutlinedIcon,
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "pending_reports",
      title: "Pending Reports",
      value: "8",
      description: "Reports to generate",
      icon: DescriptionOutlinedIcon,
      roles: ["admin", "receptionist"] as UserRole[],
    },
    {
      id: "today_collection",
      title: "Today's Collection",
      value: "₹48,650",
      description: "Collected today",
      icon: PaymentsOutlinedIcon,
      roles: ["admin", "receptionist"] as UserRole[],
    },
  ];

  const allQuickActions = [
    {
      id: "new_registration",
      title: "New Registration",
      description: "Register a new patient",
      icon: PersonAddAltOutlinedIcon,
      path: "/patients/new-registration",
      roles: ["admin", "receptionist"] as UserRole[],
    },
    {
      id: "create_bill",
      title: "Create Bill",
      description: "Create patient billing",
      icon: PaymentsOutlinedIcon,
      path: "/billing/new",
      roles: ["admin", "receptionist"] as UserRole[],
    },
    {
      id: "add_test",
      title: "Add Test",
      description: "Create laboratory test",
      icon: ScienceOutlinedIcon,
      path: "/tests",
      roles: ["admin"] as UserRole[],
    },
    {
      id: "collect_sample",
      title: "Collect Sample",
      description: "Record sample collection",
      icon: Inventory2OutlinedIcon,
      path: "/accession/sample-collection",
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "accession",
      title: "Accession",
      description: "Receive collected samples",
      icon: ReceiptLongOutlinedIcon,
      path: "/accession/received-samples",
      roles: ["admin", "lab_technician"] as UserRole[],
    },
    {
      id: "enter_result",
      title: "Enter Result",
      description: "Enter test results",
      icon: DescriptionOutlinedIcon,
      path: "/results/enter",
      roles: ["admin", "lab_technician"] as UserRole[],
    },
  ];

  const pendingSamples = [
    {
      sampleId: "SMP-1025",
      patient: "Arun Kumar",
      test: "Complete Blood Count",
      status: "Pending",
      time: "10:25 AM",
    },
    {
      sampleId: "SMP-1026",
      patient: "Priya Sharma",
      test: "Liver Function Test",
      status: "Processing",
      time: "10:42 AM",
    },
    {
      sampleId: "SMP-1027",
      patient: "Rahul Raj",
      test: "Thyroid Profile",
      status: "Pending",
      time: "11:05 AM",
    },
    {
      sampleId: "SMP-1028",
      patient: "Meena Devi",
      test: "Lipid Profile",
      status: "Processing",
      time: "11:20 AM",
    },
  ];

  const recentRegistrations = [
    {
      regId: "REG-5011",
      patient: "Arun Kumar",
      contact: "+91 98765 43210",
      test: "Complete Blood Count",
      amount: "₹850",
      status: "Paid",
    },
    {
      regId: "REG-5012",
      patient: "Priya Sharma",
      contact: "+91 98123 45678",
      test: "Liver Function Test",
      amount: "₹1,200",
      status: "Pending",
    },
    {
      regId: "REG-5013",
      patient: "Rahul Raj",
      contact: "+91 98456 78901",
      test: "Thyroid Profile",
      amount: "₹950",
      status: "Paid",
    },
    {
      regId: "REG-5014",
      patient: "Meena Devi",
      contact: "+91 98987 65432",
      test: "Lipid Profile",
      amount: "₹1,100",
      status: "Paid",
    },
  ];

  // Role-filtered statistics
  const visibleStatistics =
    currentRole === "admin"
      ? allStatistics
      : allStatistics.filter((item) => item.roles.includes(currentRole));

  // Role-filtered quick actions
  const visibleQuickActions =
    currentRole === "admin"
      ? allQuickActions
      : allQuickActions.filter((item) => item.roles.includes(currentRole));

  // Role metadata for header
  const getRoleHeaderInfo = () => {
    switch (currentRole) {
      case "admin":
        return {
          eyebrow: "Laboratory Overview",
          title: "Admin Dashboard",
          description: "Monitor complete laboratory operations, registrations, analyses, and billing.",
          badge: "Laboratory Overview",
        };
      case "lab_technician":
        return {
          eyebrow: "Laboratory Processing",
          title: "Technician Dashboard",
          description: "Monitor sample accession, pending tests, analysis, and verification results.",
          badge: "Lab Operations",
        };
      case "receptionist":
        return {
          eyebrow: "Patient & Reception Overview",
          title: "Receptionist Dashboard",
          description: "Manage patient registrations, appointments, billing, and report dispatches.",
          badge: "Front Desk Overview",
        };
    }
  };

  const headerInfo = getRoleHeaderInfo();

  // Role-based section visibility
  const showSampleProcessing = currentRole === "admin" || currentRole === "lab_technician";
  const showRecentRegistrations = currentRole === "admin" || currentRole === "receptionist";

  interface PendingTaskItem {
    id: string;
    label: string;
    count: string | number;
    path: string;
    dotColor: string;
  }

  const getPendingTasksForRole = (): PendingTaskItem[] => {
    if (currentRole === "receptionist") {
      return [
        {
          id: "pending_payments",
          label: "Pending Payments",
          count: 5,
          path: "/billing/pending-payments",
          dotColor: "bg-rose-500",
        },
        {
          id: "pending_reports",
          label: "Reports Pending",
          count: 8,
          path: "/reports/pending",
          dotColor: "bg-emerald-500",
        },
        {
          id: "referral_followups",
          label: "Referral Follow-ups",
          count: 14,
          path: "/doctors?tab=referred",
          dotColor: "bg-cyan-500",
        },
      ];
    }

    if (currentRole === "lab_technician") {
      return [
        {
          id: "pending_samples",
          label: "Pending Samples",
          count: 18,
          path: "/accession/sample-tracking",
          dotColor: "bg-amber-500",
        },
        {
          id: "pending_tests",
          label: "Pending Tests",
          count: 15,
          path: "/analysis/pending",
          dotColor: "bg-indigo-500",
        },
        {
          id: "result_processing",
          label: "Result Processing",
          count: 24,
          path: "/results/pending-verification",
          dotColor: "bg-blue-500",
        },
      ];
    }

    // Admin: 5 items
    return [
      {
        id: "pending_samples",
        label: "Pending Samples",
        count: 18,
        path: "/accession/sample-tracking",
        dotColor: "bg-amber-500",
      },
      {
        id: "pending_tests",
        label: "Pending Tests",
        count: 15,
        path: "/analysis/pending",
        dotColor: "bg-indigo-500",
      },
      {
        id: "result_processing",
        label: "Result Processing",
        count: 24,
        path: "/results/pending-verification",
        dotColor: "bg-blue-500",
      },
      {
        id: "quality_check",
        label: "Quality Check",
        count: 12,
        path: "/quality-control/checks",
        dotColor: "bg-teal-500",
      },
      {
        id: "pending_reports",
        label: "Reports Pending",
        count: 8,
        path: "/reports/pending",
        dotColor: "bg-emerald-500",
      },
    ];
  };

  const visiblePendingTasks = getPendingTasksForRole();

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {headerInfo.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {headerInfo.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {headerInfo.description}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
          <AccessTimeOutlinedIcon className="text-lg text-slate-400" />

          <div>
            <p className="text-xs font-medium text-slate-500">Today</p>
            <p className="text-sm font-semibold text-slate-800">
              {headerInfo.badge}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${visibleStatistics.length > 4 ? "xl:grid-cols-4" : "xl:grid-cols-4"}`}>
        {visibleStatistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>

            <p className="mt-1 text-sm text-slate-500">
              {currentRole === "receptionist"
                ? "Patient registration and billing shortcuts"
                : currentRole === "lab_technician"
                ? "Laboratory accession and testing operations"
                : "Frequently used laboratory operations"}
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${visibleQuickActions.length > 4 ? "xl:grid-cols-6" : visibleQuickActions.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
          {visibleQuickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.path)}
                className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="text-xl" />
                  </div>

                  <ArrowForwardOutlinedIcon className="text-lg text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-800">
                  {action.title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Role-Based Sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Recent Registrations & Billing: Receptionist & Admin */}
          {showRecentRegistrations && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Patient Registrations
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest registered patients and billing status
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/patients")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Reg ID
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Patient
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Contact
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Test / Service
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Amount
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentRegistrations.map((row) => (
                      <tr
                        key={row.regId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                          {row.regId}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {row.patient}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {row.contact}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {row.test}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {row.amount}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              row.status === "Paid"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Sample Processing: Lab Technician & Admin */}
          {showSampleProcessing && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sample Processing
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Recently received laboratory samples
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/accession/sample-tracking")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Sample ID
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Patient
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Test
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Time
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingSamples.map((sample) => (
                      <tr
                        key={sample.sampleId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {sample.sampleId}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {sample.patient}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {sample.test}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {sample.time}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              sample.status === "Processing"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {sample.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Pending Work Section */}
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentRole === "receptionist"
                  ? "Front Desk Tasks"
                  : currentRole === "lab_technician"
                  ? "Lab Pending Work"
                  : "Pending Work"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Items requiring attention
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <PendingActionsOutlinedIcon />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {visiblePendingTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => navigate(task.path)}
                className="group flex w-full items-center justify-between rounded-xl border-2 border-slate-300 bg-slate-50/90 px-4 py-3.5 text-left shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50/80 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${task.dotColor} ring-2 ring-white shadow-xs`} />
                  <span className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-700">
                    {task.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex min-w-[30px] items-center justify-center rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-xs border border-slate-300 transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    {task.count}
                  </span>
                  <ArrowForwardOutlinedIcon className="text-base text-slate-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./expenseCategories.css";

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  department: string;
  monthlyBudget: number;
  spentThisMonth: number;
  itemCount: number;
  status: "Active" | "Inactive";
  description: string;
  leadApprover: string;
}

const INITIAL_CATEGORIES: ExpenseCategory[] = [
  {
    id: "CAT-001",
    code: "EXP-ELEC",
    name: "Electricity",
    department: "Facility Operations",
    monthlyBudget: 45000,
    spentThisMonth: 34200,
    itemCount: 4,
    status: "Active",
    description: "Lab high-tension commercial power tariff, uninterrupted UPS backup electricity.",
    leadApprover: "Mr. Rajendran (Facility Mgr)",
  },
  {
    id: "CAT-002",
    code: "EXP-RENT",
    name: "Rent",
    department: "Facility Operations",
    monthlyBudget: 75000,
    spentThisMonth: 75000,
    itemCount: 1,
    status: "Active",
    description: "Premises commercial lease and lab diagnostic center building rental.",
    leadApprover: "Sushmitha (Admin)",
  },
  {
    id: "CAT-003",
    code: "EXP-EQPT",
    name: "Equipment",
    department: "Biochemistry & Hematology",
    monthlyBudget: 100000,
    spentThisMonth: 45000,
    itemCount: 3,
    status: "Active",
    description: "Centrifuges, roller mixers, micropipettes, automated slide stainers.",
    leadApprover: "Er. Karthik Raja (Bio-Medical Eng.)",
  },
  {
    id: "CAT-004",
    code: "EXP-EQMN",
    name: "Equipment Maintenance",
    department: "Biochemistry & Hematology",
    monthlyBudget: 60000,
    spentThisMonth: 36200,
    itemCount: 8,
    status: "Active",
    description: "Annual maintenance contracts (AMC/CMC), calibrations, emergency technician call-outs.",
    leadApprover: "Er. Karthik Raja (Bio-Medical Eng.)",
  },
  {
    id: "CAT-005",
    code: "EXP-CONS",
    name: "Consumables",
    department: "All Laboratories",
    monthlyBudget: 150000,
    spentThisMonth: 112400,
    itemCount: 38,
    status: "Active",
    description: "Reagent packs, controls, calibrators, reaction cups, rinse solutions.",
    leadApprover: "Dr. Arvind Swamy (Chief Pathologist)",
  },
  {
    id: "CAT-006",
    code: "EXP-LMAT",
    name: "Laboratory Materials",
    department: "All Laboratories",
    monthlyBudget: 40000,
    spentThisMonth: 28600,
    itemCount: 22,
    status: "Active",
    description: "Vacutainer blood collection tubes, sterile urine containers, slides, coverslips.",
    leadApprover: "Ms. Uma Maheshwari (Lab In-charge)",
  },
  {
    id: "CAT-007",
    code: "EXP-STAF",
    name: "Staff Expenses",
    department: "Human Resources",
    monthlyBudget: 25000,
    spentThisMonth: 14500,
    itemCount: 9,
    status: "Active",
    description: "Phlebotomist field travel allowances, team uniforms, PPE scrubs, staff tea & pantry.",
    leadApprover: "Ms. Shalini (HR Executive)",
  },
  {
    id: "CAT-008",
    code: "EXP-SALR",
    name: "Salary-related Expenses",
    department: "Human Resources",
    monthlyBudget: 280000,
    spentThisMonth: 280000,
    itemCount: 1,
    status: "Active",
    description: "Pathologist professional honorarium, technician overtime, phlebotomist incentives.",
    leadApprover: "Sushmitha (Admin)",
  },
  {
    id: "CAT-009",
    code: "EXP-INET",
    name: "Internet",
    department: "Front Office & IT",
    monthlyBudget: 5000,
    spentThisMonth: 3499,
    itemCount: 2,
    status: "Active",
    description: "High-speed optical fiber dedicated line for cloud LIS syncing and patient WhatsApp reports.",
    leadApprover: "Mr. Deepak (IT Coordinator)",
  },
  {
    id: "CAT-010",
    code: "EXP-TELE",
    name: "Telephone",
    department: "Front Office & IT",
    monthlyBudget: 3500,
    spentThisMonth: 2250,
    itemCount: 3,
    status: "Active",
    description: "Front desk landline phones, field rider CUG mobile SIM plans.",
    leadApprover: "Mr. Deepak (IT Coordinator)",
  },
  {
    id: "CAT-011",
    code: "EXP-TRAN",
    name: "Transportation",
    department: "Field Phlebotomy",
    monthlyBudget: 30000,
    spentThisMonth: 21400,
    itemCount: 16,
    status: "Active",
    description: "Home collection two-wheeler petrol allowance, emergency courier delivery.",
    leadApprover: "Mr. Suresh Babu (Logistics Lead)",
  },
  {
    id: "CAT-012",
    code: "EXP-CLEN",
    name: "Cleaning",
    department: "Safety & Sanitation",
    monthlyBudget: 20000,
    spentThisMonth: 15300,
    itemCount: 7,
    status: "Active",
    description: "Disinfectant solutions (sodium hypochlorite), biohazard waste bags, autoclave supplies.",
    leadApprover: "Ms. Uma Maheshwari (Lab In-charge)",
  },
  {
    id: "CAT-013",
    code: "EXP-OFFC",
    name: "Office Expenses",
    department: "Front Office & IT",
    monthlyBudget: 15000,
    spentThisMonth: 9400,
    itemCount: 11,
    status: "Active",
    description: "Printer laser cartridges, thermal barcode rolls, patient bill receipt papers.",
    leadApprover: "Ms. Deepa (Front Desk)",
  },
  {
    id: "CAT-014",
    code: "EXP-OTHR",
    name: "Other",
    department: "General Administration",
    monthlyBudget: 10000,
    spentThisMonth: 4200,
    itemCount: 4,
    status: "Active",
    description: "Miscellaneous administrative sundries, bank charges, audit filing fees.",
    leadApprover: "Sushmitha (Admin)",
  },
];

export default function ExpenseCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<ExpenseCategory | null>(null);

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "All Laboratories",
    monthlyBudget: "",
    description: "",
    leadApprover: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Calculate Metrics
  const totalBudget = useMemo(
    () => categories.reduce((sum, c) => sum + c.monthlyBudget, 0),
    [categories]
  );
  const totalSpent = useMemo(
    () => categories.reduce((sum, c) => sum + c.spentThisMonth, 0),
    [categories]
  );
  const overallUtilPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const highAlertCount = categories.filter(
    (c) => c.spentThisMonth / c.monthlyBudget >= 0.85
  ).length;

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.leadApprover.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        departmentFilter === "all" || cat.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || cat.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [categories, searchQuery, departmentFilter, statusFilter]);

  // Paginated Slice
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      code: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      department: "All Laboratories",
      monthlyBudget: "",
      description: "",
      leadApprover: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      department: cat.department,
      monthlyBudget: cat.monthlyBudget.toString(),
      description: cat.description,
      leadApprover: cat.leadApprover,
      status: cat.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedBudget = parseFloat(formData.monthlyBudget) || 0;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                code: formData.code.toUpperCase(),
                name: formData.name,
                department: formData.department,
                monthlyBudget: parsedBudget,
                description: formData.description,
                leadApprover: formData.leadApprover || "Authorized Lab Officer",
                status: formData.status,
              }
            : c
        )
      );
    } else {
      const newCategory: ExpenseCategory = {
        id: `CAT-00${categories.length + 1}`,
        code: formData.code.toUpperCase() || `EXP-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        department: formData.department,
        monthlyBudget: parsedBudget,
        spentThisMonth: 0,
        itemCount: 0,
        status: formData.status,
        description: formData.description,
        leadApprover: formData.leadApprover || "Authorized Lab Officer",
      };
      setCategories((prev) => [newCategory, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
      )
    );
  };

  const columns = [
    "Category & Code",
    "Department",
    "Monthly Budget",
    "Spent This Month",
    "Budget Utilization",
    "Approver",
    "Status",
    "Actions",
  ];

  return (
    <div className="expense-categories-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Expenses</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Cost Centers</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Expense Categories & Budgets
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Configure lab cost centers, allocate monthly spending ceilings, and monitor department utilization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/expenses/list")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>View All Expenses</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Categories
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CategoryOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {categories.filter((c) => c.status === "Active").length}{" "}
            <span className="text-sm font-normal text-slate-500">/ {categories.length} total</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Across laboratory operations</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Monthly Budget
            </p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <AccountBalanceWalletOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹ {totalBudget.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Approved for current cycle</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Month-to-Date Consumed
            </p>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUpOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹ {totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Remaining: ₹ {(totalBudget - totalSpent).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Utilization & Alerts
            </p>
            <span
              className={`rounded-lg p-2 ${
                overallUtilPercent > 80 ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"
              }`}
            >
              <WarningAmberOutlinedIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {overallUtilPercent.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            {highAlertCount > 0
              ? `${highAlertCount} near budget limit (>85%)`
              : "All categories within safe budget"}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search category, code, or approver..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="All Laboratories">All Laboratories</option>
                <option value="Biochemistry & Hematology">Biochemistry & Hematology</option>
                <option value="Safety & Sanitation">Safety & Sanitation</option>
                <option value="Facility Operations">Facility Operations</option>
                <option value="Quality & Compliance">Quality & Compliance</option>
                <option value="Field Phlebotomy">Field Phlebotomy</option>
                <option value="Front Office & IT">Front Office & IT</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedCategories}
            maxHeight="380px"
            minWidth="1200px"
            emptyMessage="No expense categories match your search criteria."
            renderRow={(cat: ExpenseCategory) => {
              const util =
                cat.monthlyBudget > 0
                  ? (cat.spentThisMonth / cat.monthlyBudget) * 100
                  : 0;
              let barColor = "bg-emerald-500";
              let textBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

              if (util >= 90) {
                barColor = "bg-rose-500";
                textBadgeColor = "text-rose-700 bg-rose-50 border-rose-200";
              } else if (util >= 75) {
                barColor = "bg-amber-500";
                textBadgeColor = "text-amber-700 bg-amber-50 border-amber-200";
              }

              return (
                <>
                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <div className="font-semibold text-slate-900 text-sm">{cat.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {cat.code}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{cat.itemCount} items booked</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {cat.department}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-slate-800">
                    ₹ {cat.monthlyBudget.toLocaleString("en-IN")}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-900">
                    ₹ {cat.spentThisMonth.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3.5 text-left min-w-[200px]">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className={`px-1.5 py-0.5 rounded border text-[11px] font-bold ${textBadgeColor}`}>
                        {util.toFixed(1)}%
                      </span>
                      <span className="text-slate-400 text-xs">
                        ₹ {(cat.monthlyBudget - cat.spentThisMonth).toLocaleString("en-IN")} left
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.min(util, 100)}%` }}
                      />
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-600">
                    {cat.leadApprover}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cat.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                        cat.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                      title="Click to toggle status"
                    >
                      {cat.status}
                    </button>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingCategory(cat)}
                        className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="View Category Details"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Edit Category"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Category"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </>
              );
            }}
          />
        </div>

        {/* Standard Pagination matching Patient List & Financial Analysis */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <Pagination
            totalItems={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Add / Edit Category Slide-over Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-blue-100 p-2 text-blue-600">
                    <CategoryOutlinedIcon sx={{ fontSize: 22 }} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingCategory ? "Edit Expense Category" : "Add New Expense Category"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Define budget constraints and assign responsibility
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              <form id="categoryForm" onSubmit={handleSaveCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Immunoassay Reagents"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EXP-IMM"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="All Laboratories">All Laboratories</option>
                      <option value="Biochemistry & Hematology">Biochemistry & Hematology</option>
                      <option value="Safety & Sanitation">Safety & Sanitation</option>
                      <option value="Facility Operations">Facility Operations</option>
                      <option value="Quality & Compliance">Quality & Compliance</option>
                      <option value="Field Phlebotomy">Field Phlebotomy</option>
                      <option value="Front Office & IT">Front Office & IT</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Budget Ceiling (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="e.g. 150000"
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "Active" | "Inactive",
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designated Approver / Head
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar (Senior Consultant)"
                    value={formData.leadApprover}
                    onChange={(e) => setFormData({ ...formData, leadApprover: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description / Inclusions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What items fall under this category?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="categoryForm"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Category Slide-over Drawer */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <CategoryOutlinedIcon sx={{ fontSize: 22 }} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{viewingCategory.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{viewingCategory.code}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCategory(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Department</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{viewingCategory.department}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Status</span>
                    <p className="text-sm font-semibold mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        viewingCategory.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        {viewingCategory.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Monthly Budget</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">₹ {viewingCategory.monthlyBudget.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Spent This Month</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">₹ {viewingCategory.spentThisMonth.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-xs text-slate-500 font-medium">Budget Utilization</span>
                  <div className="flex items-center justify-between text-xs font-semibold mt-1 mb-1.5">
                    <span>
                      {((viewingCategory.spentThisMonth / (viewingCategory.monthlyBudget || 1)) * 100).toFixed(1)}% used
                    </span>
                    <span className="text-slate-500">
                      ₹ {(viewingCategory.monthlyBudget - viewingCategory.spentThisMonth).toLocaleString("en-IN")} remaining
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.min(100, (viewingCategory.spentThisMonth / (viewingCategory.monthlyBudget || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-xs text-slate-500 font-medium">Lead Approver</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{viewingCategory.leadApprover}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">{viewingCategory.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  const cat = viewingCategory;
                  setViewingCategory(null);
                  handleOpenEditModal(cat);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Edit Category
              </button>
              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

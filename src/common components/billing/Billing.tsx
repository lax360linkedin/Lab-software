import { useNavigate } from "react-router-dom";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

const Billing = () => {
  const navigate = useNavigate();

  const bills = JSON.parse(localStorage.getItem("lab_bills") || "[]");

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill: { paymentStatus?: string }) =>
      bill.paymentStatus === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill: { paymentStatus?: string }) =>
      bill.paymentStatus === "Pending"
  ).length;

  const totalRevenue = bills
    .filter(
      (bill: { paymentStatus?: string }) =>
        bill.paymentStatus === "Paid"
    )
    .reduce(
      (total: number, bill: { grandTotal?: number }) =>
        total + Number(bill.grandTotal || 0),
      0
    );

  const billingSections = [
    {
      title: "New Bill",
      description:
        "Create a new bill for a patient based on their selected laboratory tests.",
      icon: ReceiptLongOutlinedIcon,
      action: () => navigate("/billing/new"),
      buttonText: "Create New Bill",
    },
    {
      title: "Payments",
      description:
        "View and manage completed patient payments and payment records.",
      icon: PaymentsOutlinedIcon,
      action: () => navigate("/billing/payments"),
      buttonText: "View Payments",
    },
    {
      title: "Pending Payments",
      description:
        "Track bills where payment is pending and collect outstanding amounts.",
      icon: PendingActionsOutlinedIcon,
      action: () => navigate("/billing/pending-payments"),
      buttonText: "View Pending",
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Billing
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage laboratory bills, payments, and outstanding balances.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Bills */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Bills
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {totalBills}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ReceiptLongOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Paid Bills */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Paid Bills
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {paidBills}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <PaymentsOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Pending Payments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {pendingBills}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <PendingActionsOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Paid Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <PaymentsOutlinedIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Sections */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Billing Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an option to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {billingSections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon />
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  {section.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {section.description}
                </p>

                <button
                  type="button"
                  onClick={section.action}
                  className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  {section.buttonText}

                  <ArrowForwardOutlinedIcon fontSize="small" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Billing;
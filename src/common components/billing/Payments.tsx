import { useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

interface BillTest {
  id: number;
  testName: string;
  category: string;
  price: number;
  quantity: number;
}

interface Bill {
  billNumber: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  doctorReferral?: string;
  tests: BillTest[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  billDate: string;
  paymentId?: string;
  paymentDate?: string;
}

const getPaidBills = (): Bill[] => {
  try {
    const storedBills = JSON.parse(
      localStorage.getItem("lab_bills") || "[]"
    );

    if (!Array.isArray(storedBills)) {
      return [];
    }

    return storedBills.filter(
      (bill: Bill) => bill.paymentStatus === "Paid"
    );
  } catch {
    return [];
  }
};

const Payments = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Bill | null>(
    null
  );

  const payments = getPaidBills();

  const filteredPayments = payments.filter((payment) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      payment.billNumber.toLowerCase().includes(search) ||
      payment.patientId.toLowerCase().includes(search) ||
      payment.registrationId.toLowerCase().includes(search) ||
      payment.patientName.toLowerCase().includes(search)
    );
  });

  const totalReceived = payments.reduce(
    (total, payment) => total + Number(payment.grandTotal || 0),
    0
  );

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowBackOutlinedIcon fontSize="small" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage completed laboratory payments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <PaymentsOutlinedIcon />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Total Received
            </p>

            <p className="font-semibold text-slate-800">
              ₹{totalReceived.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <SearchOutlinedIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search Bill No, Patient ID, Registration ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-medium">
                  Payment ID
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Bill Number
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Registration ID
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Patient Name
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Amount
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Payment Method
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Payment Date
                </th>

                <th className="px-5 py-3 text-center font-medium">
                  Status
                </th>

                <th className="px-5 py-3 text-center font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr
                    key={`${payment.billNumber}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {payment.paymentId ||
                        `PAY-${String(index + 1).padStart(5, "0")}`}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.billNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.registrationId}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {payment.patientName}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-slate-700">
                      ₹{Number(payment.grandTotal).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(
                        payment.paymentDate || payment.billDate
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        Paid
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <PaymentsOutlinedIcon />
                      </div>

                      <p className="font-medium text-slate-700">
                        No payments found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Completed payments will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredPayments.length}
              </span>{" "}
              payment
              {filteredPayments.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* View Payment Drawer */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedPayment(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Payment Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedPayment.paymentId || "Payment Record"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseOutlinedIcon />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Status */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700">
                      Payment Status
                    </p>

                    <p className="mt-1 text-lg font-semibold text-green-800">
                      Paid
                    </p>
                  </div>

                  <PaymentsOutlinedIcon className="text-green-600" />
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Patient Information
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Patient Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.patientName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Patient ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.patientId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Registration ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.registrationId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Doctor / Referral
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.doctorReferral || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Bill Information
                </h3>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Bill Number
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {selectedPayment.billNumber}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedPayment.tests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {test.testName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {test.category} × {test.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-medium text-slate-700">
                          ₹
                          {(
                            test.price * test.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Payment Summary
                </h3>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-slate-700">
                        ₹
                        {Number(
                          selectedPayment.subtotal
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span className="font-medium text-slate-700">
                        - ₹
                        {Number(
                          selectedPayment.discount
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Tax
                      </span>

                      <span className="font-medium text-slate-700">
                        ₹
                        {Number(
                          selectedPayment.tax
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-800">
                          Total Paid
                        </span>

                        <span className="text-lg font-bold text-blue-600">
                          ₹
                          {Number(
                            selectedPayment.grandTotal
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Payment Details
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Payment Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDateTime(
                        selectedPayment.paymentDate ||
                          selectedPayment.billDate
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
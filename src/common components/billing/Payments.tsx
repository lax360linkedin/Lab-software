import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../Table";
import Pagination from "../Pagination";

interface BillTest {
    id: number;
    testId?: string;
    testCode?: string;
    testName: string;
    category?: string;
    price: number;
    quantity: number;
    sampleType?: string;
    method?: string;
    turnaroundTime?: string;
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
    paymentStatus: "Pending" | "Paid";
    billDate: string;
    paymentId?: string;
    paymentDate?: string;
}

const getPaidBills = (): Bill[] => {
    try {
        const storedBills = localStorage.getItem("lab_bills");

        if (!storedBills) {
            return [];
        }

        const bills: Bill[] = JSON.parse(storedBills);

        return bills.filter(
            (bill) => bill.paymentStatus === "Paid"
        );
    } catch (error) {
        console.error("Failed to load paid bills:", error);
        return [];
    }
};

const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatAmount = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const printPaymentReceipt = (bill: Bill) => {
    const printWindow = window.open(
        "",
        "_blank",
        "width=800,height=900"
    );

    if (!printWindow) {
        alert("Please allow pop-ups to print the receipt.");
        return;
    }

    const testRows = bill.tests
        .map(
            (test, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        ${test.testCode ? `${test.testCode} - ` : ""}
                        ${test.testName}
                    </td>
                    <td>${test.category || "-"}</td>
                    <td style="text-align:center;">
                        ${test.quantity}
                    </td>
                    <td style="text-align:right;">
                        ₹${formatAmount(test.price)}
                    </td>
                    <td style="text-align:right;">
                        ₹${formatAmount(
                            Number(test.price || 0) *
                                Number(test.quantity || 0)
                        )}
                    </td>
                </tr>
            `
        )
        .join("");

    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - ${bill.billNumber}</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 30px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #1f2937;
                    background: #ffffff;
                    font-size: 13px;
                }

                .receipt {
                    max-width: 760px;
                    margin: 0 auto;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #1e3a8a;
                    padding-bottom: 18px;
                    margin-bottom: 20px;
                }

                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    color: #1e3a8a;
                }

                .header p {
                    margin: 5px 0 0;
                    color: #64748b;
                    font-size: 13px;
                }

                .receipt-title {
                    text-align: center;
                    margin: 18px 0;
                }

                .receipt-title h2 {
                    margin: 0;
                    font-size: 18px;
                    text-transform: uppercase;
                }

                .status {
                    display: inline-block;
                    margin-top: 8px;
                    padding: 5px 14px;
                    border-radius: 20px;
                    background: #dcfce7;
                    color: #166534;
                    font-weight: 600;
                    font-size: 12px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px 30px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .info-item {
                    display: flex;
                    gap: 8px;
                }

                .label {
                    color: #64748b;
                    min-width: 110px;
                }

                .value {
                    font-weight: 600;
                    color: #1e293b;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }

                th {
                    background: #1e3a8a;
                    color: white;
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 12px;
                }

                td {
                    border-bottom: 1px solid #e2e8f0;
                    padding: 10px 8px;
                }

                .summary {
                    width: 320px;
                    margin-left: auto;
                    margin-top: 20px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 7px 0;
                    border-bottom: 1px solid #e2e8f0;
                }

                .summary-row.total {
                    border-top: 2px solid #1e3a8a;
                    border-bottom: none;
                    margin-top: 5px;
                    padding-top: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e3a8a;
                }

                .footer {
                    text-align: center;
                    margin-top: 35px;
                    padding-top: 15px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 11px;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .receipt {
                        max-width: none;
                    }
                }
            </style>
        </head>

        <body>
            <div class="receipt">

                <div class="header">
                    <h1>Laboratory Management System</h1>
                    <p>Payment Receipt</p>
                </div>

                <div class="receipt-title">
                    <h2>Payment Receipt</h2>
                    <div class="status">PAID</div>
                </div>

                <div class="info-grid">

                    <div class="info-item">
                        <span class="label">Bill Number:</span>
                        <span class="value">
                            ${bill.billNumber}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Payment ID:</span>
                        <span class="value">
                            ${bill.paymentId || "-"}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Patient ID:</span>
                        <span class="value">
                            ${bill.patientId}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Registration ID:</span>
                        <span class="value">
                            ${bill.registrationId}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Patient Name:</span>
                        <span class="value">
                            ${bill.patientName}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Doctor / Referral:</span>
                        <span class="value">
                            ${bill.doctorReferral || "-"}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Bill Date:</span>
                        <span class="value">
                            ${formatDate(bill.billDate)}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Payment Date:</span>
                        <span class="value">
                            ${formatDateTime(bill.paymentDate)}
                        </span>
                    </div>

                    <div class="info-item">
                        <span class="label">Payment Method:</span>
                        <span class="value">
                            ${bill.paymentMethod || "-"}
                        </span>
                    </div>

                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Test</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${testRows}
                    </tbody>
                </table>

                <div class="summary">

                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>
                            ₹${formatAmount(bill.subtotal)}
                        </span>
                    </div>

                    <div class="summary-row">
                        <span>Discount</span>
                        <span>
                            ₹${formatAmount(bill.discount)}
                        </span>
                    </div>

                    <div class="summary-row">
                        <span>Tax</span>
                        <span>
                            ₹${formatAmount(bill.tax)}
                        </span>
                    </div>

                    <div class="summary-row total">
                        <span>Total Paid</span>
                        <span>
                            ₹${formatAmount(bill.grandTotal)}
                        </span>
                    </div>

                </div>

                <div class="footer">
                    <p>Thank you for choosing our laboratory.</p>
                    <p>This is a computer-generated payment receipt.</p>
                </div>

            </div>

            <script>
                window.onload = function () {

                    setTimeout(function () {

                        window.focus();

                        window.print();

                    }, 300);

                };

                window.onafterprint = function () {

                    setTimeout(function () {

                        window.close();

                    }, 200);

                };
            </script>

        </body>
        </html>
    `);

    printWindow.document.close();
};

const Payments = () => {
    const [payments] = useState<Bill[]>(() => getPaidBills());
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const filteredPayments = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) {
            return payments;
        }
        return payments.filter((payment) => {
            return (
                payment.billNumber
                    ?.toLowerCase()
                    .includes(search) ||
                payment.patientId
                    ?.toLowerCase()
                    .includes(search) ||
                payment.registrationId
                    ?.toLowerCase()
                    .includes(search) ||
                payment.patientName
                    ?.toLowerCase()
                    .includes(search)
            );
        });
    }, [payments, searchTerm]);

    const totalReceived = useMemo(() => {
        return payments.reduce(
            (total, payment) =>
                total + Number(payment.grandTotal || 0),
            0
        );
    }, [payments]);

    const totalPages = Math.ceil(
        filteredPayments.length / rowsPerPage
    );

    const safeCurrentPage =
        totalPages > 0
            ? Math.min(currentPage, totalPages)
            : 1;

    const startIndex =
        (safeCurrentPage - 1) * rowsPerPage;

    const currentPayments = filteredPayments.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    const columns = [
        "Payment ID",
        "Bill Number",
        "Patient",
        "Registration ID",
        "Amount",
        "Payment Method",
        "Payment Date",
        "Status",
        "Actions",
    ];

    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleRowsPerPageChange = (
        value: number
    ) => {
        setRowsPerPage(value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Payments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View completed payments and print receipts
                        whenever required.
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Received
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        ₹{formatAmount(totalReceived)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Completed Payments
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        {payments.length}
                    </p>
                </div>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative max-w-md">
                    <SearchIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        fontSize="small"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search bill, patient or registration..."
                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {currentPayments.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                data={currentPayments}
                                maxHeight="500px"
                                renderRow={(payment: Bill) => (
                                    <>
                                        {/* Payment ID */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap font-medium text-slate-700">
                                                {payment.paymentId || "-"}
                                            </span>
                                        </td>

                                        {/* Bill Number */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap font-medium text-blue-700">
                                                {payment.billNumber}
                                            </span>
                                        </td>

                                        {/* Patient */}
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="whitespace-nowrap font-medium text-slate-800">
                                                    {payment.patientName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payment.patientId}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Registration ID */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap text-sm text-slate-600">
                                                {payment.registrationId}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap font-semibold text-slate-800">
                                                ₹
                                                {formatAmount(
                                                    payment.grandTotal
                                                )}
                                            </span>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap text-sm text-slate-600">
                                                {payment.paymentMethod ||
                                                    "-"}
                                            </span>
                                        </td>

                                        {/* Payment Date */}
                                        <td className="px-4 py-4">
                                            <span className="whitespace-nowrap text-sm text-slate-600">
                                                {formatDateTime(
                                                    payment.paymentDate
                                                )}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                Paid
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedBill(
                                                            payment
                                                        )
                                                    }
                                                    title="View Payment"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <VisibilityOutlinedIcon
                                                        fontSize="small"
                                                    />
                                                </button>

                                                {/* Print */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        printPaymentReceipt(
                                                            payment
                                                        )
                                                    }
                                                    title="Print Receipt"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                                                >
                                                    <PrintOutlinedIcon
                                                        fontSize="small"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            />
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-slate-200 px-4 py-3">
                            <Pagination
                                totalItems={filteredPayments.length}
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={
                                    handleRowsPerPageChange
                                }
                                currentPage={safeCurrentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
                        <div>
                            <p className="text-base font-semibold text-slate-700">
                                No completed payments found
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {searchTerm
                                    ? "Try changing your search."
                                    : "Completed payments will appear here after payment confirmation."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {selectedBill && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
                    <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Payment Details
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {selectedBill.paymentId || "-"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedBill(null)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Payment Status */}
                            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-700">
                                            Payment Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-green-800">
                                            Payment Completed
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        PAID
                                    </span>
                                </div>
                            </div>

                            {/* Patient Details */}
                            <div className="mb-5">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Patient Information
                                </h3>

                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Patient Name
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.patientName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Patient ID
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.patientId}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Registration ID
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.registrationId}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Doctor / Referral
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.doctorReferral ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bill Details */}
                            <div className="mb-5">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Payment Information
                                </h3>

                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Bill Number
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.billNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Payment ID
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.paymentId ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Payment Method
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {selectedBill.paymentMethod ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Payment Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {formatDateTime(
                                                selectedBill.paymentDate
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tests */}
                            <div className="mb-5">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Tests
                                </h3>

                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px]">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Test
                                                    </th>

                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Qty
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Price
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedBill.tests.map(
                                                    (test) => (
                                                        <tr
                                                            key={
                                                                test.id
                                                            }
                                                            className="border-t border-slate-100"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm font-medium text-slate-700">
                                                                    {test.testName}
                                                                </p>

                                                                {test.testCode && (
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {
                                                                            test.testCode
                                                                        }
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-center text-sm text-slate-600">
                                                                {
                                                                    test.quantity
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                                                                ₹
                                                                {formatAmount(
                                                                    test.price
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                                                                ₹
                                                                {formatAmount(
                                                                    Number(
                                                                        test.price ||
                                                                            0
                                                                    ) *
                                                                        Number(
                                                                            test.quantity ||
                                                                                0
                                                                        )
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Summary */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">
                                            Subtotal
                                        </span>

                                        <span className="font-medium text-slate-700">
                                            ₹
                                            {formatAmount(
                                                selectedBill.subtotal
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">
                                            Discount
                                        </span>

                                        <span className="font-medium text-slate-700">
                                            ₹
                                            {formatAmount(
                                                selectedBill.discount
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">
                                            Tax
                                        </span>

                                        <span className="font-medium text-slate-700">
                                            ₹
                                            {formatAmount(
                                                selectedBill.tax
                                            )}
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">
                                                Total Paid
                                            </span>

                                            <span className="text-xl font-bold text-blue-700">
                                                ₹
                                                {formatAmount(
                                                    selectedBill.grandTotal
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={() =>
                                    printPaymentReceipt(
                                        selectedBill
                                    )
                                }
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <PrintOutlinedIcon fontSize="small" />
                                Print Receipt
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedBill(null)
                                }
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Table from "../Table";
import Pagination from "../Pagination";
import "./NewBillPrint.css";

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

const getPendingBills = (): Bill[] => {
    try {
        const storedBills = JSON.parse(
            localStorage.getItem("lab_bills") || "[]"
        );

        if (!Array.isArray(storedBills)) {
            return [];
        }

        return storedBills.filter(
            (bill: Bill) => bill.paymentStatus === "Pending"
        );
    } catch {
        return [];
    }
};

const BillingPendingPayments = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [refreshKey, setRefreshKey] = useState(0);

    // Payment receipt print preview
    const [showPrintForm, setShowPrintForm] = useState(false);
    const [paidBill, setPaidBill] = useState<Bill | null>(null);

    const pendingBills = useMemo(() => {
        return getPendingBills();
    }, [refreshKey]);

    const filteredBills = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return pendingBills;
        }

        return pendingBills.filter((bill) => {
            return (
                bill.billNumber.toLowerCase().includes(search) ||
                bill.registrationId.toLowerCase().includes(search) ||
                bill.patientId.toLowerCase().includes(search) ||
                bill.patientName.toLowerCase().includes(search)
            );
        });
    }, [pendingBills, searchTerm]);

    const currentData = filteredBills.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const pendingAmount = pendingBills.reduce(
        (total, bill) => total + bill.grandTotal,
        0
    );

    const formatDate = (date: string) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date: string) => {
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

    const columns = [
        "Bill Number",
        "Registration ID",
        "Patient ID",
        "Patient Name",
        "Total Amount",
        "Bill Date",
        "Status",
        "Actions",
    ];

    const handleSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleCollectPayment = () => {
        if (!selectedBill) {
            return;
        }

        try {
            const storedBills = JSON.parse(
                localStorage.getItem("lab_bills") || "[]"
            );

            if (!Array.isArray(storedBills)) {
                alert("Unable to process payment.");
                return;
            }

            const paymentId = `PAY-${Date.now()
                .toString()
                .slice(-6)}`;

            const paymentDate = new Date().toISOString();

            const paidBillData: Bill = {
                ...selectedBill,
                paymentStatus: "Paid",
                paymentMethod,
                paymentId,
                paymentDate,
            };

            const updatedBills = storedBills.map((bill: Bill) =>
                bill.billNumber === selectedBill.billNumber
                    ? paidBillData
                    : bill
            );

            localStorage.setItem(
                "lab_bills",
                JSON.stringify(updatedBills)
            );

            // Close payment drawer
            setSelectedBill(null);

            // Refresh pending payments
            setRefreshKey((prev) => prev + 1);
            setCurrentPage(1);

            // Open receipt preview
            setPaidBill(paidBillData);
            setShowPrintForm(true);
        } catch (error) {
            console.error(
                "Failed to collect payment:",
                error
            );

            alert(
                "Failed to collect payment. Please try again."
            );
        }
    };

    const handleClosePrintForm = () => {
        setShowPrintForm(false);
        setPaidBill(null);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <>
            {/* =====================================================
                PAGE
            ====================================================== */}
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="p-4 sm:p-6">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-start gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/billing")
                                    }
                                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                                >
                                    <ArrowBackOutlinedIcon fontSize="small" />
                                </button>

                                <div>
                                    <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                                        Pending Payments
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        View and collect outstanding
                                        patient payments
                                    </p>
                                </div>

                            </div>

                            {/* Summary */}
                            <div className="flex items-center gap-3">

                                <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                                    <p className="text-xs font-medium text-orange-600">
                                        Pending Amount
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-orange-700">
                                        ₹
                                        {pendingAmount.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        Pending Bills
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-800">
                                        {pendingBills.length}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>

                {/* Search */}
                <div className="p-4 sm:p-6">

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="relative w-full max-w-md">

                            <SearchOutlinedIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fontSize="small"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search Bill Number, Patient ID, Registration ID or Name"
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                            />

                        </div>

                    </div>

                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="p-3 sm:p-5">

                        <div className="overflow-x-auto">

                            <Table
                                columns={columns}
                                data={currentData}
                                maxHeight="500px"
                                renderRow={(bill: Bill) => (
                                    <>
                                        {/* Bill Number */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                                                {bill.billNumber}
                                            </p>
                                        </td>

                                        {/* Registration ID */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm text-slate-600">
                                                {bill.registrationId}
                                            </p>
                                        </td>

                                        {/* Patient ID */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm text-slate-600">
                                                {bill.patientId}
                                            </p>
                                        </td>

                                        {/* Patient Name */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm text-slate-600">
                                                {bill.patientName}
                                            </p>
                                        </td>

                                        {/* Total Amount */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm text-slate-600">
                                                ₹
                                                {Number(
                                                    bill.grandTotal
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </td>

                                        {/* Bill Date */}
                                        <td className="px-5 py-4">
                                            <p className="whitespace-nowrap text-sm text-slate-600">
                                                {formatDate(
                                                    bill.billDate
                                                )}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                                Pending
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">

                                            <div className="flex items-center justify-center gap-2">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    title="View Bill"
                                                    onClick={() =>
                                                        setSelectedBill(
                                                            bill
                                                        )
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </button>

                                                {/* Collect */}
                                                <button
                                                    type="button"
                                                    title="Collect Payment"
                                                    onClick={() => {
                                                        setSelectedBill(
                                                            bill
                                                        );
                                                        setPaymentMethod(
                                                            "Cash"
                                                        );
                                                    }}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
                                                >
                                                    <PaymentsOutlinedIcon fontSize="small" />
                                                </button>

                                            </div>

                                        </td>
                                    </>
                                )}
                            />

                        </div>

                        {/* Empty State */}
                        {currentData.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">

                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                                    <CheckCircleOutlineOutlinedIcon />
                                </div>

                                <p className="font-medium text-slate-700">
                                    No pending payments
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {searchTerm
                                        ? "Try changing your search."
                                        : "All current bills have been paid."}
                                </p>

                            </div>
                        )}

                        {/* Pagination */}
                        {filteredBills.length > 0 && (
                            <div className="mt-5 border-t border-slate-100 pt-4">

                                <Pagination
                                    totalItems={filteredBills.length}
                                    rowsPerPage={rowsPerPage}
                                    setRowsPerPage={setRowsPerPage}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />

                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* =====================================================
                PAYMENT DRAWER
            ====================================================== */}
            {selectedBill && (
                <div className="fixed inset-0 z-[9990]">

                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() =>
                            setSelectedBill(null)
                        }
                    />

                    {/* Drawer */}
                    <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Collect Payment
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedBill.billNumber}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedBill(null)
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <CloseOutlinedIcon />
                            </button>

                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5">

                            {/* Patient Information */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                                    Patient Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Patient Name
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {
                                                selectedBill.patientName
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Patient ID
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {
                                                selectedBill.patientId
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Registration ID
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {
                                                selectedBill.registrationId
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Doctor / Referral
                                        </p>

                                        <p className="mt-1 font-medium text-slate-800">
                                            {
                                                selectedBill.doctorReferral ||
                                                "-"
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {/* Bill Details */}
                            <div className="mt-5">

                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Bill Details
                                </h3>

                                <div className="overflow-hidden rounded-xl border border-slate-200">

                                    <table className="w-full text-sm">

                                        <thead>
                                            <tr className="bg-slate-100">

                                                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                                    Test
                                                </th>

                                                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                                                    Qty
                                                </th>

                                                <th className="px-4 py-3 text-right font-semibold text-slate-700">
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

                                                            <p className="font-medium text-slate-800">
                                                                {
                                                                    test.testName
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    test.category
                                                                }
                                                            </p>

                                                        </td>

                                                        <td className="px-4 py-3 text-center text-slate-600">
                                                            {
                                                                test.quantity
                                                            }
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                                                            ₹
                                                            {(
                                                                test.price *
                                                                test.quantity
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            {/* Amount */}
                            <div className="mt-5 rounded-xl border border-slate-200 p-4">

                                <div className="flex justify-between py-2 text-sm">

                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        ₹
                                        {selectedBill.subtotal.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </span>

                                </div>

                                <div className="flex justify-between py-2 text-sm">

                                    <span className="text-slate-500">
                                        Discount
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        - ₹
                                        {selectedBill.discount.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </span>

                                </div>

                                <div className="flex justify-between py-2 text-sm">

                                    <span className="text-slate-500">
                                        Tax
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        ₹
                                        {selectedBill.tax.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </span>

                                </div>

                                <div className="mt-2 flex justify-between border-t border-slate-200 pt-4">

                                    <span className="font-semibold text-slate-800">
                                        Total Payable
                                    </span>

                                    <span className="text-xl font-bold text-slate-900">
                                        ₹
                                        {selectedBill.grandTotal.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </span>

                                </div>

                            </div>

                            {/* Payment Method */}
                            <div className="mt-5">

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Payment Method
                                </label>

                                <select
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                >

                                    <option value="Cash">
                                        Cash
                                    </option>

                                    <option value="Card">
                                        Card
                                    </option>

                                    <option value="UPI">
                                        UPI
                                    </option>

                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* Drawer Footer */}
                        <div className="border-t border-slate-200 bg-white p-5">

                            <button
                                type="button"
                                onClick={handleCollectPayment}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                            >
                                <CheckCircleOutlineOutlinedIcon fontSize="small" />
                                Confirm Payment
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                PAYMENT RECEIPT PRINT PREVIEW
            ====================================================== */}
            {showPrintForm && paidBill && (
                <div
                    id="payment-receipt-wrapper"
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4"
                >

                    <div className="payment-preview-container flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

                        {/* Preview Header */}
                        <div className="payment-preview-header flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Payment Receipt
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Print Preview
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleClosePrintForm}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <CloseOutlinedIcon />
                            </button>

                        </div>

                        {/* Preview Content */}
                        <div className="payment-preview-content flex-1 overflow-y-auto bg-slate-100 p-5">

                            {/* ONLY THIS SECTION IS PRINTED */}
                            <div
                                id="payment-receipt"
                                className="mx-auto w-full max-w-3xl bg-white p-8 shadow-sm"
                            >

                                {/* Lab Header */}
                                <div className="border-b-2 border-slate-800 pb-5 text-center">

                                    <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                                        Your Laboratory Name
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-600">
                                        Laboratory Management System
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Address Line 1, City, State - PIN
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Phone: +91 XXXXX XXXXX | Email:
                                        lab@example.com
                                    </p>

                                </div>

                                {/* Receipt Title */}
                                <div className="py-6 text-center">

                                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">
                                        Payment Receipt
                                    </h2>

                                    <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-slate-700" />

                                </div>

                                {/* Payment Information */}
                                <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-4 border border-slate-200 p-5 sm:grid-cols-4">

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Payment ID
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {paidBill.paymentId ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Bill Number
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {paidBill.billNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Payment Date
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {formatDateTime(
                                                paidBill.paymentDate ||
                                                    ""
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Payment Method
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {paidBill.paymentMethod ||
                                                "-"}
                                        </p>
                                    </div>

                                </div>

                                {/* Payment Success */}
                                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                                    <CheckCircleOutlineOutlinedIcon className="text-green-600" />

                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Payment Received
                                            Successfully
                                        </p>

                                        <p className="text-sm text-green-700">
                                            Payment of ₹
                                            {paidBill.grandTotal.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}{" "}
                                            has been received.
                                        </p>
                                    </div>

                                </div>

                                {/* Patient Information */}
                                <div className="mb-6">

                                    <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Patient Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Patient Name
                                            </p>

                                            <p className="font-medium text-slate-800">
                                                {
                                                    paidBill.patientName
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Patient ID
                                            </p>

                                            <p className="font-medium text-slate-800">
                                                {
                                                    paidBill.patientId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Registration ID
                                            </p>

                                            <p className="font-medium text-slate-800">
                                                {
                                                    paidBill.registrationId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Doctor / Referral
                                            </p>

                                            <p className="font-medium text-slate-800">
                                                {
                                                    paidBill.doctorReferral ||
                                                    "-"
                                                }
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* Test Details */}
                                <div className="mb-6">

                                    <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Test Details
                                    </h3>

                                    <div className="overflow-hidden rounded-lg border border-slate-200">

                                        <table className="w-full border-collapse text-sm">

                                            <thead>
                                                <tr className="bg-slate-100">

                                                    <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                                                        #
                                                    </th>

                                                    <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                                                        Test Name
                                                    </th>

                                                    <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                                                        Category
                                                    </th>

                                                    <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">
                                                        Qty
                                                    </th>

                                                    <th className="border-b border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
                                                        Amount
                                                    </th>

                                                </tr>
                                            </thead>

                                            <tbody>

                                                {paidBill.tests.map(
                                                    (
                                                        test,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                test.id
                                                            }
                                                        >

                                                            <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                                                                {index +
                                                                    1}
                                                            </td>

                                                            <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                                                                {
                                                                    test.testName
                                                                }
                                                            </td>

                                                            <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                                                                {
                                                                    test.category
                                                                }
                                                            </td>

                                                            <td className="border-b border-slate-100 px-4 py-3 text-center text-slate-600">
                                                                {
                                                                    test.quantity
                                                                }
                                                            </td>

                                                            <td className="border-b border-slate-100 px-4 py-3 text-right font-medium text-slate-800">
                                                                ₹
                                                                {(
                                                                    test.price *
                                                                    test.quantity
                                                                ).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                                {/* Amount Summary */}
                                <div className="ml-auto w-full max-w-sm">

                                    <div className="space-y-3 border-t border-slate-200 pt-4">

                                        <div className="flex justify-between text-sm">

                                            <span className="text-slate-600">
                                                Subtotal
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                ₹
                                                {paidBill.subtotal.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex justify-between text-sm">

                                            <span className="text-slate-600">
                                                Discount
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                - ₹
                                                {paidBill.discount.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex justify-between text-sm">

                                            <span className="text-slate-600">
                                                Tax
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                ₹
                                                {paidBill.tax.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex items-center justify-between border-t-2 border-slate-800 pt-3">

                                            <span className="text-base font-bold text-slate-900">
                                                Total Paid
                                            </span>

                                            <span className="text-xl font-bold text-slate-900">
                                                ₹
                                                {paidBill.grandTotal.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="mt-10 border-t border-slate-200 pt-6 text-center">

                                    <p className="text-sm font-medium text-slate-700">
                                        Thank you for choosing our
                                        laboratory.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        This receipt is computer
                                        generated and does not require
                                        a physical signature.
                                    </p>

                                </div>

                                {/* Signature */}
                                <div className="mt-12 grid grid-cols-2 gap-10">

                                    <div className="border-t border-slate-400 pt-2 text-center">

                                        <p className="text-xs text-slate-500">
                                            Patient /
                                            Representative
                                        </p>

                                    </div>

                                    <div className="border-t border-slate-400 pt-2 text-center">

                                        <p className="text-xs text-slate-500">
                                            Authorized Signature
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Preview Footer */}
                        <div className="payment-preview-footer flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">

                            <button
                                type="button"
                                onClick={handleClosePrintForm}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handlePrintReceipt}
                                className="flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900"
                            >
                                <LocalPrintshopOutlinedIcon fontSize="small" />
                                Print Receipt
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
};

export default BillingPendingPayments;
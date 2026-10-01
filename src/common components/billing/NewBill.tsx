import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import "./NewBillPrint.css";

interface BillTest {
  id: number;
  testName: string;
  category: string;
  price: number;
  quantity: number;
}

interface Patient {
  patientId: string;
  registrationId: string;
  patientName: string;
  doctorReferral: string;
  requiredTests?: string[];
}

interface StoredBill {
  billNumber: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  doctorReferral: string;
  tests: BillTest[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid";
  billDate: string;
}

const demoPatients: Patient[] = [
  {
    patientId: "PAT-10001",
    registrationId: "REG-10001",
    patientName: "Arun Kumar",
    doctorReferral: "Dr. Rajesh",
    requiredTests: ["Complete Blood Count", "Lipid Profile"],
  },
  {
    patientId: "PAT-10002",
    registrationId: "REG-10002",
    patientName: "Priya S",
    doctorReferral: "Dr. Meena",
    requiredTests: ["Liver Function Test"],
  },
  {
    patientId: "PAT-10003",
    registrationId: "REG-10003",
    patientName: "Karthik R",
    doctorReferral: "Dr. Kumar",
    requiredTests: ["Thyroid Profile", "Blood Glucose"],
  },
];

const availableTests = [
  {
    name: "Complete Blood Count",
    category: "Hematology",
    price: 500,
  },
  {
    name: "Lipid Profile",
    category: "Biochemistry",
    price: 800,
  },
  {
    name: "Liver Function Test",
    category: "Biochemistry",
    price: 900,
  },
  {
    name: "Kidney Function Test",
    category: "Biochemistry",
    price: 850,
  },
  {
    name: "Thyroid Profile",
    category: "Hormones",
    price: 700,
  },
  {
    name: "Blood Glucose",
    category: "Biochemistry",
    price: 250,
  },
];

const getNextBillNumber = () => {
  try {
    const existingBills: StoredBill[] = JSON.parse(
      localStorage.getItem("lab_bills") || "[]"
    );

    return `BILL-${String(existingBills.length + 1).padStart(5, "0")}`;
  } catch {
    return "BILL-00001";
  }
};

const NewBill = () => {
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedTests, setSelectedTests] = useState<BillTest[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showTestSelector, setShowTestSelector] = useState(false);

  // Print preview state
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const selectedPatient = demoPatients.find(
    (patient) => patient.patientId === selectedPatientId
  );

  const subtotal = useMemo(
    () =>
      selectedTests.reduce(
        (total, test) => total + test.price * test.quantity,
        0
      ),
    [selectedTests]
  );

  const grandTotal = Math.max(
    0,
    subtotal - Number(discount || 0) + Number(tax || 0)
  );

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);

    const patient = demoPatients.find(
      (item) => item.patientId === patientId
    );

    if (!patient) {
      setSelectedTests([]);
      return;
    }

    const patientTests = (patient.requiredTests || [])
      .map((testName, index) => {
        const test = availableTests.find(
          (item) => item.name === testName
        );

        if (!test) return null;

        return {
          id: Date.now() + index,
          testName: test.name,
          category: test.category,
          price: test.price,
          quantity: 1,
        };
      })
      .filter((test): test is BillTest => test !== null);

    setSelectedTests(patientTests);
  };

  const handleAddTest = (testName: string) => {
    const test = availableTests.find(
      (item) => item.name === testName
    );

    if (!test) return;

    const alreadyAdded = selectedTests.some(
      (item) => item.testName === test.name
    );

    if (alreadyAdded) {
      setShowTestSelector(false);
      return;
    }

    setSelectedTests((previousTests) => [
      ...previousTests,
      {
        id: Date.now(),
        testName: test.name,
        category: test.category,
        price: test.price,
        quantity: 1,
      },
    ]);

    setShowTestSelector(false);
  };

  const handleRemoveTest = (id: number) => {
    setSelectedTests((previousTests) =>
      previousTests.filter((test) => test.id !== id)
    );
  };

  const handleQuantityChange = (
    id: number,
    quantity: number
  ) => {
    if (quantity < 1) return;

    setSelectedTests((previousTests) =>
      previousTests.map((test) =>
        test.id === id
          ? { ...test, quantity }
          : test
      )
    );
  };

  const handleSaveBill = () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }

    const billNumber = getNextBillNumber();

    const newBill: StoredBill = {
      billNumber,
      patientId: selectedPatient.patientId,
      registrationId: selectedPatient.registrationId,
      patientName: selectedPatient.patientName,
      doctorReferral: selectedPatient.doctorReferral,
      tests: selectedTests,
      subtotal,
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      grandTotal,
      paymentMethod,
      paymentStatus: "Pending",
      billDate: new Date().toISOString(),
    };

    try {
      const existingBills: StoredBill[] = JSON.parse(
        localStorage.getItem("lab_bills") || "[]"
      );

      localStorage.setItem(
        "lab_bills",
        JSON.stringify([...existingBills, newBill])
      );

      alert(`Bill ${billNumber} created successfully.`);
      navigate("/billing/pending-payments");
    } catch {
      alert("Unable to save the bill.");
    }
  };

  // Open print preview
  const handlePrintPreview = () => {
    if (!selectedPatient) {
      alert("Please select a patient before printing.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please add at least one test before printing.");
      return;
    }

    setShowPrintPreview(true);
  };

  // Close preview
  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
  };

  // Browser print
  const handlePrintBill = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-full bg-[#f5f7fb] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowBackOutlinedIcon fontSize="small" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[24px] font-bold tracking-tight text-slate-800">
                    New Bill
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    BILLING
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Create and manage laboratory billing for patient tests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ReceiptLongOutlinedIcon />
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Bill Number
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-700">
                  {getNextBillNumber()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

            {/* Left Content */}
            <div className="space-y-5">

              {/* Patient Card */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <PersonOutlineOutlinedIcon fontSize="small" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Patient Information
                    </h2>

                    <p className="text-xs text-slate-400">
                      Select the patient for this billing transaction
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="patient"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Patient <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="patient"
                      value={selectedPatientId}
                      onChange={(event) =>
                        handlePatientChange(event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select patient</option>

                      {demoPatients.map((patient) => (
                        <option
                          key={patient.patientId}
                          value={patient.patientId}
                        >
                          {patient.patientName} — {patient.patientId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="registrationId"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Registration ID
                    </label>

                    <input
                      id="registrationId"
                      value={selectedPatient?.registrationId || ""}
                      readOnly
                      placeholder="—"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="patientId"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Patient ID
                    </label>

                    <input
                      id="patientId"
                      value={selectedPatient?.patientId || ""}
                      readOnly
                      placeholder="—"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="doctorReferral"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Doctor / Referral
                    </label>

                    <div className="relative">
                      <LocalHospitalOutlinedIcon
                        fontSize="small"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="doctorReferral"
                        value={
                          selectedPatient?.doctorReferral || ""
                        }
                        readOnly
                        placeholder="—"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Tests Card */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <ScienceOutlinedIcon fontSize="small" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Laboratory Tests
                      </h2>

                      <p className="text-xs text-slate-400">
                        Review and add tests to this bill
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowTestSelector(
                          (previous) => !previous
                        )
                      }
                      className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <AddOutlinedIcon fontSize="small" />
                      Add Test
                    </button>

                    {showTestSelector && (
                      <div className="absolute right-0 z-30 mt-2 w-[310px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Available Tests
                          </p>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto">
                          {availableTests.map((test) => (
                            <button
                              key={test.name}
                              type="button"
                              onClick={() =>
                                handleAddTest(test.name)
                              }
                              className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-blue-50"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-700">
                                  {test.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {test.category}
                                </p>
                              </div>

                              <span className="text-sm font-bold text-slate-700">
                                ₹{test.price.toLocaleString("en-IN")}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Test
                          </th>

                          <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Price
                          </th>

                          <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Qty
                          </th>

                          <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Amount
                          </th>

                          <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedTests.map((test) => (
                          <tr
                            key={test.id}
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  <ScienceOutlinedIcon fontSize="small" />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {test.testName}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    Laboratory Test
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {test.category}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-600">
                              ₹{test.price.toLocaleString("en-IN")}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <input
                                type="number"
                                min="1"
                                value={test.quantity}
                                onChange={(event) =>
                                  handleQuantityChange(
                                    test.id,
                                    Number(event.target.value)
                                  )
                                }
                                className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                              />
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                              ₹
                              {(
                                test.price * test.quantity
                              ).toLocaleString("en-IN")}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveTest(test.id)
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                title="Remove test"
                              >
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ScienceOutlinedIcon />
                    </div>

                    <p className="text-sm font-semibold text-slate-600">
                      No tests added
                    </p>

                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      Select a patient or use the Add Test button to
                      add laboratory tests to this bill.
                    </p>
                  </div>
                )}
              </section>

              {/* Payment Method */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <PaymentsOutlinedIcon fontSize="small" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Payment Method
                    </h2>

                    <p className="text-xs text-slate-400">
                      Select the preferred payment method
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                  {["Cash", "Card", "UPI", "Bank Transfer"].map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(method)
                        }
                        className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                          paymentMethod === method
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              </section>
            </div>

            {/* Right Summary */}
            <aside className="h-fit xl:sticky xl:top-5">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="bg-slate-800 px-5 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
                        Invoice Summary
                      </p>

                      <h2 className="mt-1 text-lg font-bold">
                        Billing Details
                      </h2>
                    </div>

                    <ReceiptLongOutlinedIcon />
                  </div>
                </div>

                <div className="space-y-5 p-5">

                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Patient
                      </span>

                      <span className="max-w-[170px] truncate text-sm font-semibold text-slate-700">
                        {selectedPatient?.patientName || "Not selected"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Registration
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {selectedPatient?.registrationId || "—"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Tests
                      </span>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                        {selectedTests.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-semibold text-slate-700">
                          ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <label
                          htmlFor="discount"
                          className="text-sm text-slate-500"
                        >
                          Discount
                        </label>

                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            id="discount"
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(event) =>
                              setDiscount(
                                Number(event.target.value)
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-right text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <label
                          htmlFor="tax"
                          className="text-sm text-slate-500"
                        >
                          Tax
                        </label>

                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            id="tax"
                            type="number"
                            min="0"
                            value={tax}
                            onChange={(event) =>
                              setTax(
                                Number(event.target.value)
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-right text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Total Amount
                      </p>

                      <p className="mt-1 text-[30px] font-bold tracking-tight text-blue-700">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlineOutlinedIcon
                        fontSize="small"
                        className="text-emerald-500"
                      />

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Payment Status
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Bill will be created as pending
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveBill}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <ReceiptLongOutlinedIcon fontSize="small" />
                      Create Bill
                    </button>

                    {/* PRINT BUTTON */}
                    <button
                      type="button"
                      onClick={handlePrintPreview}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      <PrintOutlinedIcon fontSize="small" />
                      Print
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRINT PREVIEW POPUP */}
      {/* ========================================================= */}

      {showPrintPreview && selectedPatient && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4">

          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* Preview Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Bill Print Preview
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Review the bill before printing
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePrintPreview}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Close preview"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>

            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-5">

              {/* THIS IS THE ONLY PRINTABLE ELEMENT */}
              <div
                id="new-bill-print"
                className="mx-auto w-full max-w-3xl bg-white p-8 shadow-sm"
              >

                {/* Laboratory Header */}
                <div className="border-b-2 border-slate-800 pb-5">

                  <div className="flex items-start justify-between gap-5">

                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">
                        Your Laboratory Name
                      </h1>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Laboratory Management System
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Address Line 1, City, State - PIN
                        <br />
                        Phone: +91 XXXXX XXXXX
                        <br />
                        Email: lab@example.com
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ReceiptLongOutlinedIcon />
                      </div>

                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Laboratory Invoice
                      </p>
                    </div>

                  </div>

                </div>

                {/* Invoice Title */}
                <div className="flex items-center justify-between border-b border-slate-200 py-5">

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      BILL / INVOICE
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Original Billing Document
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">
                      Bill Number
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {getNextBillNumber()}
                    </p>
                  </div>

                </div>

                {/* Bill Meta */}
                <div className="grid grid-cols-2 gap-5 border-b border-slate-200 py-5 sm:grid-cols-4">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Bill Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {new Date().toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {paymentMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Payment Status
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Registration ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedPatient.registrationId}
                    </p>
                  </div>

                </div>

                {/* Patient Information */}
                <div className="py-5">

                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient Information
                  </h3>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Patient Name
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {selectedPatient.patientName}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Patient ID
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {selectedPatient.patientId}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Doctor / Referral
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {selectedPatient.doctorReferral || "—"}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Test Details */}
                <div className="py-2">

                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Laboratory Test Details
                  </h3>

                  <div className="overflow-hidden rounded-lg border border-slate-200">

                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-800 text-white">

                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                            #
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                            Test Name
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                            Category
                          </th>

                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wide">
                            Qty
                          </th>

                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide">
                            Price
                          </th>

                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide">
                            Amount
                          </th>

                        </tr>
                      </thead>

                      <tbody>
                        {selectedTests.map((test, index) => (
                          <tr
                            key={test.id}
                            className="border-b border-slate-100 last:border-0"
                          >

                            <td className="px-4 py-3 text-xs text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                              {test.testName}
                            </td>

                            <td className="px-4 py-3 text-xs text-slate-500">
                              {test.category}
                            </td>

                            <td className="px-4 py-3 text-center text-xs font-medium text-slate-700">
                              {test.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-xs text-slate-600">
                              ₹{test.price.toLocaleString("en-IN")}
                            </td>

                            <td className="px-4 py-3 text-right text-xs font-bold text-slate-800">
                              ₹
                              {(
                                test.price * test.quantity
                              ).toLocaleString("en-IN")}
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>

                  </div>

                </div>

                {/* Amount Summary */}
                <div className="flex justify-end py-5">

                  <div className="w-full max-w-sm space-y-3">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-slate-700">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span className="font-semibold text-slate-700">
                        - ₹
                        {Number(discount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Tax
                      </span>

                      <span className="font-semibold text-slate-700">
                        ₹{Number(tax || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="border-t-2 border-slate-800 pt-3">

                      <div className="flex items-center justify-between">

                        <span className="text-sm font-bold text-slate-800">
                          Grand Total
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          ₹{grandTotal.toLocaleString("en-IN")}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Pending Notice */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">

                  <div className="flex items-start gap-3">

                    <CheckCircleOutlineOutlinedIcon
                      fontSize="small"
                      className="mt-0.5 text-amber-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Payment Pending
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-amber-700">
                        This bill has been created as a pending
                        payment. Please collect payment from the
                        Pending Payments section.
                      </p>
                    </div>

                  </div>

                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-slate-200 pt-5">

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Notes
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Please retain this invoice for your records.
                      </p>
                    </div>

                    <div className="text-right">

                      <div className="mb-8 w-40 border-b border-slate-300" />

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Authorized Signature
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 text-center">

                    <p className="text-[10px] text-slate-400">
                      This is a computer-generated billing document.
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Thank you for choosing our laboratory.
                    </p>

                  </div>

                </div>

              </div>
            </div>

            {/* Preview Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">

              <button
                type="button"
                onClick={handleClosePrintPreview}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <CloseOutlinedIcon fontSize="small" />
                Close
              </button>

              <button
                type="button"
                onClick={handlePrintBill}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <PrintOutlinedIcon fontSize="small" />
                Print Bill
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default NewBill;
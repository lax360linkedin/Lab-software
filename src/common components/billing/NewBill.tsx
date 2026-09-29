import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

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

const generateBillNumber = () => {
  const existingBills = JSON.parse(
    localStorage.getItem("lab_bills") || "[]"
  );

  const nextNumber = existingBills.length + 1;

  return `BILL-${String(nextNumber).padStart(5, "0")}`;
};

const NewBill = () => {
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedTests, setSelectedTests] = useState<BillTest[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showTestSelector, setShowTestSelector] = useState(false);

  const selectedPatient = demoPatients.find(
    (patient) => patient.patientId === selectedPatientId
  );

  const subtotal = useMemo(() => {
    return selectedTests.reduce(
      (total, test) => total + test.price * test.quantity,
      0
    );
  }, [selectedTests]);

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
      .filter(Boolean) as BillTest[];

    setSelectedTests(patientTests);
  };

  const handleAddTest = (testName: string) => {
    const test = availableTests.find((item) => item.name === testName);

    if (!test) return;

    const alreadyAdded = selectedTests.some(
      (item) => item.testName === test.name
    );

    if (alreadyAdded) {
      setShowTestSelector(false);
      return;
    }

    setSelectedTests((prev) => [
      ...prev,
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
    setSelectedTests((prev) =>
      prev.filter((test) => test.id !== id)
    );
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;

    setSelectedTests((prev) =>
      prev.map((test) =>
        test.id === id
          ? {
              ...test,
              quantity,
            }
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

    const billNumber = generateBillNumber();

    const bill = {
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

    const existingBills = JSON.parse(
      localStorage.getItem("lab_bills") || "[]"
    );

    localStorage.setItem(
      "lab_bills",
      JSON.stringify([...existingBills, bill])
    );

    alert(`Bill ${billNumber} created successfully.`);

    navigate("/billing/pending-payments");
  };

  const handleProceedToPayment = () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }

    handleSaveBill();
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowBackOutlinedIcon fontSize="small" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              New Bill
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a bill for patient laboratory tests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2">
          <ReceiptLongOutlinedIcon className="text-blue-600" />

          <div>
            <p className="text-xs text-slate-500">Bill Number</p>
            <p className="font-semibold text-slate-700">
              Will be generated automatically
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Patient Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Patient
            </label>

            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Patient</option>

              {demoPatients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.patientName} - {patient.patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration ID
            </label>

            <input
              type="text"
              value={selectedPatient?.registrationId || ""}
              readOnly
              placeholder="Registration ID"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Patient ID
            </label>

            <input
              type="text"
              value={selectedPatient?.patientId || ""}
              readOnly
              placeholder="Patient ID"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Doctor / Referral
            </label>

            <input
              type="text"
              value={selectedPatient?.doctorReferral || ""}
              readOnly
              placeholder="Doctor / Referral"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tests */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Selected Tests
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tests selected during patient registration
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTestSelector((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <AddOutlinedIcon fontSize="small" />
              Add Test
            </button>

            {showTestSelector && (
              <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Select Test
                  </p>
                </div>

                {availableTests.map((test) => (
                  <button
                    key={test.name}
                    type="button"
                    onClick={() => handleAddTest(test.name)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {test.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {test.category}
                      </p>
                    </div>

                    <span className="font-medium text-slate-700">
                      ₹{test.price.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-medium">
                  Test Name
                </th>
                <th className="px-5 py-3 text-left font-medium">
                  Category
                </th>
                <th className="px-5 py-3 text-left font-medium">
                  Price
                </th>
                <th className="px-5 py-3 text-center font-medium">
                  Quantity
                </th>
                <th className="px-5 py-3 text-right font-medium">
                  Amount
                </th>
                <th className="px-5 py-3 text-center font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {selectedTests.length > 0 ? (
                selectedTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {test.testName}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {test.category}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      ₹{test.price.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        value={test.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            test.id,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-slate-700">
                      ₹
                      {(test.price * test.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(test.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Remove test"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No tests selected. Select a patient or add a test.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="mb-6 flex justify-end">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-800">
              Billing Summary
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-5">
              <label
                htmlFor="discount"
                className="text-sm text-slate-500"
              >
                Discount
              </label>

              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-3 text-right text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-5">
              <label htmlFor="tax" className="text-sm text-slate-500">
                Tax
              </label>

              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  id="tax"
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-3 text-right text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-blue-600">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Payment Information
          </h2>
        </div>

        <div className="p-5">
          <div className="max-w-sm">
            <label
              htmlFor="paymentMethod"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Payment Method
            </label>

            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveBill}
          className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Save Bill
        </button>

        <button
          type="button"
          onClick={handleProceedToPayment}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default NewBill;
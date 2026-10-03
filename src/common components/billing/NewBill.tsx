import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

/* =========================================================
   TYPES
========================================================= */

interface LabTest {
  id?: string | number;
  code?: string;
  name: string;
  category: string;
  sampleType?: string;
  method?: string;
  price: number | string;
  turnaround?: string;
  parameters?: string[];
  status?: string;
}

interface RegisteredPatientTest {
  testId?: string;
  testCode?: string;
  testName: string;
  category: string;
  sampleType?: string;
  method?: string;
  price: number | string;
  turnaroundTime?: string;
}

interface BillTest {
  id: number;
  testId: string;
  testCode: string;
  testName: string;
  category: string;
  price: number;
  quantity: number;
  sampleType: string;
  method: string;
  turnaroundTime: string;
}

interface Patient {
  id?: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  doctorReferral?: string;

  /*
   * New Registration stores complete test objects.
   * string[] is kept as a fallback for older records.
   */
  requiredTests?: RegisteredPatientTest[] | string[];

  age?: string | number;
  gender?: string;
  phone?: string;
  address?: string;
  registrationDate?: string;
  status?: string;
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

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

const getStoredPatients = (): Patient[] => {
  try {
    const storedPatients = localStorage.getItem("lab_patients");

    if (!storedPatients) {
      return [];
    }

    const parsedPatients: unknown = JSON.parse(storedPatients);

    if (!Array.isArray(parsedPatients)) {
      return [];
    }

    return parsedPatients as Patient[];
  } catch {
    return [];
  }
};

const getStoredTests = (): LabTest[] => {
  try {
    const storedTests = localStorage.getItem("lab_tests");

    if (!storedTests) {
      return [];
    }

    const parsedTests: unknown = JSON.parse(storedTests);

    if (!Array.isArray(parsedTests)) {
      return [];
    }

    return parsedTests as LabTest[];
  } catch {
    return [];
  }
};

const getNextBillNumber = (): string => {
  try {
    const storedBills = localStorage.getItem("lab_bills");

    if (!storedBills) {
      return "BILL-00001";
    }

    const existingBills: StoredBill[] = JSON.parse(storedBills);

    if (!Array.isArray(existingBills) || existingBills.length === 0) {
      return "BILL-00001";
    }

    const billNumbers = existingBills
      .map((bill) => bill.billNumber)
      .filter(Boolean)
      .map((billNumber) => {
        const match = billNumber.match(/BILL-(\d+)/);

        return match ? Number(match[1]) : 0;
      });

    const highestNumber = Math.max(...billNumbers, 0);

    return `BILL-${String(highestNumber + 1).padStart(5, "0")}`;
  } catch {
    return "BILL-00001";
  }
};

/* =========================================================
   PATIENT TEST MAPPER
========================================================= */

const getPatientTests = (
  patient: Patient | undefined,
  availableTests: LabTest[]
): BillTest[] => {
  if (!patient?.requiredTests?.length) {
    return [];
  }

  return patient.requiredTests
    .map((test, index): BillTest | null => {
      /* =====================================================
         NEW REGISTRATION FORMAT
         Full test object is already stored in patient
      ===================================================== */

      if (typeof test !== "string") {
        return {
          id: index + 1,
          testId: test.testId || `TEST-${index + 1}`,
          testCode: test.testCode || "",
          testName: test.testName,
          category: test.category || "General",
          price: Number(test.price) || 0,
          quantity: 1,
          sampleType: test.sampleType || "",
          method: test.method || "",
          turnaroundTime: test.turnaroundTime || "",
        };
      }

      /* =====================================================
         OLD FORMAT
         Only test name/code was stored
      ===================================================== */

      const searchValue = test.trim().toLowerCase();

      const matchedTest = availableTests.find((item) => {
        const itemName = item.name?.trim().toLowerCase() || "";
        const itemCode = item.code?.trim().toLowerCase() || "";

        return (
          itemName === searchValue ||
          itemCode === searchValue
        );
      });

      /*
       * If the old patient record contains a test which
       * no longer exists in the Tests master, skip it.
       */
      if (!matchedTest) {
        return null;
      }

      return {
        id: index + 1,
        testId:
          matchedTest.id?.toString() ||
          `TEST-${index + 1}`,
        testCode: matchedTest.code || "",
        testName: matchedTest.name,
        category: matchedTest.category || "General",
        price: Number(matchedTest.price) || 0,
        quantity: 1,
        sampleType: matchedTest.sampleType || "",
        method: matchedTest.method || "",
        turnaroundTime: matchedTest.turnaround || "",
      };
    })
    .filter(
      (test): test is BillTest => test !== null
    );
};

/* =========================================================
   COMPONENT
========================================================= */

const NewBill = () => {
  const navigate = useNavigate();

  /*
   * Patient List sends:
   *
   * /billing/new?patientId=PAT-xxxxx
   *
   * We read that patient ID here.
   */
  const [searchParams] = useSearchParams();

  const patientIdFromUrl =
    searchParams.get("patientId") || "";

  /* =======================================================
     LOAD REAL DATA
  ======================================================= */

  const [patients] = useState<Patient[]>(() =>
    getStoredPatients()
  );

  const [availableTests] = useState<LabTest[]>(() =>
    getStoredTests()
  );

  /* =======================================================
     FIND PATIENT FROM URL
  ======================================================= */

  const initialPatient = patients.find(
    (patient) =>
      patient.patientId === patientIdFromUrl
  );

  const initialPatientId =
    initialPatient?.patientId || "";

  /* =======================================================
     BILL STATE
  ======================================================= */

  const [selectedPatientId, setSelectedPatientId] =
    useState(initialPatientId);

  /*
   * Registered tests are loaded immediately when the
   * page opens from Patient List.
   */
  const [selectedTests, setSelectedTests] =
    useState<BillTest[]>(() =>
      getPatientTests(
        initialPatient,
        availableTests
      )
    );

  const [discount, setDiscount] = useState(0);

  const [tax, setTax] = useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [showTestSelector, setShowTestSelector] =
    useState(false);

  /* =======================================================
     SELECTED PATIENT
  ======================================================= */

  const selectedPatient = patients.find(
    (patient) =>
      patient.patientId === selectedPatientId
  );

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return selectedTests.reduce(
      (total, test) =>
        total + test.price * test.quantity,
      0
    );
  }, [selectedTests]);

  /* =======================================================
     GRAND TOTAL
  ======================================================= */

  const grandTotal = Math.max(
    0,
    subtotal -
      Number(discount || 0) +
      Number(tax || 0)
  );

  /* =======================================================
     PATIENT CHANGE
  ======================================================= */

  const handlePatientChange = (
    patientId: string
  ) => {
    setSelectedPatientId(patientId);

    const patient = patients.find(
      (item) =>
        item.patientId === patientId
    );

    /*
     * Immediately load all tests registered for
     * the selected patient.
     */
    setSelectedTests(
      getPatientTests(
        patient,
        availableTests
      )
    );
  };

  /* =======================================================
     ADD EXTRA TEST
  ======================================================= */

  const handleAddTest = (
    test: LabTest
  ) => {
    const alreadyAdded = selectedTests.some(
      (item) =>
        item.testName.trim().toLowerCase() ===
        test.name.trim().toLowerCase()
    );

    if (alreadyAdded) {
      setShowTestSelector(false);
      return;
    }

    setSelectedTests(
      (previousTests) => [
        ...previousTests,
        {
          id: Date.now(),
          testId:
            test.id?.toString() ||
            `TEST-${Date.now()}`,
          testCode: test.code || "",
          testName: test.name,
          category:
            test.category || "General",
          price: Number(test.price) || 0,
          quantity: 1,
          sampleType:
            test.sampleType || "",
          method:
            test.method || "",
          turnaroundTime:
            test.turnaround || "",
        },
      ]
    );

    setShowTestSelector(false);
  };

  /* =======================================================
     REMOVE TEST
  ======================================================= */

  const handleRemoveTest = (
    id: number
  ) => {
    setSelectedTests(
      (previousTests) =>
        previousTests.filter(
          (test) => test.id !== id
        )
    );
  };

  /* =======================================================
     QUANTITY CHANGE
  ======================================================= */

  const handleQuantityChange = (
    id: number,
    quantity: number
  ) => {
    if (quantity < 1) {
      return;
    }

    setSelectedTests(
      (previousTests) =>
        previousTests.map((test) =>
          test.id === id
            ? {
                ...test,
                quantity,
              }
            : test
        )
    );
  };

  /* =======================================================
     CREATE BILL
  ======================================================= */

  const handleSaveBill = () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }

    const billNumber =
      getNextBillNumber();

    const newBill: StoredBill = {
      billNumber,

      patientId:
        selectedPatient.patientId,

      registrationId:
        selectedPatient.registrationId,

      patientName:
        selectedPatient.patientName,

      doctorReferral:
        selectedPatient.doctorReferral || "",

      tests: selectedTests,

      subtotal,

      discount:
        Number(discount || 0),

      tax:
        Number(tax || 0),

      grandTotal,

      paymentMethod,

      paymentStatus: "Pending",

      billDate:
        new Date().toISOString(),
    };

    try {
      const storedBills =
        localStorage.getItem(
          "lab_bills"
        );

      const existingBills: StoredBill[] =
        storedBills
          ? JSON.parse(storedBills)
          : [];

      const updatedBills = [
        ...existingBills,
        newBill,
      ];

      localStorage.setItem(
        "lab_bills",
        JSON.stringify(
          updatedBills
        )
      );

      alert(
        `Bill ${billNumber} created successfully.`
      );

      /*
       * After creating the bill,
       * move directly to Pending Payments.
       */
      navigate(
        "/billing/pending-payments"
      );
    } catch {
      alert(
        "Unable to save the bill."
      );
    }
  };

  return (
    <>
      <div className="min-h-full bg-[#f5f7fb] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          {/* PAGE HEADER */}

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
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

          {/* NO PATIENT DATA */}

          {patients.length === 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">

              <div className="flex items-start gap-3">

                <PersonOutlineOutlinedIcon className="mt-0.5 text-amber-600" />

                <div>

                  <p className="text-sm font-bold text-amber-800">
                    No registered patients found
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Please complete patient registration first.
                    Registered patients will appear here automatically.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/patients")
                    }
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                  >
                    Go to Patients
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

            {/* LEFT CONTENT */}

            <div className="space-y-5">

              {/* PATIENT CARD */}

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
                      Select a registered patient for this billing transaction
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">

                  {/* PATIENT */}

                  <div className="lg:col-span-2">

                    <label
                      htmlFor="patient"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Patient{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      id="patient"
                      value={selectedPatientId}
                      onChange={(event) =>
                        handlePatientChange(
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                      <option value="">
                        Select patient
                      </option>

                      {patients.map(
                        (patient) => (
                          <option
                            key={
                              patient.patientId
                            }
                            value={
                              patient.patientId
                            }
                          >
                            {
                              patient.patientName
                            }{" "}
                            —{" "}
                            {
                              patient.patientId
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* REGISTRATION ID */}

                  <div>

                    <label
                      htmlFor="registrationId"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Registration ID
                    </label>

                    <input
                      id="registrationId"
                      value={
                        selectedPatient?.registrationId ||
                        ""
                      }
                      readOnly
                      placeholder="—"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none"
                    />

                  </div>

                  {/* PATIENT ID */}

                  <div>

                    <label
                      htmlFor="patientId"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Patient ID
                    </label>

                    <input
                      id="patientId"
                      value={
                        selectedPatient?.patientId ||
                        ""
                      }
                      readOnly
                      placeholder="—"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none"
                    />

                  </div>

                  {/* DOCTOR */}

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
                          selectedPatient?.doctorReferral ||
                          ""
                        }
                        readOnly
                        placeholder="—"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-600 outline-none"
                      />

                    </div>

                  </div>

                  {/* PATIENT PHONE */}

                  <div className="md:col-span-2">

                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                      Phone
                    </label>

                    <input
                      id="phone"
                      value={
                        selectedPatient?.phone ||
                        ""
                      }
                      readOnly
                      placeholder="—"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                    />

                  </div>

                </div>

              </section>

              {/* TESTS CARD */}

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
                        Tests selected during patient registration
                      </p>

                    </div>

                  </div>

                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setShowTestSelector(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={
                        availableTests.length === 0
                      }
                      className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

                          {availableTests.length > 0 ? (
                            availableTests.map(
                              (test) => {

                                const alreadyAdded =
                                  selectedTests.some(
                                    (item) =>
                                      item.testName
                                        .trim()
                                        .toLowerCase() ===
                                      test.name
                                        .trim()
                                        .toLowerCase()
                                  );

                                return (
                                  <button
                                    key={
                                      test.id ??
                                      test.code ??
                                      test.name
                                    }
                                    type="button"
                                    disabled={
                                      alreadyAdded
                                    }
                                    onClick={() =>
                                      handleAddTest(
                                        test
                                      )
                                    }
                                    className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50"
                                  >

                                    <div>

                                      <p className="text-sm font-semibold text-slate-700">
                                        {
                                          test.name
                                        }
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        {
                                          test.category ||
                                          "General"
                                        }
                                      </p>

                                    </div>

                                    <span className="text-sm font-bold text-slate-700">
                                      ₹
                                      {(
                                        Number(
                                          test.price
                                        ) || 0
                                      ).toLocaleString(
                                        "en-IN"
                                      )}
                                    </span>

                                  </button>
                                );
                              }
                            )
                          ) : (
                            <div className="px-4 py-8 text-center">

                              <p className="text-sm font-semibold text-slate-600">
                                No tests available
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Add tests from the Tests master module first.
                              </p>

                            </div>
                          )}

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

                        {selectedTests.map(
                          (test) => (

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
                                      {
                                        test.testName
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      Laboratory Test
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="px-5 py-4">

                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                  {
                                    test.category
                                  }
                                </span>

                              </td>

                              <td className="px-5 py-4 text-right text-sm font-medium text-slate-600">

                                ₹
                                {test.price.toLocaleString(
                                  "en-IN"
                                )}

                              </td>

                              <td className="px-5 py-4 text-center">

                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    test.quantity
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleQuantityChange(
                                      test.id,
                                      Number(
                                        event
                                          .target
                                          .value
                                      )
                                    )
                                  }
                                  className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                                />

                              </td>

                              <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">

                                ₹
                                {(
                                  test.price *
                                  test.quantity
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </td>

                              <td className="px-5 py-4 text-center">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveTest(
                                      test.id
                                    )
                                  }
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                  title="Remove test"
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </button>

                              </td>

                            </tr>

                          )
                        )}

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
                      Select a registered patient to automatically load
                      their selected tests.
                    </p>

                  </div>

                )}

              </section>

              {/* PAYMENT METHOD */}

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

                  {[
                    "Cash",
                    "Card",
                    "UPI",
                    "Bank Transfer",
                  ].map(
                    (method) => (

                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(
                            method
                          )
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

            {/* RIGHT SUMMARY */}

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

                  {/* PATIENT SUMMARY */}

                  <div className="rounded-lg bg-slate-50 p-4">

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-xs font-medium text-slate-500">
                        Patient
                      </span>

                      <span className="max-w-[170px] truncate text-right text-sm font-semibold text-slate-700">
                        {
                          selectedPatient?.patientName ||
                          "Not selected"
                        }
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">

                      <span className="text-xs font-medium text-slate-500">
                        Registration
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {
                          selectedPatient?.registrationId ||
                          "—"
                        }
                      </span>

                    </div>

                  </div>

                  {/* AMOUNTS */}

                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Tests
                      </span>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                        {
                          selectedTests.length
                        }
                      </span>

                    </div>

                    <div className="space-y-2">

                      {/* SUBTOTAL */}

                      <div className="flex justify-between text-sm">

                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-semibold text-slate-700">
                          ₹
                          {subtotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      {/* DISCOUNT */}

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
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-right text-sm outline-none focus:border-blue-500"
                          />

                        </div>

                      </div>

                      {/* TAX */}

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
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-right text-sm outline-none focus:border-blue-500"
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* TOTAL */}

                  <div className="border-t border-slate-200 pt-5">

                    <div className="rounded-xl bg-blue-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Total Amount
                      </p>

                      <p className="mt-1 text-[30px] font-bold tracking-tight text-blue-700">
                        ₹
                        {grandTotal.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </div>

                  {/* PAYMENT STATUS */}

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

                  {/* ACTIONS */}

                  <div className="space-y-2 pt-1">

                    <button
                      type="button"
                      onClick={
                        handleSaveBill
                      }
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <ReceiptLongOutlinedIcon fontSize="small" />
                      Create Bill
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/dashboard"
                        )
                      }
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
    </>
  );
};

export default NewBill;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import type { Doctor, Referral } from "../../doctors/Doctor";
import type { LabTest } from "../../tests/Tests";

interface SelectedTest {
  testId: string;
  testCode: string;
  testName: string;
  category: string;
  sampleType: string;
  method: string;
  price: number;
  turnaroundTime: string;
}

interface FormData {
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  doctorId: string;
  doctorReferral: string;
  requiredTests: string[];
}

const DOCTOR_STORAGE_KEY = "lab_doctors";
const PATIENT_STORAGE_KEY = "lab_patients";
const REFERRAL_STORAGE_KEY = "lab_referrals";
const TEST_STORAGE_KEY = "lab_tests";

const getDoctors = (): Doctor[] => {
  const storedDoctors = localStorage.getItem(DOCTOR_STORAGE_KEY);

  if (!storedDoctors) {
    return [];
  }

  try {
    const parsedDoctors = JSON.parse(storedDoctors);

    return Array.isArray(parsedDoctors) ? parsedDoctors : [];
  } catch {
    return [];
  }
};

const getReferrals = (): Referral[] => {
  const storedReferrals = localStorage.getItem(REFERRAL_STORAGE_KEY);

  if (!storedReferrals) {
    return [];
  }

  try {
    const parsedReferrals = JSON.parse(storedReferrals);

    return Array.isArray(parsedReferrals) ? parsedReferrals : [];
  } catch {
    return [];
  }
};

const getTests = (): LabTest[] => {
  const storedTests = localStorage.getItem(TEST_STORAGE_KEY);

  if (!storedTests) {
    return [];
  }

  try {
    const parsedTests = JSON.parse(storedTests);

    return Array.isArray(parsedTests) ? parsedTests : [];
  } catch {
    return [];
  }
};

const generatePatientId = () => {
  const storedPatients = localStorage.getItem(PATIENT_STORAGE_KEY);

  let patients: Array<{ patientId?: string }> = [];

  if (storedPatients) {
    try {
      const parsed = JSON.parse(storedPatients);

      if (Array.isArray(parsed)) {
        patients = parsed;
      }
    } catch {
      patients = [];
    }
  }

  const numbers = patients
    .map((patient) => {
      const match = patient.patientId?.match(/PAT-(\d+)/);

      return match ? Number(match[1]) : 0;
    })
    .filter((number) => number > 0);

  const nextNumber =
    numbers.length > 0 ? Math.max(...numbers) + 1 : 10001;

  return `PAT-${nextNumber}`;
};

const generateRegistrationId = () => {
  const storedPatients = localStorage.getItem(PATIENT_STORAGE_KEY);

  let patients: Array<{ registrationId?: string }> = [];

  if (storedPatients) {
    try {
      const parsed = JSON.parse(storedPatients);

      if (Array.isArray(parsed)) {
        patients = parsed;
      }
    } catch {
      patients = [];
    }
  }

  const numbers = patients
    .map((patient) => {
      const match = patient.registrationId?.match(/REG-(\d+)/);

      return match ? Number(match[1]) : 0;
    })
    .filter((number) => number > 0);

  const nextNumber =
    numbers.length > 0 ? Math.max(...numbers) + 1 : 10001;

  return `REG-${nextNumber}`;
};

const generateReferralId = () => {
  const referrals = getReferrals();

  const numbers = referrals
    .map((referral) => {
      const match = referral.id?.match(/REF-(\d+)/);

      return match ? Number(match[1]) : 0;
    })
    .filter((number) => number > 0);

  const nextNumber =
    numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `REF-${String(nextNumber).padStart(4, "0")}`;
};

export default function NewRegistration() {
  const navigate = useNavigate();

  const [doctors] = useState<Doctor[]>(() => getDoctors());

  // Load tests created from the Test List page
  const [tests] = useState<LabTest[]>(() => getTests());

  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    doctorId: "",
    doctorReferral: "",
    requiredTests: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [registrationSuccess, setRegistrationSuccess] =
    useState(false);

  const [registeredPatient, setRegisteredPatient] = useState<{
    patientId: string;
    registrationId: string;
    patientName: string;
    doctorName: string;
    tests: SelectedTest[];
  } | null>(null);

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === doctorId
    );

    setFormData((previous) => ({
      ...previous,
      doctorId,
      doctorReferral: selectedDoctor?.doctorName ?? "",
    }));

    setErrors((previous) => ({
      ...previous,
      doctorId: "",
    }));
  };

  const handleTestChange = (testCode: string) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.requiredTests.includes(testCode);

      return {
        ...previous,
        requiredTests: alreadySelected
          ? previous.requiredTests.filter(
              (test) => test !== testCode
            )
          : [...previous.requiredTests, testCode],
      };
    });

    setErrors((previous) => ({
      ...previous,
      requiredTests: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

   if(!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.doctorId) {
      newErrors.doctorId =
        "Please select the concerned doctor";
    }

    if (formData.requiredTests.length === 0) {
      newErrors.requiredTests =
        "Please select at least one test";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === formData.doctorId
    );

    if (!selectedDoctor) {
      setErrors({
        doctorId: "Selected doctor could not be found",
      });

      return;
    }

    /*
     * Convert selected test codes into complete test objects.
     *
     * This is important for the next Billing step because
     * Billing can directly use the test price.
     */
    const selectedTests: SelectedTest[] = tests
      .filter((test) =>
        formData.requiredTests.includes(test.testCode)
      )
      .map((test) => ({
        testId: test.id,
        testCode: test.testCode,
        testName: test.testName,
        category: test.category,
        sampleType: test.sampleType,
        method: test.method,
        price: test.price,
        turnaroundTime: test.turnaroundTime,
      }));

    if (selectedTests.length === 0) {
      setErrors({
        requiredTests:
          "Selected tests could not be found. Please select an active test.",
      });

      return;
    }

    const patientId = generatePatientId();
    const registrationId = generateRegistrationId();
    const referralId = generateReferralId();

    const registrationDate = new Date().toISOString();

    /*
     * Patient record
     */
    const newPatient = {
      id: patientId,
      patientId,
      registrationId,
      patientName: formData.patientName.trim(),
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone.trim(),
      address: formData.address.trim(),

      doctorId: selectedDoctor.id,
      doctorReferral: selectedDoctor.doctorName,

      /*
       * Keep the complete selected test data.
       * Billing can use this later.
       */
      requiredTests: selectedTests,

      registrationDate,
      status: "Registered",
    };

    const existingPatients = localStorage.getItem(
      PATIENT_STORAGE_KEY
    );

    let patients: unknown[] = [];

    if (existingPatients) {
      try {
        const parsedPatients = JSON.parse(existingPatients);

        if (Array.isArray(parsedPatients)) {
          patients = parsedPatients;
        }
      } catch {
        patients = [];
      }
    }

    localStorage.setItem(
      PATIENT_STORAGE_KEY,
      JSON.stringify([
        newPatient,
        ...patients,
      ])
    );

    /*
     * Referral record
     */
    const newReferral: Referral = {
      id: referralId,

      patientId: patientId,

      patientName: formData.patientName.trim(),

      doctorId: selectedDoctor.id,

      doctorName: selectedDoctor.doctorName,

      referralDate: registrationDate,

      /*
       * Referral currently expects string[],
       * so keep the test codes here.
       */
      tests: selectedTests.map((test) => test.testCode),

      billAmount: 0,

      sampleStatus: "Not Collected",

      reportStatus: "Pending",

      status: "Registered",
    };

    const existingReferrals = getReferrals();

    localStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify([
        newReferral,
        ...existingReferrals,
      ])
    );

    setRegisteredPatient({
      patientId,
      registrationId,
      patientName: formData.patientName.trim(),
      doctorName: selectedDoctor.doctorName,
      tests: selectedTests,
    });

    setRegistrationSuccess(true);
  };

  const handleNewRegistration = () => {
    setFormData({
      patientName: "",
      age: "",
      gender: "",
      phone: "",
      address: "",
      doctorId: "",
      doctorReferral: "",
      requiredTests: [],
    });

    setErrors({});
    setRegisteredPatient(null);
    setRegistrationSuccess(false);
  };

  /*
   * SUCCESS SCREEN
   */
  if (registrationSuccess && registeredPatient) {
    const totalTestAmount = registeredPatient.tests.reduce(
      (total, test) => total + test.price,
      0
    );

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircleOutlineOutlinedIcon
                  className="text-green-600"
                  sx={{ fontSize: 40 }}
                />
              </div>

              <h1 className="text-2xl font-bold text-slate-800">
                Patient Registered Successfully
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Patient and referral records have been created.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Patient ID */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Patient ID
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {registeredPatient.patientId}
                </p>
              </div>

              {/* Registration ID */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Registration ID
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {registeredPatient.registrationId}
                </p>
              </div>

              {/* Patient Name */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Patient Name
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {registeredPatient.patientName}
                </p>
              </div>

              {/* Doctor */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Concerned Doctor
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {registeredPatient.doctorName}
                </p>
              </div>

              {/* Selected Tests */}
              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Required Tests
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {registeredPatient.tests.length} test
                      {registeredPatient.tests.length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Test Total
                    </p>

                    <p className="text-lg font-semibold text-slate-800">
                      ₹{totalTestAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {registeredPatient.tests.map((test) => (
                    <div
                      key={test.testId}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {test.testCode} — {test.testName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {test.category} • {test.sampleType}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-800">
                        ₹{test.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">

              <button
                type="button"
                onClick={() => navigate("/patients")}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View Patients
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/doctors?tab=referred")
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                View Referral
              </button>

              <button
                type="button"
                onClick={handleNewRegistration}
                className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                New Registration
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * REGISTRATION FORM
   */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowBackOutlinedIcon />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              New Patient Registration
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Register a patient and assign the concerned doctor.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* PATIENT INFORMATION */}
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2">
              <PersonAddOutlinedIcon className="text-blue-600" />

              <h2 className="text-lg font-semibold text-slate-800">
                Patient Information
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Patient Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Patient Name *
                </label>

                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(event) =>
                    handleChange(
                      "patientName",
                      event.target.value
                    )
                  }
                  placeholder="Enter patient name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.patientName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.patientName}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Age *
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(event) =>
                    handleChange(
                      "age",
                      event.target.value
                    )
                  }
                  placeholder="Enter age"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.age && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Gender *
                </label>

                <select
                  value={formData.gender}
                  onChange={(event) =>
                    handleChange(
                      "gender",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    handleChange(
                      "phone",
                      event.target.value.replace(/\D/g, "").slice(0,10)
                    )
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter patient address"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* DOCTOR / REFERRAL */}
          <div className="mb-8 border-t border-slate-200 pt-8">
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Doctor / Referral
            </h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Concerned Doctor *
              </label>

              <select
                value={formData.doctorId}
                onChange={(event) =>
                  handleDoctorChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select concerned doctor
                </option>

                {doctors
                  .filter(
                    (doctor) =>
                      doctor.status === "Active"
                  )
                  .map((doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      {doctor.doctorName} —{" "}
                      {doctor.specialization}
                    </option>
                  ))}
              </select>

              {errors.doctorId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.doctorId}
                </p>
              )}

              {doctors.filter(
                (doctor) =>
                  doctor.status === "Active"
              ).length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No active doctors available. Please add a
                  doctor before registering a referred patient.
                </p>
              )}
            </div>
          </div>

          {/* REQUIRED TESTS */}
          <div className="border-t border-slate-200 pt-8">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Required Tests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the tests requested for this patient
                from the active Test List.
              </p>
            </div>

            {/* NO TESTS */}
            {tests.filter(
              (test) => test.status === "Active"
            ).length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-800">
                  No active tests available.
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Please add and activate tests from the Test
                  List before registering a patient.
                </p>
              </div>
            )}

            {/* TEST LIST */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {tests
                .filter(
                  (test) => test.status === "Active"
                )
                .map((test) => {
                  const selected =
                    formData.requiredTests.includes(
                      test.testCode
                    );

                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() =>
                        handleTestChange(
                          test.testCode
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">

                        <span
                          className={`text-sm font-semibold ${
                            selected
                              ? "text-blue-700"
                              : "text-slate-800"
                          }`}
                        >
                          {test.testCode}
                        </span>

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <span className="text-xs text-white">
                              ✓
                            </span>
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-700">
                        {test.testName}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {test.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {test.sampleType}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {test.turnaroundTime}
                        </span>

                        <span className="text-sm font-semibold text-slate-800">
                          ₹
                          {test.price.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {errors.requiredTests && (
              <p className="mt-2 text-xs text-red-500">
                {errors.requiredTests}
              </p>
            )}

            {/* SELECTED TEST SUMMARY */}
            {formData.requiredTests.length > 0 && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-800">
                    Selected Tests
                  </p>

                  <p className="text-sm font-semibold text-blue-800">
                    {formData.requiredTests.length} selected
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.requiredTests.map(
                    (testCode) => {
                      const selectedTest = tests.find(
                        (test) =>
                          test.testCode === testCode
                      );

                      return (
                        <span
                          key={testCode}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                        >
                          {selectedTest
                            ? `${selectedTest.testCode} — ${selectedTest.testName}`
                            : testCode}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">

            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Register Patient
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

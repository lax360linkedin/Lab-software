import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import type { Doctor, Referral } from "../../doctors/Doctor";
import { getStoredTests, type LabTest } from "../../tests/Tests";

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
  email: string;
  doctorId: string;
  doctorReferral: string;
  requiredTests: string[];
}

const DOCTOR_STORAGE_KEY = "lab_doctors";
const PATIENT_STORAGE_KEY = "lab_patients";
const REFERRAL_STORAGE_KEY = "lab_referrals";

interface StoredPatient {
  patientId?: string;
  patientName?: string;
  age?: string | number;
  gender?: string;
  phone?: string;
  address?: string;
  email?: string;
  doctorId?: string;
  doctorReferral?: string;
  registrationDate?: string;
}

const getExistingPatient = (patientId: string | null): StoredPatient | null => {
  if (!patientId) return null;

  try {
    const stored = localStorage.getItem(PATIENT_STORAGE_KEY);
    const patients: StoredPatient[] = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(patients)) return null;

    return (
      patients
        .filter((patient) => patient.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.registrationDate ?? 0).getTime() -
            new Date(a.registrationDate ?? 0).getTime()
        )[0] ?? null
    );
  } catch {
    return null;
  }
};

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
  const [searchParams] = useSearchParams();
  const existingPatientId = searchParams.get("patientId");
  const isExistingPatient = Boolean(existingPatientId);
  const [doctors] = useState<Doctor[]>(() => getDoctors());
  const [tests] = useState<LabTest[]>(() => getStoredTests());
  const [testSearch, setTestSearch] = useState("");

  const existingPatient = getExistingPatient(existingPatientId);

  const [formData, setFormData] = useState<FormData>(() => ({
    patientName: existingPatient?.patientName ?? "",
    age: String(existingPatient?.age ?? ""),
    gender: existingPatient?.gender ?? "",
    phone: (existingPatient?.phone ?? "").replace(/\D/g, "").slice(0, 10),
    address: existingPatient?.address ?? "",
    email: existingPatient?.email ?? "",
    doctorId: existingPatient?.doctorId ?? "",
    doctorReferral: existingPatient?.doctorReferral ?? "",
    requiredTests: [],
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [registeredPatient, setRegisteredPatient] = useState<{
    patientId: string;
    registrationId: string;
    patientName: string;
    doctorName: string;
    email?: string;
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
    if (doctorId === "SELF") {
      setFormData((previous) => ({
        ...previous,
        doctorId: "SELF",
        doctorReferral: "Self Referral",
      }));
      setErrors((previous) => ({
        ...previous,
        doctorId: "",
      }));
      return;
    }

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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter exactly 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
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
    if (existingPatientId && !existingPatient) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const isSelf = formData.doctorId === "SELF";
    const selectedDoctor = isSelf
      ? {
          id: "SELF",
          doctorCode: "SELF",
          doctorName: "Self Referral",
          specialization: "General / Walk-in",
          phone: "-",
          email: "-",
          address: "-",
          referralType: "Direct",
          commissionApplicable: false,
          notes: "Walk-in patient without external doctor",
          status: "Active" as const,
          createdAt: new Date().toISOString(),
        }
      : doctors.find((doctor) => doctor.id === formData.doctorId);

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

    const patientId = existingPatientId || generatePatientId();
    const registrationId = generateRegistrationId();
    const referralId = generateReferralId();

    const registrationDate = new Date().toISOString();

    const newPatient = {
      id: registrationId,
      patientId,
      registrationId,
      patientName: formData.patientName.trim(),
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      email: formData.email.trim(),
      doctorId: selectedDoctor.id,
      doctorReferral: selectedDoctor.doctorName,
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
      email: formData.email.trim(),
      tests: selectedTests,
    });

    setRegistrationSuccess(true);
  };

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
                {isExistingPatient ? "New Visit Registered Successfully" : "Patient Registered Successfully"}
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

              {/* Email / Gmail */}
              {registeredPatient.email && (
                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500">
                    Email / Gmail
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {registeredPatient.email}
                  </p>
                </div>
              )}

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
                onClick={() => { alert("WhatsApp notification API will be connected here."); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Send WhatsApp
              </button>

              <button
                type="button"
                onClick={() => { alert("SMS notification API will be connected here."); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover"
              >
                Send SMS
              </button>

              <button
                type="button"
                onClick={() => {
                  alert("Email notification API will be connected here.");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover"
              >
                Email
              </button>

            </div>
          </div>
        </div>
      </div >
    );
  }

  const activeTests = tests.filter((test) => test.status !== "Inactive");
  const query = testSearch.trim().toLowerCase();
  const visibleTests = activeTests.filter((test) =>
    !query ||
    String(test.testCode || "").toLowerCase().includes(query) ||
    String(test.testName || "").toLowerCase().includes(query) ||
    String(test.category || "").toLowerCase().includes(query)
  );

  /*
   * REGISTRATION FORM
   */
  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm"
            aria-hidden="true"
          >
            <PersonAddOutlinedIcon fontSize="small" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isExistingPatient ? "Register New Visit" : "New Patient Registration"}
            </h1>

            <p className="text-xs text-slate-500">
              Register patient, assign doctor/self, and select tests.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {existingPatientId && !existingPatient && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <p className="font-semibold">Existing patient could not be found.</p>
            <p className="mt-0.5">
              Return to the existing patient list and select a valid patient before
              registering a new visit.
            </p>
            <button
              type="button"
              onClick={() => navigate("/patients/existing")}
              className="mt-1 font-semibold underline underline-offset-2"
            >
              Back to Existing Patients
            </button>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          {/* PATIENT INFORMATION */}
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <PersonAddOutlinedIcon className="text-blue-600" fontSize="small" />

              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Patient Information
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Patient Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Patient Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(event) =>
                    handleChange("patientName", event.target.value)
                  }
                  placeholder="Enter patient name"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.patientName && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.patientName}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Age <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(event) =>
                    handleChange("age", event.target.value)
                  }
                  placeholder="Enter age"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.age && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Gender <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.gender}
                  onChange={(event) =>
                    handleChange("gender", event.target.value)
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {errors.gender && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Phone <span className="text-red-500">*</span>
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={formData.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Enter 10-digit phone number"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.phone && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Address
                </label>

                <textarea
                  value={formData.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  placeholder="Enter patient address"
                  rows={3}
                  className="min-h-20 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email / Gmail */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email / Gmail <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="Enter email (e.g. patient@gmail.com)"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.email && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DOCTOR / REFERRAL */}
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Doctor / Referral
              </h2>
              <span className="text-[11px] text-slate-500">
                Assign referring doctor or select Self
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Concerned Doctor <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.doctorId}
                  onChange={(event) => handleDoctorChange(event.target.value)}
                  className={`h-9 w-full rounded-lg border px-3 py-1.5 text-xs sm:text-sm outline-none transition ${
                    formData.doctorId === "SELF"
                      ? "border-blue-500 bg-blue-50/60 font-medium text-blue-900"
                      : "border-slate-300 bg-white text-slate-800"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                >
                  <option value="">Select concerned doctor</option>
                  <option value="SELF">Self</option>
                  {doctors
                    .filter((doctor) => doctor.status === "Active")
                    .map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.doctorName}{"\u2014"}{doctor.specialization}
                      </option>
                    ))}
                </select>

                {errors.doctorId && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.doctorId}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" aria-hidden="true">
                  &nbsp;
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/doctors?tab=add")}
                  className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 active:scale-[0.98]"
                >
                  <AddIcon sx={{ fontSize: 15 }} />
                  Add Doctor
                </button>
              </div>

              {doctors.filter((doctor) => doctor.status === "Active").length === 0 &&
                formData.doctorId !== "SELF" && (
                  <p className="text-xs text-amber-600 sm:col-span-2">
                    No active doctors available. Select &quot;Self&quot; or click &quot;Add Doctor&quot; to create one.
                  </p>
                )}
            </div>
          </div>

          {/* REQUIRED TESTS */}
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Required Tests
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select tests requested for this patient.
                </p>
              </div>

              {/* Compact Test Search Box */}
              <div className="relative w-full sm:w-64">
                <SearchIcon
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="text"
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  placeholder="Search test by name / code..."
                  className="h-7 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>

            {/* NO TESTS */}
            {activeTests.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
                <p className="font-semibold text-amber-800">
                  No active tests available.
                </p>
                <p className="mt-0.5 text-amber-700">
                  Please add and activate tests from the Test List before registering a patient.
                </p>
              </div>
            )}

            {/* TEST LIST - Compact cards */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {visibleTests.map((test) => {
                  const selected = formData.requiredTests.includes(test.testCode);

                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => handleTestChange(test.testCode)}
                      className={`flex min-h-[108px] flex-col justify-between rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50/80 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold ${
                            selected ? "text-blue-700" : "text-slate-800"
                          }`}
                        >
                          {test.testCode}
                        </span>

                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && <span className="text-[10px] leading-none">✓</span>}
                        </span>
                      </div>

                      <p
                        className="mt-0.5 text-xs text-slate-700 truncate"
                        title={test.testName}
                      >
                        {test.testName}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 truncate max-w-[110px]">
                          {test.category}
                        </span>

                        <span className="text-xs font-bold text-slate-800">
                          ₹{test.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </button>
                  );
              })}
            </div>

            {activeTests.length > 0 && visibleTests.length === 0 && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>No tests match “{testSearch}”.</span>
                <button type="button" onClick={() => setTestSearch("")} className="font-semibold text-blue-600 hover:text-blue-800">
                  Clear search
                </button>
              </div>
            )}

            {errors.requiredTests && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.requiredTests}
              </p>
            )}


          </div>

          {/* BUTTONS */}
          <div className="mt-4 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={Boolean(existingPatientId && !existingPatient)}
              className="rounded-lg bg-blue-600 px-5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExistingPatient ? "Register New Visit" : "Register Patient"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

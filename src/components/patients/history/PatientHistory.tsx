import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";

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

interface Patient {
  id: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  age: string | number;
  gender: string;
  phone: string;
  address?: string;
  doctorId?: string;
  doctorReferral?: string;
  requiredTests: SelectedTest[] | string[];
  registrationDate: string;
  status: string;
}

const formatRegistrationDate = (
  date: string
) => {
  if (!date) {
    return "—";
  }

  if (
    !date.includes("T") &&
    !date.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatRegistrationDateTime = (
  date: string
) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getTestName = (
  test: SelectedTest | string
) => {
  if (typeof test === "string") {
    return test;
  }

  return test.testName;
};

const getTestCode = (
  test: SelectedTest | string
) => {
  if (typeof test === "string") {
    return test;
  }

  return test.testCode;
};

const getTestPrice = (
  test: SelectedTest | string
) => {
  if (typeof test === "string") {
    return 0;
  }

  return Number(test.price) || 0;
};

const getTotalTestAmount = (
  tests: SelectedTest[] | string[]
) => {
  return tests.reduce(
    (total, test) =>
      total + getTestPrice(test),
    0
  );
};

const PatientHistory = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string; }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = [
    "Overview",
    "Tests",
    "Reports",
    "Visits",
  ];

  const patient = useMemo<Patient | null>(() => {
    if (!patientId) {
      return null;
    }

    const storedPatients =
      localStorage.getItem("lab_patients");

    if (!storedPatients) {
      return null;
    }

    try {
      const parsedPatients =
        JSON.parse(storedPatients);

      if (!Array.isArray(parsedPatients)) {
        return null;
      }
      const foundPatient =
        parsedPatients.find(
          (item) =>
            item?.patientId === patientId
        );

      return foundPatient
        ? (foundPatient as Patient)
        : null;
    } catch {
      return null;
    }
  }, [patientId]);

  if (!patient) {
    return (
      <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl">

          <div className="mb-6 flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/patients")
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Back to Patients"
            >
              <ArrowBackIcon fontSize="small" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Patient History
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Patient record could not be found
              </p>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <PersonIcon className="text-slate-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-700">
              Patient Not Found
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The selected patient record is not available
              in the current patient records.
            </p>

            {patientId && (
              <p className="mt-2 text-xs text-slate-400">
                Patient ID: {patientId}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                navigate("/patients")
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Patients
            </button>

          </div>

        </div>
      </div>
    );
  }

  const patientTests =
    patient.requiredTests || [];

  const totalTestAmount =
    getTotalTestAmount(patientTests);

  return (
    <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/patients")
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Back to Patients"
          >
            <ArrowBackIcon fontSize="small" />
          </button>

          <div>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Patient History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Complete patient information, tests and history
            </p>

          </div>

        </div>

      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <PersonIcon fontSize="large" />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                {patient.patientName}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">

                <span>
                  {patient.patientId}
                </span>

                <span>
                  {patient.registrationId}
                </span>

                <span>
                  {patient.age} years /{" "}
                  {patient.gender}
                </span>

              </div>

            </div>

          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${patient.status ===
                "Completed"
                ? "bg-emerald-50 text-emerald-700"
                : patient.status ===
                  "Pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-blue-50 text-blue-700"
              }`}
          >
            {patient.status}
          </span>

        </div>

      </div>

      <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max border-b border-slate-200">

          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-5 py-4 text-sm font-semibold transition ${activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab}
            </button>
          ))}

        </div>

      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <PersonIcon fontSize="small" />
              </div>

              <div>

                <h3 className="text-base font-bold text-slate-800">
                  Patient Information
                </h3>

                <p className="text-xs text-slate-400">
                  Personal and contact details
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Patient ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.patientId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Registration ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.registrationId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Patient Name
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.patientName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Age
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.age}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Gender
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.gender}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.phone}
                </p>
              </div>

            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">

              <p className="text-xs font-medium text-slate-400">
                Address
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {patient.address ||
                  "Not provided"}
              </p>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarTodayOutlinedIcon fontSize="small" />
              </div>

              <div>

                <h3 className="text-base font-bold text-slate-800">
                  Registration Details
                </h3>

                <p className="text-xs text-slate-400">
                  Registration and referral information
                </p>

              </div>

            </div>

            <div className="space-y-5">

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Registration Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatRegistrationDate(
                    patient.registrationDate
                  )}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Registered On
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatRegistrationDateTime(
                    patient.registrationDate
                  )}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Doctor / Referral
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {patient.doctorReferral ||
                    "Not provided"}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Current Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${patient.status ===
                      "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : patient.status ===
                        "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                >
                  {patient.status}
                </span>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">

            <div className="mb-5 flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ScienceOutlinedIcon fontSize="small" />
                </div>

                <div>

                  <h3 className="text-base font-bold text-slate-800">
                    Required Tests
                  </h3>

                  <p className="text-xs text-slate-400">
                    Tests assigned during registration
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {patientTests.length}{" "}
                test
                {patientTests.length !==
                  1
                  ? "s"
                  : ""}
              </span>

            </div>

            {patientTests.length > 0 ? (
              <div className="space-y-3">

                {patientTests.map(
                  (
                    test,
                    index
                  ) => {
                    const isOldTest =
                      typeof test ===
                      "string";

                    return (
                      <div
                        key={
                          isOldTest
                            ? `${test}-${index}`
                            : test.testId
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {getTestCode(
                                  test
                                )}
                              </span>

                              <h4 className="text-sm font-semibold text-slate-800">
                                {getTestName(
                                  test
                                )}
                              </h4>

                            </div>

                            {!isOldTest && (
                              <div className="mt-2 flex flex-wrap gap-2">

                                <span className="text-xs text-slate-500">
                                  Category:{" "}
                                  {
                                    test.category
                                  }
                                </span>

                                <span className="text-xs text-slate-300">
                                  •
                                </span>

                                <span className="text-xs text-slate-500">
                                  Sample:{" "}
                                  {
                                    test.sampleType
                                  }
                                </span>

                                <span className="text-xs text-slate-300">
                                  •
                                </span>

                                <span className="text-xs text-slate-500">
                                  Method:{" "}
                                  {
                                    test.method
                                  }
                                </span>

                              </div>
                            )}

                          </div>

                          {!isOldTest && (
                            <div className="shrink-0 text-left sm:text-right">

                              <p className="text-sm font-bold text-slate-800">
                                ₹
                                {getTestPrice(
                                  test
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                TAT:{" "}
                                {
                                  test.turnaroundTime
                                }
                              </p>

                            </div>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

                {totalTestAmount >
                  0 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">

                      <span className="text-sm font-semibold text-blue-700">
                        Total Test Amount
                      </span>

                      <span className="text-lg font-bold text-blue-800">
                        ₹
                        {totalTestAmount.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>
                  )}

              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <ScienceOutlinedIcon className="text-slate-300" />

                <p className="mt-2 text-sm text-slate-400">
                  No tests assigned
                </p>

              </div>
            )}

          </div>

        </div>
      )}

      {activeTab === "Tests" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ScienceOutlinedIcon fontSize="small" />
              </div>

              <div>

                <h3 className="text-base font-bold text-slate-800">
                  Patient Tests
                </h3>

                <p className="text-xs text-slate-400">
                  Tests associated with this patient
                </p>

              </div>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {patientTests.length}{" "}
              test
              {patientTests.length !==
                1
                ? "s"
                : ""}
            </span>

          </div>

          {patientTests.length > 0 ? (
            <div className="space-y-3">

              {patientTests.map(
                (
                  test,
                  index
                ) => {
                  const isOldTest =
                    typeof test ===
                    "string";

                  return (
                    <div
                      key={
                        isOldTest
                          ? `${test}-${index}`
                          : test.testId
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {getTestCode(
                                test
                              )}
                            </span>

                            <p className="text-sm font-semibold text-slate-800">
                              {getTestName(
                                test
                              )}
                            </p>

                          </div>

                          {!isOldTest && (
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">

                              <span>
                                <span className="font-medium text-slate-600">
                                  Category:
                                </span>{" "}
                                {
                                  test.category
                                }
                              </span>

                              <span>
                                <span className="font-medium text-slate-600">
                                  Sample:
                                </span>{" "}
                                {
                                  test.sampleType
                                }
                              </span>

                              <span>
                                <span className="font-medium text-slate-600">
                                  Method:
                                </span>{" "}
                                {
                                  test.method
                                }
                              </span>

                              <span>
                                <span className="font-medium text-slate-600">
                                  TAT:
                                </span>{" "}
                                {
                                  test.turnaroundTime
                                }
                              </span>

                            </div>
                          )}

                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">

                          {!isOldTest && (
                            <p className="text-base font-bold text-slate-800">
                              ₹
                              {getTestPrice(
                                test
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          )}
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Registered
                          </span>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

              {totalTestAmount >
                0 && (
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">

                    <div className="flex items-center gap-3">

                      <PaymentOutlinedIcon className="text-blue-600" />

                      <div>

                        <p className="text-sm font-semibold text-blue-800">
                          Estimated Test Amount
                        </p>

                        <p className="text-xs text-blue-600">
                          Based on the tests selected during registration
                        </p>

                      </div>

                    </div>

                    <p className="text-xl font-bold text-blue-800">
                      ₹
                      {totalTestAmount.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>
                )}

            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">

              <ScienceOutlinedIcon
                className="text-slate-300"
                sx={{
                  fontSize: 48,
                }}
              />

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No Tests Assigned
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                No tests were selected during patient registration.
              </p>

            </div>
          )}

        </div>
      )}

      {activeTab === "Reports" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ReceiptLongOutlinedIcon
                className="text-slate-300"
                sx={{
                  fontSize: 32,
                }}
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-700">
              No Reports Available
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-400">
              Patient reports will appear here after
              the registered tests are processed,
              results are verified and reports are generated.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">

              <p className="text-xs font-medium text-slate-500">
                Current Workflow Stage
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-600">
                Patient Registered → Awaiting Test Processing
              </p>

            </div>

          </div>

        </div>
      )}

      {activeTab === "Visits" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <CalendarTodayOutlinedIcon
                className="text-slate-300"
                sx={{
                  fontSize: 32,
                }}
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-700">
              No Previous Visits
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-400">
              Visit history will appear here when this
              patient has additional registrations or visits.
            </p>

          </div>

        </div>
      )}

    </div>
  );
};

export default PatientHistory;
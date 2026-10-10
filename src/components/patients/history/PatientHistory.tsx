import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import Table from "../../../common components/Table";

interface SelectedTest {
  testId?: string;
  testCode?: string;
  testName?: string;
  category?: string;
  sampleType?: string;
  method?: string;
  price?: number;
  turnaroundTime?: string;
}

type TestValue = SelectedTest | string;

interface Patient {
  id?: string;
  patientId: string;
  registrationId: string;
  patientName: string;
  age: string | number;
  gender: string;
  phone: string;
  address?: string;
  doctorId?: string;
  doctorReferral?: string;
  requiredTests?: TestValue[];
  registrationDate?: string;
  status?: string;
}

interface LabSample {
  id?: string;
  patientId?: string;
  patientName?: string;
  registrationId?: string;
  sampleId?: string;
  accessionNumber?: string;
  testName?: string;
  testCode?: string;
  reportId?: string;
  reportStatus?: string;
  resultStatus?: string;
  status?: string;
  sampleStatus?: string;
  collectionDate?: string;
  collectionDateTime?: string;
  collectedAt?: string;
  receivedDate?: string;
  receivedDateTime?: string;
  receivedAt?: string;
  analysisStartDate?: string;
  processingStartedAt?: string;
  analysisCompletedDate?: string;
  completedAt?: string;
  verificationDate?: string;
  verificationTime?: string;
  reportGeneratedAt?: string;
  reportDate?: string;
  generatedDate?: string;
  priority?: string;
}

const safeReadArray = <T,>(key: string): T[] => {
  try {
    const value = localStorage.getItem(key);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const asDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTimeValue = (...values: (string | undefined)[]) =>
  values.find((value) => Boolean(value && value.trim())) || "";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = asDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const parsed = asDate(value);
  if (!parsed) return value;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "—";
  const parsed = asDate(value);
  if (!parsed) return value;
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTestName = (test: TestValue) =>
  typeof test === "string" ? test : test.testName || test.testCode || "Test";

const getTestCode = (test: TestValue) =>
  typeof test === "string" ? test : test.testCode || "—";

const getTestPrice = (test: TestValue) =>
  typeof test === "string" ? 0 : Number(test.price) || 0;

const statusClass = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (["final", "verified", "completed", "paid", "accepted", "ready"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["pending", "received", "processing", "registered", "awaiting verification"].includes(normalized)) {
    return "bg-amber-50 text-amber-700";
  }
  if (["rejected", "failed", "cancelled"].includes(normalized)) {
    return "bg-rose-50 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
};

const PatientHistory = () => {
  const navigate = useNavigate();
  const { patientId = "" } = useParams<{ patientId: string }>();
  const [activeTab, setActiveTab] = useState("Overview");

  const allPatients = useMemo(() => safeReadArray<Patient>("lab_patients"), []);
  const allSamples = useMemo(() => safeReadArray<LabSample>("lab_samples"), []);

  // Each row in lab_patients represents a registration/visit. Keep the same
  // patient ID grouped together so repeat visits are visible in this history.
  const visits = useMemo(
    () =>
      allPatients
        .filter((item) => item.patientId === patientId)
        .sort((a, b) => {
          const first = asDate(a.registrationDate)?.getTime() || 0;
          const second = asDate(b.registrationDate)?.getTime() || 0;
          return second - first;
        }),
    [allPatients, patientId]
  );

  const patient = visits[0] || null;
  const patientSamples = useMemo(
    () =>
      allSamples
        .filter((sample) => sample.patientId === patientId)
        .sort((a, b) => {
          const first = asDate(
            getTimeValue(a.collectionDateTime, a.collectionDate, a.collectedAt)
          )?.getTime() || 0;
          const second = asDate(
            getTimeValue(b.collectionDateTime, b.collectionDate, b.collectedAt)
          )?.getTime() || 0;
          return second - first;
        }),
    [allSamples, patientId]
  );

  const allVisitTests = useMemo(
    () =>
      visits.flatMap((visit) =>
        (visit.requiredTests || []).map((test, index) => ({
          key: `${visit.registrationId}-${typeof test === "string" ? test : test.testId || test.testCode || getTestName(test)}-${index}`,
          registrationId: visit.registrationId,
          registrationDate: visit.registrationDate || "",
          test,
          visitStatus: visit.status || "Registered",
        }))
      ),
    [visits]
  );

  const reports = useMemo(
    () =>
      patientSamples.filter(
        (sample) =>
          sample.reportStatus?.toLowerCase() === "final" &&
          sample.resultStatus?.toLowerCase() === "verified"
      ),
    [patientSamples]
  );

  if (!patient) {
    return (
      <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Back to Patients"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Patient History</h1>
              <p className="mt-1 text-sm text-slate-500">Patient record could not be found</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <PersonOutlineOutlinedIcon sx={{ fontSize: 42 }} className="text-slate-300" />
            <h2 className="mt-3 text-lg font-semibold text-slate-700">Patient Not Found</h2>
            <p className="mt-2 text-sm text-slate-500">
              This patient ID was not found in the saved patient records.
            </p>
            {patientId && <p className="mt-2 text-xs text-slate-400">Patient ID: {patientId}</p>}
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  const latestRegistrationDate = patient.registrationDate || "";
  const currentTests = patient.requiredTests || [];
  const totalAmount = currentTests.reduce((total, test) => total + getTestPrice(test), 0);

  const tabs = [
    { label: "Overview", count: undefined },
    { label: "Tests", count: allVisitTests.length },
    { label: "Reports", count: reports.length },
    { label: "Visits", count: visits.length },
  ];

  return (
    <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
            title="Back to Patients"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Patient History</h1>
            <p className="mt-1 text-sm text-slate-500">
              Patient details, registration timeline, test history and final reports
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/patients/new-registration?patientId=${encodeURIComponent(patient.patientId)}`)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <PersonOutlineOutlinedIcon fontSize="small" />
          Register New Visit
        </button>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <PersonOutlineOutlinedIcon fontSize="large" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{patient.patientName}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{patient.patientId}</span>
                <span>{patient.age} years · {patient.gender}</span>
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(patient.status)}`}>
              {patient.status || "Registered"}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {visits.length} visit{visits.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={`inline-flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${
                activeTab === tab.label
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {typeof tab.count === "number" && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.label ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <PersonOutlineOutlinedIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Patient Information</h3>
                <p className="text-xs text-slate-400">Personal and contact details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                ["Patient ID", patient.patientId],
                ["Phone", patient.phone],
                ["Age", String(patient.age)],
                ["Gender", patient.gender],
                ["Doctor / Referral", patient.doctorReferral || "Not provided"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-700">{value || "—"}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs font-medium text-slate-400">Address</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{patient.address || "Not provided"}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <CalendarTodayOutlinedIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Latest Registration</h3>
                <p className="text-xs text-slate-400">Date and time of the latest visit</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CalendarTodayOutlinedIcon className="mt-0.5 text-slate-400" fontSize="small" />
                <div>
                  <p className="text-xs font-medium text-slate-400">Registration Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(latestRegistrationDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AccessTimeOutlinedIcon className="mt-0.5 text-slate-400" fontSize="small" />
                <div>
                  <p className="text-xs font-medium text-slate-400">Registration Time</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{formatTime(latestRegistrationDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Current Status</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(patient.status)}`}>
                  {patient.status || "Registered"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ScienceOutlinedIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Tests in Latest Visit</h3>
                  <p className="text-xs text-slate-400">Selected tests with prices and turnaround time</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {currentTests.length} test{currentTests.length === 1 ? "" : "s"}
              </span>
            </div>
            {currentTests.length ? (
              <div className="space-y-3">
                {currentTests.map((test, index) => (
                  <div key={`${getTestCode(test)}-${index}`} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{getTestCode(test)}</span>
                        <h4 className="text-sm font-semibold text-slate-800">{getTestName(test)}</h4>
                      </div>
                      {typeof test !== "string" && (
                        <p className="mt-2 text-xs text-slate-500">
                          {test.category || "Category not set"} · {test.sampleType || "Sample not set"} · {test.method || "Method not set"} · TAT: {test.turnaroundTime || "—"}
                        </p>
                      )}
                    </div>
                    {getTestPrice(test) > 0 && (
                      <p className="shrink-0 text-sm font-bold text-slate-800">₹{getTestPrice(test).toLocaleString("en-IN")}</p>
                    )}
                  </div>
                ))}
                {totalAmount > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                    <span className="text-sm font-semibold text-blue-700">Total Test Amount</span>
                    <span className="text-lg font-bold text-blue-800">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No tests are assigned to the latest registration.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Visit Timeline</h3>
                <p className="mt-1 text-xs text-slate-400">Registration date and time for each visit</p>
              </div>
              <button type="button" onClick={() => setActiveTab("Visits")} className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all visits</button>
            </div>
            <div className="space-y-3">
              {visits.slice(0, 3).map((visit) => (
                <div key={visit.registrationId} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{patientId}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(visit.registrationDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(visit.status)}`}>{visit.status || "Registered"}</span>
                    <span className="text-xs text-slate-500">{visit.requiredTests?.length || 0} tests</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "Tests" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ScienceOutlinedIcon /></div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Test History</h3>
                <p className="text-xs text-slate-400">All tests across this patient's registrations</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{allVisitTests.length} test orders</span>
          </div>
          {allVisitTests.length ? (
            <div className="overflow-x-auto">
              <Table
                columns={["Test Code", "Test Name", "Category", "Price", "Registration Date & Time", "Visit Status"]}
                data={allVisitTests}
                maxHeight="520px"
                renderRow={(item: (typeof allVisitTests)[number]) => (
                  <>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{getTestCode(item.test)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{getTestName(item.test)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{typeof item.test === "string" ? "—" : item.test.category || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{getTestPrice(item.test) ? `₹${getTestPrice(item.test).toLocaleString("en-IN")}` : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDateTime(item.registrationDate)}</td>
                    <td className="whitespace-nowrap px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.visitStatus)}`}>{item.visitStatus}</span></td>
                  </>
                )}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <ScienceOutlinedIcon sx={{ fontSize: 42 }} className="text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No Test History</p>
              <p className="mt-1 text-xs text-slate-400">Tests will appear here after registration.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === "Reports" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ReceiptLongOutlinedIcon /></div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Final Report History</h3>
                <p className="text-xs text-slate-400">Verified reports marked Final from the saved sample records</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/reports")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Open Reports <OpenInNewOutlinedIcon fontSize="small" />
            </button>
          </div>
          {reports.length ? (
            <div className="overflow-x-auto">
              <Table
                columns={["Report ID", "Test", "Sample ID", "Report Date & Time", "Status", "Action"]}
                data={reports}
                maxHeight="520px"
                renderRow={(report: LabSample) => (
                  <>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-blue-700">{report.reportId || "—"}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{report.testName || report.testCode || "Test report"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{report.sampleId || report.accessionNumber || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDateTime(getTimeValue(report.reportGeneratedAt, report.reportDate, report.generatedDate))}</td>
                    <td className="whitespace-nowrap px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(report.reportStatus)}`}>{report.reportStatus || "Final"}</span></td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button type="button" onClick={() => navigate("/reports")} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">View Reports</button>
                    </td>
                  </>
                )}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <ReceiptLongOutlinedIcon sx={{ fontSize: 42 }} className="text-slate-300" />
              <h4 className="mt-3 text-sm font-semibold text-slate-700">No Final Reports Found</h4>
              <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-400">
                Reports will show here when the patient's sample record is verified and its report status is set to Final.
              </p>
              <button type="button" onClick={() => navigate("/reports")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Go to Reports</button>
            </div>
          )}
        </section>
      )}

      {activeTab === "Visits" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarTodayOutlinedIcon /></div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Visit Timeline</h3>
                <p className="text-xs text-slate-400">Each registration is shown as a separate visit</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{visits.length} total visits</span>
          </div>
          {visits.length ? (
            <div className="space-y-3">
              {visits.map((visit, index) => (
                <article key={visit.id || index} className="relative rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarTodayOutlinedIcon fontSize="small" /></div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{visit.patientId}</h4>
                          {index === 0 && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Latest visit</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{formatDateTime(visit.registrationDate)}</p>
                        <p className="mt-2 text-xs text-slate-500">Doctor / Referral: {visit.doctorReferral || "Not provided"}</p>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(visit.status)}`}>{visit.status || "Registered"}</span>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tests registered ({visit.requiredTests?.length || 0})</p>
                    {visit.requiredTests?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {visit.requiredTests.map((test, testIndex) => (
                          <span key={`${getTestCode(test)}-${testIndex}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                            {getTestCode(test)} · {getTestName(test)}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-400">No tests recorded for this visit.</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} /> Date: {formatDate(visit.registrationDate)}</span>
                    <span className="inline-flex items-center gap-1.5"><AccessTimeOutlinedIcon sx={{ fontSize: 14 }} /> Time: {formatTime(visit.registrationDate)}</span>
                    <span>{patientSamples.filter((sample) => sample.registrationId === visit.registrationId).length} sample record(s)</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">No visits have been recorded for this patient.</div>
          )}
        </section>
      )}
    </div>
  );
};

export default PatientHistory;

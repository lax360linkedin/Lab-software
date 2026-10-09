import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import "./patients.css";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";

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
  doctorReferral?: string;
  requiredTests: SelectedTest[] | string[];
  registrationDate: string;
  status: string;
}


const columns = [
  "Patient ID",
  "Registration ID",
  "Patient Name",
  "Age",
  "Gender",
  "Phone",
  "Doctor / Referral",
  "Tests",
  "Registration Date",
  "Status",
  "Actions",
];
const formatRegistrationDate = (date: string) => {
  if (!date) {
    return "—";
  }

  if (
    !date.includes("T") &&
    !date.includes("-")
  ) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTestDisplayName = (
  test: SelectedTest | string
) => {
  if (typeof test === "string") {
    return test;
  }

  return `${test.testCode} — ${test.testName}`;
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
    (total, test) => total + getTestPrice(test),
    0
  );
};


const PatientList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showExistingPatients, setShowExistingPatients] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setOpenMenu] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const storedPatients = localStorage.getItem("lab_patients");
      if (!storedPatients) return [];

      const parsedPatients: unknown = JSON.parse(storedPatients);
      if (!Array.isArray(parsedPatients)) return [];

      // Remove only the six known demo records that were previously seeded by this page.
      const demoPatients = new Set([
        "PAT-10001|Arun Kumar",
        "PAT-10002|Priya Sharma",
        "PAT-10003|Rajesh Kumar",
        "PAT-10004|Divya Menon",
        "PAT-10005|Karthik Raj",
        "PAT-10006|Anitha Devi",
      ]);
      const cleanedPatients = (parsedPatients as Patient[]).filter(
        (patient) => !demoPatients.has(`${patient.patientId}|${patient.patientName}`)
      );

      if (cleanedPatients.length !== parsedPatients.length) {
        localStorage.setItem("lab_patients", JSON.stringify(cleanedPatients));
      }
      return cleanedPatients;
    } catch {
      return [];
    }
  });

  const filteredPatients = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    // Existing Patients shows one row per unique patient, using their latest saved registration.
    const sourcePatients = showExistingPatients
      ? patients.reduce<Patient[]>((unique, patient) => {
          const existingIndex = unique.findIndex(
            (item) => item.patientId === patient.patientId
          );
          if (existingIndex === -1) unique.push(patient);
          else unique[existingIndex] = patient;
          return unique;
        }, [])
      : patients;

    if (!value) {
      return sourcePatients;
    }

    return sourcePatients.filter((patient) => {
      const testSearchText =
        Array.isArray(patient.requiredTests)
          ? patient.requiredTests
              .map((test) =>
                getTestDisplayName(test)
              )
              .join(" ")
          : "";

      return [
        patient.patientId,
        patient.registrationId,
        patient.patientName,
        patient.phone,
        patient.doctorReferral || "",
        patient.gender,
        patient.status,
        testSearchText,
      ].some((field) =>
        String(field)
          .toLowerCase()
          .includes(value)
      );
    });
  }, [search, patients, showExistingPatients]);

  const currentData =
    filteredPatients.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient({
      ...patient,
    });

    setIsEditMode(false);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient({
      ...patient,
    });

    setIsEditMode(true);
    setIsViewDrawerOpen(true);
  };

  const handleHistory = (patient: Patient) => {
  navigate(`/patients/history/${patient.patientId}`);
  setOpenMenu(null);
};

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingPatient) return;
    const updated = patients.filter((p) => p.patientId !== deletingPatient.patientId);
    setPatients(updated);
    localStorage.setItem("lab_patients", JSON.stringify(updated));
    setDeletingPatient(null);
    showToast("Deleted successfully");
  };

  const handleSavePatient = () => {
    if (!selectedPatient) {
      return;
    }

    const updatedPatients =
      patients.map((patient) =>
        patient.patientId ===
        selectedPatient.patientId
          ? selectedPatient
          : patient
      );

    setPatients(updatedPatients);

    localStorage.setItem(
      "lab_patients",
      JSON.stringify(updatedPatients)
    );

    setIsEditMode(false);
    setIsViewDrawerOpen(false);
    setSelectedPatient(null);
    showToast("Patient details updated successfully.");
  };

  const handleCloseDrawer = () => {
    setIsViewDrawerOpen(false);
    setIsEditMode(false);
    setSelectedPatient(null);
  };

  const handleNewRegistration = () => {
    navigate("/patients/new-registration");
  };

  const handleRegisterNewVisit = (patient: Patient) => {
    navigate(`/patients/new-registration?patientId=${encodeURIComponent(patient.patientId)}`);
  };

  return (
    <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8">

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Patients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {showExistingPatients
              ? "Search existing patients and register a new visit without creating a duplicate patient."
              : "Manage patient registrations, details and history."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleNewRegistration}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <AddIcon fontSize="small" />
            New Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setShowExistingPatients((current) => !current);
              setSearch("");
              setCurrentPage(1);
              handleCloseDrawer();
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              showExistingPatients
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <PersonSearchOutlinedIcon fontSize="small" />
            {showExistingPatients ? "Back to Patient List" : "Existing Patients"}
          </button>
        </div>
      </div>

      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-4 sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <SearchIcon
                fontSize="small"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
                placeholder={showExistingPatients
                  ? "Search existing patients by name, phone or Patient ID..."
                  : "Search by name, phone, Patient ID or Registration ID..."}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">
                {filteredPatients.length}
              </span>{" "}
              {showExistingPatients ? "existing patients found" : "registrations found"}
            </div>

          </div>
        </div>

        <div className="w-full overflow-x-auto">

          <Table
            columns={columns}
            data={currentData}
            maxHeight="430px"
            renderRow={(patient: Patient) => (
              <>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-700">
                  {patient.patientId}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-blue-600">
                  {patient.registrationId}
                </td>

                <td className="whitespace-nowrap px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                      {patient.patientName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {patient.patientName}
                    </span>

                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {patient.age}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {patient.gender}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {patient.phone}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {patient.doctorReferral || "—"}
                </td>

                {/* TESTS */}

                <td className="whitespace-nowrap px-4 py-4">

                  <div className="flex items-center gap-1.5 whitespace-nowrap">

                    {patient.requiredTests?.length > 0 ? (
                      <>
                        {patient.requiredTests
                          .slice(0, 2)
                          .map((test, index) => (
                            <span
                              key={
                                typeof test ===
                                "string"
                                  ? `${test}-${index}`
                                  : test.testId || `${test.testCode}-${index}`
                              }
                              className="inline-flex max-w-[120px] truncate items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {typeof test ===
                              "string"
                                ? test
                                : test.testCode || test.testName}
                            </span>
                          ))}

                        {patient.requiredTests
                          .length > 2 && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            +{patient.requiredTests.length - 2}more...
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No tests
                      </span>
                    )}

                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {formatRegistrationDate(
                    patient.registrationDate
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-4">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      patient.status ===
                      "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : patient.status ===
                          "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : patient.status ===
                          "Completed"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {patient.status}
                  </span>

                </td>

                <td className="relative whitespace-nowrap px-4 py-4">

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      title="View"
                      onClick={() =>
                        handleView(patient)
                      }
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </button>

                    {!showExistingPatients && (
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => handleEdit(patient)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </button>
                    )}

                    <button
                      type="button"
                      title="History"
                      onClick={() => handleHistory(patient)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-purple-50 hover:text-purple-600"
                    >
                      <HistoryOutlinedIcon fontSize="small" />
                    </button>

                    {showExistingPatients ? (
                      <button
                        type="button"
                        title="Register new visit"
                        onClick={() => handleRegisterNewVisit(patient)}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        New Visit
                      </button>
                    ) : (
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setDeletingPatient(patient)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    )}

                  </div>
                </td>
              </>
            )}
          />

        </div>

        {filteredPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <SearchIcon className="text-slate-400" />
            </div>

            <h3 className="text-base font-semibold text-slate-700">
              {showExistingPatients ? "No existing patients found" : "No patient registrations found"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {showExistingPatients
                ? "Patients registered through this system will appear here. Try a different search, or register a new patient first."
                : "Register a new patient to begin. You can search by patient name, phone number or ID."}
            </p>

          </div>
        )}

        {filteredPatients.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">

            <Pagination
              totalItems={
                filteredPatients.length
              }
              rowsPerPage={rowsPerPage}
              setRowsPerPage={(value) => {
                setRowsPerPage(value);
                setCurrentPage(1);
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />

          </div>
        )}

      </div>

      {isViewDrawerOpen &&
        selectedPatient && (
          <>

            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
              onClick={handleCloseDrawer}
            />

            <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {isEditMode
                      ? "Edit Patient"
                      : "Patient Details"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-800">
                    {selectedPatient.patientName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedPatient.patientId}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Close"
                >
                  ✕
                </button>

              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div>

                  <h3 className="mb-4 text-sm font-semibold text-slate-800">
                    Patient Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-slate-400">
                        Patient ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedPatient.patientId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Registration ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedPatient.registrationId}
                      </p>
                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Patient Name
                      </p>

                      {isEditMode ? (
                        <input
                          type="text"
                          value={
                            selectedPatient.patientName
                          }
                          onChange={(e) =>
                            setSelectedPatient({
                              ...selectedPatient,
                              patientName:
                                e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {
                            selectedPatient.patientName
                          }
                        </p>
                      )}

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Age
                      </p>

                      {isEditMode ? (
                        <input
                          type="number"
                          value={
                            selectedPatient.age
                          }
                          onChange={(e) =>
                            setSelectedPatient({
                              ...selectedPatient,
                              age: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedPatient.age}
                        </p>
                      )}

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Gender
                      </p>

                      {isEditMode ? (
                        <select
                          value={
                            selectedPatient.gender
                          }
                          onChange={(e) =>
                            setSelectedPatient({
                              ...selectedPatient,
                              gender:
                                e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        >
                          <option value="Male">
                            Male
                          </option>

                          <option value="Female">
                            Female
                          </option>

                          <option value="Other">
                            Other
                          </option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {
                            selectedPatient.gender
                          }
                        </p>
                      )}

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Phone
                      </p>

                      {isEditMode ? (
                        <input
                          type="tel"
                          value={
                            selectedPatient.phone
                          }
                          onChange={(e) =>
                            setSelectedPatient({
                              ...selectedPatient,
                              phone: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedPatient.phone}
                        </p>
                      )}

                    </div>

                  </div>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div>

                  <h3 className="mb-4 text-sm font-semibold text-slate-800">
                    Referral Information
                  </h3>

                  <p className="text-xs text-slate-400">
                    Doctor / Referral
                  </p>

                  {isEditMode ? (
                    <input
                      type="text"
                      value={
                        selectedPatient.doctorReferral ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          doctorReferral:
                            e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="Enter doctor / referral"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPatient.doctorReferral ||
                        "Not provided"}
                    </p>
                  )}

                </div>

                <div className="my-6 border-t border-slate-100" />

                <div>

                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="text-sm font-semibold text-slate-800">
                      Required Tests
                    </h3>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {
                        selectedPatient
                          .requiredTests?.length || 0
                      }{" "}
                      test
                      {selectedPatient.requiredTests
                        ?.length !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  {selectedPatient.requiredTests?.length >
                  0 ? (
                    <div className="space-y-2">

                      {selectedPatient.requiredTests.map(
                        (test, index) => {
                          const isOldTest =
                            typeof test === "string";

                          const testName =
                            getTestDisplayName(test);

                          const price =
                            getTestPrice(test);

                          return (
                            <div
                              key={
                                isOldTest
                                  ? `${test}-${index}`
                                  : test.testId
                              }
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold text-slate-800">
                                    {testName}
                                  </p>

                                  {!isOldTest && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        test.category
                                      }{" "}
                                      •{" "}
                                      {
                                        test.sampleType
                                      }
                                    </p>
                                  )}

                                </div>

                                {price > 0 && (
                                  <span className="shrink-0 text-sm font-semibold text-slate-800">
                                    ₹
                                    {price.toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                )}

                              </div>

                              {!isOldTest && (
                                <div className="mt-2 flex flex-wrap gap-2">

                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                    Code:{" "}
                                    {
                                      test.testCode
                                    }
                                  </span>

                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                    Method:{" "}
                                    {test.method}
                                  </span>

                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                    TAT:{" "}
                                    {
                                      test.turnaroundTime
                                    }
                                  </span>

                                </div>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No tests assigned
                    </p>
                  )}

                  {selectedPatient.requiredTests?.length >
                    0 &&
                    getTotalTestAmount(
                      selectedPatient.requiredTests
                    ) > 0 && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">

                        <span className="text-sm font-medium text-blue-700">
                          Total Test Amount
                        </span>

                        <span className="text-lg font-bold text-blue-800">
                          ₹
                          {getTotalTestAmount(
                            selectedPatient.requiredTests
                          ).toLocaleString("en-IN")}
                        </span>

                      </div>
                    )}

                </div>

                <div className="my-6 border-t border-slate-100" />

                <div>

                  <h3 className="mb-4 text-sm font-semibold text-slate-800">
                    Registration Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-xs text-slate-400">
                        Registration Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatRegistrationDate(
                          selectedPatient.registrationDate
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Status
                      </p>

                      {isEditMode ? (
                        <select
                          value={
                            selectedPatient.status
                          }
                          onChange={(e) =>
                            setSelectedPatient({
                              ...selectedPatient,
                              status:
                                e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        >
                          <option value="Active">
                            Active
                          </option>

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Completed">
                            Completed
                          </option>
                        </select>
                      ) : (
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            selectedPatient.status ===
                            "Completed"
                              ? "bg-green-50 text-green-700"
                              : selectedPatient.status ===
                                "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {
                            selectedPatient.status
                          }
                        </span>
                      )}

                    </div>

                  </div>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div>

                  <h3 className="mb-4 text-sm font-semibold text-slate-800">
                    Address
                  </h3>

                  {isEditMode ? (
                    <textarea
                      value={
                        selectedPatient.address ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          address: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="Enter patient address"
                    />
                  ) : (
                    <p className="text-sm leading-6 text-slate-600">
                      {selectedPatient.address ||
                        "Not provided"}
                    </p>
                  )}

                </div>

              </div>

              {!isEditMode && (
  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
    <button
      type="button"
      onClick={() => {
        navigate(
          `/billing/new?patientId=${selectedPatient.patientId}`
        );
        handleCloseDrawer();
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
    >
      <PaymentsOutlinedIcon fontSize="small" />
      Move to Billing
    </button>
  </div>
)}

{isEditMode && (
  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleCloseDrawer}
        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleSavePatient}
        className="flex-1 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Save
      </button>
    </div>
  </div>
)}

            </div>
          </>
        )}

      {/* Delete Confirmation Drawer (Matching Screenshot 1 style) */}
      {deletingPatient && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setDeletingPatient(null)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col justify-between bg-white shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold text-lg">⚠️</span>
                  <h3 className="text-base font-bold text-slate-900">Delete Patient</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingPatient(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Yellow Warning Box */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
                  <strong className="block font-semibold">Are you sure you want to permanently delete this patient?</strong>
                  <p className="text-amber-800">
                    This patient record will be removed from the system. This action cannot be undone.
                  </p>
                </div>

                {/* Details Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patient Name</span>
                    <strong className="text-slate-800 text-sm">{deletingPatient.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patient ID</span>
                    <span className="font-mono font-medium text-slate-700">{deletingPatient.patientId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone & Gender</span>
                    <span className="text-slate-700">{deletingPatient.phone || "—"} • {deletingPatient.gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setDeletingPatient(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow transition hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (Top Right) */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default PatientList;
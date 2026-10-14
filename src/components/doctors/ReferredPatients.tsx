import {useMemo, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import type { Doctor, Referral, ReferralStatus } from "./Doctor";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";



type ReferredPatientsProps = {
  referrals: Referral[];
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor | null) => void;
  onUpdateReferrals: (referrals: Referral[]) => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctorId: string) => void;
};

const ALL_DOCTORS_SENTINEL: Doctor = {
  id: "ALL",
  doctorCode: "ALL",
  doctorName: "All Doctors",
  specialization: "",
  phone: "",
  email: "",
  address: "",
  referralType: "",
  commissionApplicable: false,
  notes: "",
  status: "Active",
  createdAt: "",
};

const FEMALE_DOCTOR_PORTRAIT =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=112&h=112&q=80";
const MALE_DOCTOR_PORTRAIT =
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=112&h=112&q=80";
const FEMALE_DOCTOR_NAMES = new Set(["meena", "priya"]);
const MALE_DOCTOR_NAMES = new Set(["arun", "suresh", "tamil"]);

const getDefaultDoctorPortrait = (doctorName: string) => {
  const firstName = doctorName.replace(/^dr\.?\s*/i, "").trim().split(/\s+/)[0]?.toLowerCase();
  if (FEMALE_DOCTOR_NAMES.has(firstName)) return FEMALE_DOCTOR_PORTRAIT;
  if (MALE_DOCTOR_NAMES.has(firstName)) return MALE_DOCTOR_PORTRAIT;
  return "";
};
const ReferredPatients = ({
  referrals,
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onUpdateReferrals,
  onEditDoctor,
  onDeleteDoctor,
}: ReferredPatientsProps) => {


  const activeDoctor = selectedDoctor ?? ALL_DOCTORS_SENTINEL;

  // State for Referred Patients Table view
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>(
    selectedDoctor ? (activeDoctor.id === "ALL" ? "All" : activeDoctor.id) : "All"
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  const filteredReferrals = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return referrals.filter((referral) => {
      const matchesSearch =
        !search ||
        referral.id.toLowerCase().includes(search) ||
        referral.patientId.toLowerCase().includes(search) ||
        referral.patientName.toLowerCase().includes(search) ||
        referral.doctorName.toLowerCase().includes(search) ||
        referral.tests.some((test) =>
          test.toLowerCase().includes(search)
        );

      const matchesSelectedDoctor =
        !selectedDoctor ||
        activeDoctor.id === "ALL" ||
        referral.doctorId === activeDoctor.id;

      const matchesDoctor =
        doctorFilter === "All" ||
        referral.doctorId === doctorFilter;

      const matchesStatus =
        statusFilter === "All" ||
        referral.status === statusFilter;

      return (
        matchesSelectedDoctor &&
        matchesSearch &&
        matchesDoctor &&
        matchesStatus
      );
    });
  }, [
    referrals,
    searchTerm,
    doctorFilter,
    statusFilter,
    selectedDoctor,
  ]);

  const totalPages = Math.ceil(
    filteredReferrals.length / rowsPerPage
  );

  const safeCurrentPage =
    totalPages > 0 && currentPage > totalPages
      ? totalPages
      : currentPage;

  const startIndex = (safeCurrentPage - 1) * rowsPerPage;

  const currentReferrals = filteredReferrals.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDoctorChange = (value: string) => {
    setDoctorFilter(value);
    setCurrentPage(1);
    if (value === "All") {
      onSelectDoctor?.(ALL_DOCTORS_SENTINEL);
    } else {
      const found = doctors.find((doc) => doc.id === value);
      if (found) {
        onSelectDoctor?.(found);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getStatusClass = (status: ReferralStatus) => {
    switch (status) {
      case "Registered":
        return "bg-blue-50 text-blue-700";
      case "Sample Collected":
        return "bg-amber-50 text-amber-700";
      case "Processing":
        return "bg-purple-50 text-purple-700";
      case "Completed":
        return "bg-emerald-50 text-emerald-700";
      case "Cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const handleStatusUpdate = (
    referralId: string,
    status: ReferralStatus
  ) => {
    const updatedReferrals = referrals.map((referral) =>
      referral.id === referralId
        ? {
            ...referral,
            status,
          }
        : referral
    );

    onUpdateReferrals(updatedReferrals);

    const updatedReferral = updatedReferrals.find(
      (referral) => referral.id === referralId
    );

    if (updatedReferral) {
      setSelectedReferral(updatedReferral);
    }
  };

  const columns = [
    "Referral ID",
    "Patient ID",
    "Patient Name",
    "Doctor",
    "Referral Date",
    "Tests",
    "Status",
    "Actions",
  ];

  return (
    <>


      {/* =========================================================================
          VIEW 2: REFERRED PATIENTS TABLE (Shown when doctor is selected)
          ========================================================================= */}
      {!selectedDoctor && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Referred Patients</h2>
            <p className="mt-1 text-sm text-slate-500">Select a doctor to view their referred patients.</p>
          </div>
          {doctors.filter((doctor) => doctor.status === "Active").length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {doctors.filter((doctor) => doctor.status === "Active").map((doctor) => {
                const doctorReferrals = referrals.filter((referral) => referral.doctorId === doctor.id);
                const patientCount = doctorReferrals.length;
                const referredAmount = doctorReferrals.reduce(
                  (total, referral) => total + Number(referral.billAmount || 0),
                  0
                );
                const initials = doctor.doctorName
                  .replace("Dr. ", "")
                  .replace("Dr ", "")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase();

                return (
                  <article key={doctor.id} className="group relative min-h-[220px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                    <button type="button" onClick={() => onSelectDoctor(doctor)} aria-label={`View referred patients for ${doctor.doctorName}`} className="flex min-h-[178px] w-full flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                    <span className="flex min-w-0 items-start gap-4">
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-100">
                        <img
                          src={doctor.photoUrl || getDefaultDoctorPortrait(doctor.doctorName)}
                          alt={`Portrait of ${doctor.doctorName}`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.classList.add("hidden");
                            const fallback = event.currentTarget.nextElementSibling;
                            fallback?.classList.remove("hidden");
                            fallback?.classList.add("flex");
                          }}
                        />
                        <span className="absolute inset-0 hidden items-center justify-center text-lg font-bold text-blue-700">{initials || "DR"}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold text-slate-900">{doctor.doctorName}</span>
                        <span className="mt-1 block truncate text-sm font-medium text-blue-700">{doctor.specialization || "Specialty not specified"}</span>
                        <span className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          <LocalHospitalOutlinedIcon sx={{ fontSize: 15 }} />
                          <span className="truncate">{doctor.hospitalClinic || doctor.address || "Clinic not specified"}</span>
                        </span>
                        <span className="mt-1 block truncate font-mono text-[11px] text-slate-500">{doctor.doctorCode || doctor.id}{doctor.phone ? ` · ${doctor.phone}` : ""}</span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700">
                        <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                      </span>
                    </span>

                    <span className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                      <span className="rounded-lg bg-slate-50 px-2 py-2">
                        <span className="block text-[10px] font-medium uppercase text-slate-500">Patients</span>
                        <span className="mt-1 block text-sm font-bold text-slate-900">{patientCount}</span>
                      </span>
                      <span className="rounded-lg bg-slate-50 px-2 py-2">
                        <span className="block text-[10px] font-medium uppercase text-slate-500">Referred Billing</span>
                        <span className="mt-1 block truncate text-sm font-bold text-emerald-700">₹{referredAmount.toLocaleString("en-IN")}</span>
                      </span>
                      <span className="rounded-lg bg-slate-50 px-2 py-2">
                        <span className="block text-[10px] font-medium uppercase text-slate-500">Rating</span>
                        <span className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-amber-600"><StarOutlinedIcon sx={{ fontSize: 15 }} />{typeof doctor.rating === "number" ? doctor.rating.toFixed(1) : "Not rated"}</span>
                      </span>
                    </span>
                    </button>
                    <div className="absolute right-4 top-4 flex gap-2">
                      <button type="button" title="Edit doctor" aria-label={`Edit ${doctor.doctorName}`} onClick={() => onEditDoctor(doctor)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><EditOutlinedIcon sx={{ fontSize: 17 }} /></button>
                      <button type="button" title="Delete doctor" aria-label={`Delete ${doctor.doctorName}`} onClick={() => { if (window.confirm(`Delete ${doctor.doctorName}?`)) onDeleteDoctor(doctor.id); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No active doctors found.</div>
          )}
        </section>
      )}

      {selectedDoctor && (
        <div className="space-y-4">
          {/* Top Banner: Selected Doctor Ribbon & Back Navigation */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectDoctor?.(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-blue-600"
                  title="Back to Doctor Cards"
                >
                  <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
                  <span>Back to Doctors</span>
                </button>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/20">
                    {activeDoctor.doctorName?.replace("Dr. ", "").charAt(0).toUpperCase() || "D"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-800">
                        {activeDoctor.doctorName}
                      </h2>
                      <span className="rounded-lg bg-blue-100 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                        {activeDoctor.doctorCode || activeDoctor.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {activeDoctor.specialization}
                      {activeDoctor.address ? ` • ${activeDoctor.address}` : ""}
                      {activeDoctor.phone ? ` • ${activeDoctor.phone}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-xl bg-blue-100 px-3.5 py-1.5 text-xs font-bold text-blue-800 border border-blue-200">
                  {filteredReferrals.length} {filteredReferrals.length === 1 ? "Patient" : "Patients"} Referred
                </span>
                <button
                  type="button"
                  onClick={() => onSelectDoctor?.(null)}
                  className="rounded-xl border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition shadow-2xs"
                >
                  Change Doctor
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Referred Patients
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeDoctor.id === "ALL"
                    ? "Viewing patients referred across all doctors and clinics."
                    : `Viewing patients referred by ${activeDoctor.doctorName}.`}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {/* Search */}
                <div className="relative xl:col-span-2">
                  <SearchOutlinedIcon
                    fontSize="small"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder="Search patient, referral, doctor or test..."
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Doctor Dropdown Filter / Switcher */}
                <select
                  value={doctorFilter}
                  onChange={(event) =>
                    handleDoctorChange(event.target.value)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Doctors</option>
                  {doctors
                    .filter((doc) => doc.status === "Active")
                    .map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.doctorName}
                      </option>
                    ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusChange(event.target.value)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Status</option>
                  <option value="Registered">Registered</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  data={currentReferrals}
                  maxHeight="400px"
                  renderRow={(referral: Referral) => (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-600">
                        {referral.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">
                        {referral.patientId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">
                          {referral.patientName}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-slate-700">
                          {referral.doctorName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {referral.doctorId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {referral.referralDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-[220px] flex-wrap gap-1">
                          {referral.tests.map((test) => (
                            <span
                              key={test}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                            >
                              {test}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            referral.status
                          )}`}
                        >
                          {referral.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedReferral(referral)}
                          title="View Referral"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </button>
                      </td>
                    </>
                  )}
                />
              </div>

              {/* Empty State */}
              {currentReferrals.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <LocalHospitalOutlinedIcon />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    No referred patients found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activeDoctor.id !== "ALL"
                      ? `No patient referral records found for ${activeDoctor.doctorName}.`
                      : "Try changing your search or filters."}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectDoctor?.(null)}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    Back to Doctor Cards
                  </button>
                </div>
              )}

              {/* Pagination */}
              {filteredReferrals.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <Pagination
                    totalItems={filteredReferrals.length}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={(value) => {
                      setRowsPerPage(value);
                      setCurrentPage(1);
                    }}
                    currentPage={safeCurrentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER: Referral Details & Status Update
          ========================================================================= */}
      {selectedReferral && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setSelectedReferral(null)}
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Referral Details
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedReferral.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseOutlinedIcon />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="space-y-6 p-5">
              {/* Patient */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Patient
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                  {selectedReferral.patientName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReferral.patientId}
                </p>
              </div>

              {/* Referral Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Referral Information
                </h3>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <div className="flex justify-between gap-4 p-4">
                    <span className="text-sm text-slate-500">
                      Referral ID
                    </span>
                    <span className="text-right text-sm font-medium text-slate-700">
                      {selectedReferral.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 p-4">
                    <span className="text-sm text-slate-500">
                      Doctor
                    </span>
                    <span className="text-right text-sm font-medium text-slate-700">
                      {selectedReferral.doctorName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 p-4">
                    <span className="text-sm text-slate-500">
                      Referral Date
                    </span>
                    <span className="text-right text-sm font-medium text-slate-700">
                      {selectedReferral.referralDate}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 p-4">
                    <span className="text-sm text-slate-500">
                      Bill Amount
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-800">
                      ₹{selectedReferral.billAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tests */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Requested Tests
                </h3>
                <div className="space-y-2">
                  {selectedReferral.tests.map((test) => (
                    <div
                      key={test}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {test}
                      </span>
                      <span className="text-xs text-slate-400">
                        Test
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Status */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Workflow Status
                </h3>
                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Registration
                    </span>
                    <span className="text-sm font-medium text-emerald-600">
                      Completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Sample
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {selectedReferral.sampleStatus || "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Report
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {selectedReferral.reportStatus || "Pending"}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Overall Status
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          selectedReferral.status
                        )}`}
                      >
                        {selectedReferral.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Update Referral Status
                </h3>
                <select
                  value={selectedReferral.status}
                  onChange={(event) =>
                    handleStatusUpdate(
                      selectedReferral.id,
                      event.target.value as ReferralStatus
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Registered">Registered</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default ReferredPatients;

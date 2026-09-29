import { useMemo, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import type { Doctor,Referral, ReferralStatus, } from "./Doctor";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type ReferredPatientsProps = {
  referrals: Referral[];
  doctors: Doctor[];
  onUpdateReferrals: (
    referrals: Referral[]
  ) => void;
};

const ReferredPatients = ({
  referrals,
  doctors,
  onUpdateReferrals,
}: ReferredPatientsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredReferrals = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return referrals.filter((referral) => {
      const matchesSearch =
        !search ||
        referral.id
          .toLowerCase()
          .includes(search) ||
        referral.patientId
          .toLowerCase()
          .includes(search) ||
        referral.patientName
          .toLowerCase()
          .includes(search) ||
        referral.doctorName
          .toLowerCase()
          .includes(search) ||
        referral.tests.some((test) =>
          test.toLowerCase().includes(search)
        );

      const matchesDoctor =
        doctorFilter === "All" ||
        referral.doctorId === doctorFilter;

      const matchesStatus =
        statusFilter === "All" ||
        referral.status === statusFilter;

      return (
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
  ]);

  const totalPages = Math.ceil(
    filteredReferrals.length /
      rowsPerPage
  );

  const safeCurrentPage =
    totalPages > 0 &&
    currentPage > totalPages
      ? totalPages
      : currentPage;

  const startIndex =
    (safeCurrentPage - 1) *
    rowsPerPage;

  const currentReferrals =
    filteredReferrals.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  const handleSearchChange = (
    value: string
  ) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDoctorChange = (
    value: string
  ) => {
    setDoctorFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (
    value: string
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getStatusClass = (
    status: ReferralStatus
  ) => {
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
    const updatedReferrals =
      referrals.map((referral) =>
        referral.id === referralId
          ? {
              ...referral,
              status,
            }
          : referral
      );

    onUpdateReferrals(updatedReferrals);

    const updatedReferral =
      updatedReferrals.find(
        (referral) =>
          referral.id === referralId
      );

    if (updatedReferral) {
      setSelectedReferral(
        updatedReferral
      );
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Referred Patients
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and track patients referred by
              doctors and clinics.
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
                  handleSearchChange(
                    event.target.value
                  )
                }
                placeholder="Search patient, referral, doctor or test..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Doctor */}
            <select
              value={doctorFilter}
              onChange={(event) =>
                handleDoctorChange(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Doctors
              </option>

              {doctors
                .filter(
                  (doctor) =>
                    doctor.status ===
                    "Active"
                )
                .map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.doctorName}
                  </option>
                ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Status
              </option>

              <option value="Registered">
                Registered
              </option>

              <option value="Sample Collected">
                Sample Collected
              </option>

              <option value="Processing">
                Processing
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
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
                      {referral.tests.map(
                        (test) => (
                          <span
                            key={test}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                          >
                            {test}
                          </span>
                        )
                      )}
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
                      onClick={() =>
                        setSelectedReferral(
                          referral
                        )
                      }
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
              <p className="text-sm font-medium text-slate-600">
                No referred patients found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or
                filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredReferrals.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Pagination
                totalItems={
                  filteredReferrals.length
                }
                rowsPerPage={rowsPerPage}
                setRowsPerPage={(value) => {
                  setRowsPerPage(value);
                  setCurrentPage(1);
                }}
                currentPage={safeCurrentPage}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}
        </div>
      </div>

      {selectedReferral && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() =>
              setSelectedReferral(null)
            }
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
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
                onClick={() =>
                  setSelectedReferral(
                    null
                  )
                }
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
                      ₹
                      {selectedReferral.billAmount.toLocaleString(
                        "en-IN"
                      )}
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
                  {selectedReferral.tests.map(
                    (test) => (
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
                    )
                  )}
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
                      {selectedReferral.sampleStatus ||
                        "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Report
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                      {selectedReferral.reportStatus ||
                        "Pending"}
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
                      event.target
                        .value as ReferralStatus
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Registered">
                    Registered
                  </option>

                  <option value="Sample Collected">
                    Sample Collected
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
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
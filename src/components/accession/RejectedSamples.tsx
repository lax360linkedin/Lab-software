import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

interface StoredSample {
  id: string;
  sampleId: string;
  accessionNumber: string;
  barcode: string;

  patientId: string;
  registrationId: string;
  patientName: string;

  testId: string;
  testName: string;
  sampleType: string;

  collectionDate: string;
  collectionTime: string;
  collector: string;

  status:
  | "Pending Collection"
  | "Collected"
  | "Received"
  | "Accepted"
  | "Rejected";

  source: "Patient Registration";
  createdAt: string;

  receivedDate?: string;
  receivedTime?: string;
  receivedBy?: string;

  acceptedDate?: string;
  acceptedTime?: string;
  acceptedBy?: string;

  rejectionReason?: string;
  rejectedDate?: string;
  rejectedTime?: string;
  rejectedBy?: string;
}

const SAMPLE_STORAGE_KEY = "lab_samples";

const statusStyles: Record<string, string> = {
  Rejected: "bg-red-50 text-red-700 border border-red-200",
};

const sampleTypeStyles: Record<string, string> = {
  Blood: "bg-red-50 text-red-600",
  Urine: "bg-yellow-50 text-yellow-700",
  Swab: "bg-purple-50 text-purple-700",
  Serum: "bg-orange-50 text-orange-700",
  Plasma: "bg-blue-50 text-blue-700",
  Stool: "bg-amber-50 text-amber-700",
};

const RejectedSamples = () => {
  console.log("🔥 ACTUAL REJECTED COMPONENT");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedSample, setSelectedSample] =
    useState<StoredSample | null>(null);

  const [showDrawer, setShowDrawer] = useState(false);

  const [showBarcode, setShowBarcode] = useState(false);

  const loadSamples = (): StoredSample[] => {
    try {
      const storedSamples = localStorage.getItem(SAMPLE_STORAGE_KEY);

      if (!storedSamples) {
        return [];
      }

      const parsedSamples = JSON.parse(storedSamples);

      return Array.isArray(parsedSamples) ? parsedSamples : [];
    } catch (error) {
      console.error("Failed to load samples:", error);
      return [];
    }
  };

  const rejectedSamples = useMemo(() => {
    return loadSamples().filter(
      (sample: StoredSample) => sample.status === "Rejected"
    );
  }, []);

  const rejectionReasons = useMemo(() => {
    const reasons = rejectedSamples
      .map((sample) => sample.rejectionReason)
      .filter((reason): reason is string => Boolean(reason));

    return Array.from(new Set(reasons));
  }, [rejectedSamples]);

  const filteredData = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return rejectedSamples.filter((sample) => {
      const matchesSearch =
        !searchValue ||
        sample.patientName.toLowerCase().includes(searchValue) ||
        sample.patientId.toLowerCase().includes(searchValue) ||
        sample.accessionNumber.toLowerCase().includes(searchValue) ||
        sample.sampleId.toLowerCase().includes(searchValue) ||
        sample.testName.toLowerCase().includes(searchValue) ||
        sample.barcode.toLowerCase().includes(searchValue) ||
        (sample.rejectionReason || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesReason =
        reasonFilter === "All" ||
        sample.rejectionReason === reasonFilter;

      return matchesSearch && matchesReason;
    });
  }, [rejectedSamples, search, reasonFilter]);

  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalRejected = rejectedSamples.length;

  const reasonCount = new Set(
    rejectedSamples
      .map((sample) => sample.rejectionReason)
      .filter(Boolean)
  ).size;

  const todayRejectedCount = useMemo(() => {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return rejectedSamples.filter(
      (sample) => sample.rejectedDate === today
    ).length;
  }, [rejectedSamples]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleReasonChange = (value: string) => {
    setReasonFilter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setReasonFilter("All");
    setCurrentPage(1);
  };

  const openViewDrawer = (sample: StoredSample) => {
    setSelectedSample(sample);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedSample(null);
  };

  const openBarcode = (sample: StoredSample) => {
    setSelectedSample(sample);
    setShowBarcode(true);
  };

  const closeBarcode = () => {
    setShowBarcode(false);
    setSelectedSample(null);
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
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

  const columns = [
    "Accession",
    "Patient",
    "Test",
    "Sample",
    "Rejected",
    "Rejected By",
    "Reason",
    "Status",
    "Actions",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Rejected Samples
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review rejected samples and manage recollection requirements
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Rejected */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Rejected
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {totalRejected}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                All rejected samples
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CancelOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Today's Rejected */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Today's Rejections
              </p>

              <h2 className="mt-2 text-2xl font-bold text-red-600">
                {todayRejectedCount}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Rejected today
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ScienceOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Recollection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Recollection
              </p>

              <h2 className="mt-2 text-2xl font-bold text-orange-600">
                {totalRejected}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Review for new sample
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <RefreshOutlinedIcon />
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Rejection Reasons
              </p>

              <h2 className="mt-2 text-2xl font-bold text-purple-600">
                {reasonCount}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Different reasons recorded
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FilterListIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fontSize="small"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search patient, accession, test or reason..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filters */}
            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-56">
                <FilterListIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  fontSize="small"
                />

                <select
                  value={reasonFilter}
                  onChange={(e) =>
                    handleReasonChange(e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Reasons</option>

                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleReset}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-3 sm:p-5">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={currentData}
              maxHeight="500px"
              renderRow={(sample: StoredSample) => (
                <>
                  {/* Accession */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="whitespace-nowrap text-sm font-semibold text-blue-600">
                        {sample.accessionNumber}
                      </p>

                      <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                        {sample.sampleId}
                      </p>
                    </div>
                  </td>

                  {/* Patient */}
                  <td className="px-4 py-4">
                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <PersonIcon fontSize="small" />
                      </div>

                      <div>
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                          {sample.patientName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {sample.patientId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Test */}
                  <td className="px-4 py-4">
                    <p className="min-w-[170px] text-sm font-medium text-slate-700">
                      {sample.testName}
                    </p>
                  </td>

                  {/* Sample */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${sampleTypeStyles[sample.sampleType] ||
                        "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {sample.sampleType}
                    </span>
                  </td>

                  {/* Rejected */}
                  <td className="px-4 py-4">
                    <div className="min-w-[145px]">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarTodayOutlinedIcon
                          sx={{ fontSize: 15 }}
                          className="text-slate-400"
                        />

                        {formatDate(sample.rejectedDate)}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <AccessTimeIcon sx={{ fontSize: 15 }} />

                        {sample.rejectedTime || "-"}
                      </div>
                    </div>
                  </td>

                  {/* Rejected By */}
                  <td className="px-4 py-4">
                    <p className="whitespace-nowrap text-sm text-slate-600">
                      {sample.rejectedBy || "-"}
                    </p>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-4">
                    <span className="inline-flex min-w-[150px] whitespace-nowrap rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                      {sample.rejectionReason || "Not specified"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[sample.status]
                        }`}
                    >
                      {sample.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {/* View */}
                      <button
                        title="View Sample"
                        onClick={() => openViewDrawer(sample)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </button>

                      {/* Barcode */}
                      <button
                        title="Sample Barcode"
                        onClick={() => openBarcode(sample)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                      >
                        <QrCode2Icon fontSize="small" />
                      </button>

                      {/* Recollection */}
                      <button
                        title="Request Recollection"
                        onClick={() => openViewDrawer(sample)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-orange-600 transition hover:bg-orange-100"
                      >
                        <RefreshOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            />
          </div>

          {/* Empty State */}
          {currentData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CancelOutlinedIcon />
              </div>

              <h3 className="text-sm font-semibold text-slate-700">
                No rejected samples found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Pagination
                totalItems={filteredData.length}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Drawer */}
      {showDrawer && selectedSample && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Rejected Sample Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSample.accessionNumber}
                </p>
              </div>

              <button
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="space-y-5 p-5">
              {/* Status */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-500">
                      Sample Status
                    </p>

                    <p className="mt-1 text-base font-bold text-red-700">
                      Rejected
                    </p>
                  </div>

                  <CancelOutlinedIcon className="text-red-600" />
                </div>
              </div>

              {/* Patient */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Patient Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Patient Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.patientName}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Patient ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.patientId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Registration ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.registrationId || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Test
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.testName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Information */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Sample Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Sample ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.sampleId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Accession Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {selectedSample.accessionNumber}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Sample Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.sampleType}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Barcode
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedSample.barcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collection */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Collection Details
                </h3>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Collection Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(selectedSample.collectionDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Collection Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedSample.collectionTime || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Collected By
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedSample.collector || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Source
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedSample.source}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Receipt Details
                </h3>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Received Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(selectedSample.receivedDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Received Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedSample.receivedTime || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Received By
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedSample.receivedBy || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Rejection Details
                </h3>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-red-500">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm font-bold text-red-700">
                        {selectedSample.rejectionReason ||
                          "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-red-500">
                        Rejected By
                      </p>

                      <p className="mt-1 text-sm font-medium text-red-700">
                        {selectedSample.rejectedBy || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-red-500">
                        Rejected Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-red-700">
                        {formatDate(selectedSample.rejectedDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-red-500">
                        Rejected Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-red-700">
                        {selectedSample.rejectedTime || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recollection */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex gap-3">
                  <RefreshOutlinedIcon className="mt-0.5 text-orange-600" />

                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Recollection Required
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      This sample was rejected. A new sample should be
                      collected according to the rejection reason before
                      continuing the testing workflow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Barcode Button */}
              <button
                onClick={() => {
                  closeDrawer();
                  setTimeout(() => {
                    openBarcode(selectedSample);
                  }, 0);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <QrCode2Icon fontSize="small" />
                View Sample Barcode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {showBarcode && selectedSample && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Sample Barcode
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSample.accessionNumber}
                </p>
              </div>

              <button
                onClick={closeBarcode}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Barcode Content */}
            <div className="p-6 text-center">
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                <QrCode2Icon
                  sx={{
                    fontSize: 130,
                  }}
                  className="text-slate-700"
                />
              </div>

              <p className="mt-5 text-lg font-bold tracking-wider text-slate-800">
                {selectedSample.barcode}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSample.patientName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {selectedSample.testName}
              </p>

              <div className="mt-5 rounded-xl bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">
                  Sample Status: Rejected
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {selectedSample.rejectionReason ||
                    "Rejection reason not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedSamples;
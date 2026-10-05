import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

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
        | "Processing"
        | "Completed"
        | "Rejected";
    source: "Patient Registration";
    createdAt: string;
    receivedDate?: string;
    receivedTime?: string;
    receivedBy?: string;
    acceptedDate?: string;
    acceptedTime?: string;
    acceptedBy?: string;
    rejectedDate?: string;
    rejectedTime?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    processingDate?: string;
    processingTime?: string;
    processingBy?: string;
    completedDate?: string;
    completedTime?: string;
    completedBy?: string;
    analyzer?: string;
    method?: string;
    priority?: "Normal" | "Urgent" | "STAT";
    resultStatus?: "Pending" | "Entered" | "QC Pending" | "QC Passed" | "Verified";
}

interface LabTest {
    id?: string;
    code?: string;
    name?: string;
    category?: string;
    sampleType?: string;
    method?: string;
    parameters?: string[];
}

interface ResultParameter {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
}

const ResultEntry = () => {
    const navigate = useNavigate();
    const { sampleId } = useParams<{ sampleId: string }>();
    const [samples, setSamples] = useState<StoredSample[]>(() => {
        try {
            const stored = localStorage.getItem("lab_samples");

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [testMasterData] = useState<LabTest[]>(() => {
        try {
            const stored = localStorage.getItem("lab_tests");

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const selectedSample = useMemo(() => {
        return samples.find(
            (sample) =>
                sample.sampleId === sampleId || sample.id === sampleId
        );
    }, [samples, sampleId]);

    const masterTest = useMemo(() => {
        if (!selectedSample) {
            return undefined;
        }

        return testMasterData.find(
            (test) =>
                test.id === selectedSample.testId ||
                test.code === selectedSample.testId ||
                test.name === selectedSample.testName
        );
    }, [selectedSample, testMasterData]);

    const defaultParameters = useMemo<ResultParameter[]>(() => {
        if (!masterTest?.parameters) {
            return [];
        }

        return masterTest.parameters.map((parameter) => ({
            name: parameter,
            value: "",
            unit: "",
            referenceRange: "",
        }));
    }, [masterTest]);

    const [parameters, setParameters] =
        useState<ResultParameter[]>(defaultParameters);

    const [remarks, setRemarks] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const updateParameter = (
        index: number,
        field: keyof ResultParameter,
        value: string
    ) => {
        setParameters((previous) =>
            previous.map((parameter, parameterIndex) =>
                parameterIndex === index
                    ? {
                          ...parameter,
                          [field]: value,
                      }
                    : parameter
            )
        );
    };

    const addParameter = () => {
        setParameters((previous) => [
            ...previous,
            {
                name: "",
                value: "",
                unit: "",
                referenceRange: "",
            },
        ]);
    };

    const removeParameter = (index: number) => {
        setParameters((previous) =>
            previous.filter(
                (_, parameterIndex) => parameterIndex !== index
            )
        );
    };

    const handleSaveResult = () => {
        if (!selectedSample) {
            return;
        }

        const hasEmptyParameter = parameters.some(
            (parameter) =>
                !parameter.name.trim() || !parameter.value.trim()
        );

        if (hasEmptyParameter) {
            alert("Please enter the parameter name and result value.");
            return;
        }

        const resultDate = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const resultTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        let enteredBy = "Laboratory Technician";

        try {
            const user = JSON.parse(
                localStorage.getItem("lab_user") || "null"
            );

            enteredBy =
                user?.name ||
                user?.fullName ||
                user?.username ||
                "Laboratory Technician";
        } catch {
            // Use default technician name
        }

        const updatedSamples = samples.map((sample) =>
            sample.id === selectedSample.id ||
            sample.sampleId === selectedSample.sampleId
                ? {
                      ...sample,
                      resultStatus: "QC Pending" as const,
                      resultParameters: parameters,
                      resultRemarks: remarks,
                      resultEnteredDate: resultDate,
                      resultEnteredTime: resultTime,
                      resultEnteredBy: enteredBy,
                  }
                : sample
        );

        localStorage.setItem(
            "lab_samples",
            JSON.stringify(updatedSamples)
        );

        setSamples(updatedSamples);
        setShowSuccess(true);
    };

    if (!selectedSample) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/results/pending")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>

                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Result Entry
                            </h1>

                            <p className="text-sm text-slate-500">
                                Sample not found
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-[400px] items-center justify-center p-6">
                    <div className="text-center">
                        <ScienceOutlinedIcon className="text-5xl text-slate-300" />

                        <h2 className="mt-4 text-lg font-semibold text-slate-700">
                            Sample Not Found
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            The selected sample could not be found.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/results/pending")}
                            className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Back to Pending Results
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/results/pending")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <ScienceOutlinedIcon className="text-blue-600" />

                                <h1 className="text-xl font-semibold text-slate-800">
                                    Result Entry
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter laboratory test results for the completed
                                sample
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />

                        <span className="text-sm font-medium text-amber-700">
                            Result Entry
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {/* Patient / Sample Information */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-2">
                            <PersonIcon className="text-blue-600" />

                            <h2 className="text-base font-semibold text-slate-800">
                                Patient & Sample Information
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Patient
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                                <PersonIcon
                                    fontSize="small"
                                    className="text-slate-400"
                                />

                                <p className="text-sm font-semibold text-slate-700">
                                    {selectedSample.patientName}
                                </p>
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                                {selectedSample.patientId}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Sample ID
                            </p>

                            <p className="mt-1 text-sm font-semibold text-blue-600">
                                {selectedSample.sampleId}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Barcode: {selectedSample.barcode || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Accession
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {selectedSample.accessionNumber}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                {selectedSample.registrationId}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Test
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {selectedSample.testName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                {selectedSample.sampleType}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Analysis Information */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-2">
                            <AssignmentOutlinedIcon className="text-blue-600" />

                            <h2 className="text-base font-semibold text-slate-800">
                                Analysis Information
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Analyzer
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                {selectedSample.analyzer || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Method
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                {selectedSample.method ||
                                    masterTest?.method ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Completed Date
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                                <AccessTimeIcon
                                    fontSize="small"
                                    className="text-slate-400"
                                />

                                <p className="text-sm font-medium text-slate-700">
                                    {selectedSample.completedDate || "-"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Completed By
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                {selectedSample.completedBy ||
                                    "Laboratory Technician"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Result Entry */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Test Result
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter the measured value for each test
                                parameter.
                            </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                            {selectedSample.testName}
                        </span>
                    </div>

                    <div className="p-4 sm:p-5">
                        {parameters.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Parameter
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Result
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Unit
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Reference Range
                                            </th>

                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {parameters.map(
                                            (parameter, index) => (
                                                <tr
                                                    key={`${parameter.name}-${index}`}
                                                    className="border-b border-slate-100 last:border-b-0"
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={
                                                                parameter.name
                                                            }
                                                            onChange={(e) =>
                                                                updateParameter(
                                                                    index,
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Parameter"
                                                            className="w-full min-w-[160px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={
                                                                parameter.value
                                                            }
                                                            onChange={(e) =>
                                                                updateParameter(
                                                                    index,
                                                                    "value",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Enter result"
                                                            className="w-full min-w-[150px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={
                                                                parameter.unit
                                                            }
                                                            onChange={(e) =>
                                                                updateParameter(
                                                                    index,
                                                                    "unit",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Unit"
                                                            className="w-full min-w-[100px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={
                                                                parameter.referenceRange
                                                            }
                                                            onChange={(e) =>
                                                                updateParameter(
                                                                    index,
                                                                    "referenceRange",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Reference range"
                                                            className="w-full min-w-[150px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeParameter(
                                                                    index
                                                                )
                                                            }
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                                <ScienceOutlinedIcon className="text-4xl text-slate-300" />

                                <p className="mt-3 text-sm font-medium text-slate-600">
                                    No test parameters configured
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Add parameters manually or configure them
                                    in the Tests master data.
                                </p>
                            </div>
                        )}

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={addParameter}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                                + Add Parameter
                            </button>
                        </div>

                        {/* Remarks */}
                        <div className="mt-6">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Remarks / Comments
                            </label>

                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={4}
                                placeholder="Enter any relevant laboratory observations or remarks..."
                                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5">
                        <button
                            type="button"
                            onClick={() => navigate("/results/pending")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveResult}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            <SaveOutlinedIcon fontSize="small" />
                            Save Result
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                                <CheckCircleOutlinedIcon className="text-3xl text-green-600" />
                            </div>

                            <h2 className="mt-4 text-lg font-semibold text-slate-800">
                                Result Saved Successfully
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                The result has been saved and is now waiting
                                for Quality Control.
                            </p>

                            <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-left">
                                <p className="text-xs font-semibold text-amber-700">
                                    Next Step
                                </p>

                                <p className="mt-1 text-sm text-amber-700">
                                    The result will move to QC before it can be
                                    verified.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/results/pending")
                                    }
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Back to Results
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/qc/pending")}
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Go to QC
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultEntry;
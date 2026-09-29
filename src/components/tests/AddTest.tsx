import { useState } from "react";
import type {
    LabTest,
    TestCategory,
    TestParameter,
} from "./Tests";

type AddTestProps = {
    categories: TestCategory[];
    editingTest: LabTest | null;
    onSave: (test: LabTest) => void;
    onCancel: () => void;
};

const createEmptyParameter = (): TestParameter => ({
    name: "",
    unit: "",
    referenceRange: "",
});

const getInitialFormData = (test: LabTest | null) => {
    if (!test) {
        return {
            testName: "",
            testCode: "",
            category: "",
            sampleType: "",
            method: "",
            price: "",
            turnaroundTime: "",
            parameters: [createEmptyParameter()],
        };
    }

    return {
        testName: test.testName,
        testCode: test.testCode,
        category: test.category,
        sampleType: test.sampleType,
        method: test.method,
        price: String(test.price),
        turnaroundTime: test.turnaroundTime,
        parameters:
            test.parameters.length > 0
                ? test.parameters
                : [createEmptyParameter()],
    };
};

const AddTest = ({
    categories,
    editingTest,
    onSave,
    onCancel,
}: AddTestProps) => {
    const initialForm = getInitialFormData(editingTest);

    const [testName, setTestName] = useState(initialForm.testName);
    const [testCode, setTestCode] = useState(initialForm.testCode);
    const [category, setCategory] = useState(initialForm.category);
    const [sampleType, setSampleType] = useState(initialForm.sampleType);
    const [method, setMethod] = useState(initialForm.method);
    const [price, setPrice] = useState(initialForm.price);
    const [turnaroundTime, setTurnaroundTime] = useState(
        initialForm.turnaroundTime
    );
    const [parameters, setParameters] = useState<TestParameter[]>(
        initialForm.parameters
    );

    const isEditing = Boolean(editingTest);

    const handleAddParameter = () => {
        setParameters([
            ...parameters,
            createEmptyParameter(),
        ]);
    };

    const handleRemoveParameter = (index: number) => {
        if (parameters.length === 1) {
            return;
        }

        setParameters(
            parameters.filter(
                (_, parameterIndex) => parameterIndex !== index
            )
        );
    };

    const handleUpdateParameter = (
        index: number,
        field: keyof TestParameter,
        value: string
    ) => {
        setParameters(
            parameters.map((parameter, parameterIndex) =>
                parameterIndex === index
                    ? {
                        ...parameter,
                        [field]: value,
                    }
                    : parameter
            )
        );
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !testName.trim() ||
            !testCode.trim() ||
            !category ||
            !sampleType ||
            !method.trim() ||
            !price ||
            !turnaroundTime.trim()
        ) {
            alert("Please fill all required fields.");
            return;
        }

        const validParameters = parameters.filter(
            (parameter) =>
                parameter.name.trim() ||
                parameter.unit.trim() ||
                parameter.referenceRange.trim()
        );

        if (validParameters.length === 0) {
            alert("Please add at least one test parameter.");
            return;
        }

        const test: LabTest = {
            id: editingTest?.id ?? `TEST-${Date.now()}`,
            testCode: testCode.trim(),
            testName: testName.trim(),
            category,
            sampleType,
            method: method.trim(),
            price: Number(price),
            turnaroundTime: turnaroundTime.trim(),
            parameters: validParameters,
            status: editingTest?.status ?? "Active",
            createdAt:
                editingTest?.createdAt ?? new Date().toISOString(),
        };

        onSave(test);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-800">
                        {isEditing ? "Edit Test" : "Add New Test"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        {isEditing
                            ? "Update the laboratory test details and parameters."
                            : "Create a new laboratory test with its parameters and pricing."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Back to Test List
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-slate-800">
                            Test Information
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Enter the basic information for this laboratory test.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                        {/* Test Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Test Name <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={testName}
                                onChange={(event) =>
                                    setTestName(event.target.value)
                                }
                                placeholder="e.g. Complete Blood Count"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Test Code */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Test Code <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={testCode}
                                onChange={(event) =>
                                    setTestCode(event.target.value.toUpperCase())
                                }
                                placeholder="e.g. CBC"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Category <span className="text-red-500">*</span>
                            </label>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select category</option>

                                {categories
                                    .filter((item) => item.status === "Active")
                                    .map((item) => (
                                        <option key={item.id} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Sample Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Sample Type <span className="text-red-500">*</span>
                            </label>

                            <select
                                value={sampleType}
                                onChange={(event) =>
                                    setSampleType(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select sample type</option>
                                <option value="Whole Blood">Whole Blood</option>
                                <option value="Serum">Serum</option>
                                <option value="Plasma">Plasma</option>
                                <option value="Urine">Urine</option>
                                <option value="Stool">Stool</option>
                                <option value="Sputum">Sputum</option>
                                <option value="Swab">Swab</option>
                                <option value="CSF">CSF</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Method */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Method <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={method}
                                onChange={(event) =>
                                    setMethod(event.target.value)
                                }
                                placeholder="e.g. Automated Cell Counter"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Price <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                    ₹
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    value={price}
                                    onChange={(event) =>
                                        setPrice(event.target.value)
                                    }
                                    placeholder="350"
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Turnaround Time */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Turnaround Time <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={turnaroundTime}
                                onChange={(event) =>
                                    setTurnaroundTime(event.target.value)
                                }
                                placeholder="e.g. 4 Hours"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Parameters */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Test Parameters
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Define the parameters, units and reference ranges
                                for this test.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddParameter}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            + Add Parameter
                        </button>
                    </div>

                    <div className="space-y-4 p-5">
                        {parameters.map((parameter, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        Parameter {index + 1}
                                    </h3>

                                    {parameters.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveParameter(index)
                                            }
                                            className="text-sm font-medium text-red-600 transition hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Parameter Name */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Parameter Name
                                        </label>

                                        <input
                                            type="text"
                                            value={parameter.name}
                                            onChange={(event) =>
                                                handleUpdateParameter(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. Hemoglobin"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Unit
                                        </label>

                                        <input
                                            type="text"
                                            value={parameter.unit}
                                            onChange={(event) =>
                                                handleUpdateParameter(
                                                    index,
                                                    "unit",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. g/dL"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Reference Range */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Reference Range
                                        </label>

                                        <input
                                            type="text"
                                            value={parameter.referenceRange}
                                            onChange={(event) =>
                                                handleUpdateParameter(
                                                    index,
                                                    "referenceRange",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. 13-17"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        {isEditing ? "Update Test" : "Save Test"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTest;
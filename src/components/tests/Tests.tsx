import { useState } from "react";
import { Add, ScienceOutlined } from "@mui/icons-material";
import TestList from "./TestList";
import AddTest from "./AddTest";
import Categories from "./Categories";

export type TestParameter = {
    name: string;
    unit: string;
    referenceRange: string;
};

export type Status = "Active" | "Inactive";

export type LabTest = {
    id: string;
    testCode: string;
    testName: string;
    category: string;
    sampleType: string;
    method: string;
    price: number;
    turnaroundTime: string;
    parameters: TestParameter[];
    status: Status;
    createdAt: string;
};

export type TestCategory = {
    id: string;
    name: string;
    description: string;
    status: Status;
};

type ActiveTab = "list" | "add" | "categories";

const TEST_STORAGE_KEY = "lab_tests";
const CATEGORY_STORAGE_KEY = "lab_test_categories";

const defaultCategories: TestCategory[] = [
    {
        id: "CAT-001",
        name: "Hematology",
        description: "Tests related to blood cells and blood disorders.",
        status: "Active",
    },
    {
        id: "CAT-002",
        name: "Biochemistry",
        description: "Biochemical analysis of blood and body fluids.",
        status: "Active",
    },
    {
        id: "CAT-003",
        name: "Clinical Pathology",
        description: "Routine examination of clinical specimens.",
        status: "Active",
    },
    {
        id: "CAT-004",
        name: "Immunology",
        description: "Tests related to immune response and antibodies.",
        status: "Active",
    },
    {
        id: "CAT-005",
        name: "Microbiology",
        description: "Tests for identification of microorganisms.",
        status: "Active",
    },
];

const defaultTests: LabTest[] = [
    {
        id: "TEST-001",
        testCode: "CBC",
        testName: "Complete Blood Count",
        category: "Hematology",
        sampleType: "Whole Blood",
        method: "Automated Cell Counter",
        price: 350,
        turnaroundTime: "4 Hours",
        parameters: [
            {
                name: "Hemoglobin",
                unit: "g/dL",
                referenceRange: "13-17",
            },
            {
                name: "WBC Count",
                unit: "cells/µL",
                referenceRange: "4,000-11,000",
            },
            {
                name: "Platelet Count",
                unit: "cells/µL",
                referenceRange: "150,000-450,000",
            },
        ],
        status: "Active",
        createdAt: "2026-09-01",
    },
    {
        id: "TEST-002",
        testCode: "FBS",
        testName: "Fasting Blood Sugar",
        category: "Biochemistry",
        sampleType: "Serum",
        method: "Hexokinase",
        price: 120,
        turnaroundTime: "2 Hours",
        parameters: [
            {
                name: "Glucose",
                unit: "mg/dL",
                referenceRange: "70-100",
            },
        ],
        status: "Active",
        createdAt: "2026-09-02",
    },
    {
        id: "TEST-003",
        testCode: "LFT",
        testName: "Liver Function Test",
        category: "Biochemistry",
        sampleType: "Serum",
        method: "Photometric",
        price: 750,
        turnaroundTime: "6 Hours",
        parameters: [
            {
                name: "Total Bilirubin",
                unit: "mg/dL",
                referenceRange: "0.3-1.2",
            },
            {
                name: "ALT",
                unit: "U/L",
                referenceRange: "7-56",
            },
            {
                name: "AST",
                unit: "U/L",
                referenceRange: "10-40",
            },
        ],
        status: "Active",
        createdAt: "2026-09-03",
    },
    {
        id: "TEST-004",
        testCode: "RFT",
        testName: "Renal Function Test",
        category: "Biochemistry",
        sampleType: "Serum",
        method: "Enzymatic",
        price: 650,
        turnaroundTime: "6 Hours",
        parameters: [
            {
                name: "Creatinine",
                unit: "mg/dL",
                referenceRange: "0.6-1.3",
            },
            {
                name: "Urea",
                unit: "mg/dL",
                referenceRange: "15-45",
            },
        ],
        status: "Active",
        createdAt: "2026-09-04",
    },
    {
        id: "TEST-005",
        testCode: "TSH",
        testName: "Thyroid Stimulating Hormone",
        category: "Immunology",
        sampleType: "Serum",
        method: "CLIA",
        price: 400,
        turnaroundTime: "8 Hours",
        parameters: [
            {
                name: "TSH",
                unit: "µIU/mL",
                referenceRange: "0.4-4.0",
            },
        ],
        status: "Active",
        createdAt: "2026-09-05",
    },
];

const getStoredTests = (): LabTest[] => {
    try {
        const stored = localStorage.getItem(TEST_STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored);
        }

        localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(defaultTests));
        return defaultTests;
    } catch {
        return defaultTests;
    }
};

const getStoredCategories = (): TestCategory[] => {
    try {
        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored);
        }

        localStorage.setItem(
            CATEGORY_STORAGE_KEY,
            JSON.stringify(defaultCategories)
        );

        return defaultCategories;
    } catch {
        return defaultCategories;
    }
};

const Tests = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("list");
    const [editingTest, setEditingTest] = useState<LabTest | null>(null);
    const [tests, setTests] = useState<LabTest[]>(() => getStoredTests());
    const [categories, setCategories] = useState<TestCategory[]>(() => getStoredCategories());


    const saveTests = (updatedTests: LabTest[]) => {
        setTests(updatedTests);
        localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(updatedTests));
    };

    const saveCategories = (updatedCategories: TestCategory[]) => {
        setCategories(updatedCategories);

        localStorage.setItem(
            CATEGORY_STORAGE_KEY,
            JSON.stringify(updatedCategories)
        );
    };

    const handleSaveTest = (testData: LabTest) => {
        const existingTest = tests.some((test) => test.id === testData.id);

        const updatedTests = existingTest
            ? tests.map((test) =>
                test.id === testData.id ? testData : test
            )
            : [...tests, testData];

        saveTests(updatedTests);

        setEditingTest(null);
        setActiveTab("list");
    };

    const handleEditTest = (test: LabTest) => {
        setEditingTest(test);
        setActiveTab("add");
    };

    const handleToggleTestStatus = (id: string) => {
        const updatedTests: LabTest[] = tests.map((test) =>
            test.id === id
                ? {
                    ...test,
                    status:
                        test.status === "Active" ? "Inactive" : "Active",
                }
                : test
        );

        saveTests(updatedTests);
    };

    const handleAddTest = () => {
        setEditingTest(null);
        setActiveTab("add");
    };

    const handleCancelTest = () => {
        setEditingTest(null);
        setActiveTab("list");
    };

    const handleDeleteTest = (id: string) => {
        const updatedTests = tests.filter((test) => test.id !== id);
        saveTests(updatedTests);
    };

    const handleSaveCategory = (categoryData: TestCategory) => {
        const existingCategory = categories.some(
            (category) => category.id === categoryData.id
        );

        const updatedCategories = existingCategory
            ? categories.map((category) =>
                category.id === categoryData.id
                    ? categoryData
                    : category
            )
            : [...categories, categoryData];

        saveCategories(updatedCategories);
    };

    const handleDeleteCategory = (id: string) => {
        const updatedCategories = categories.filter((category) => category.id !== id);
        saveCategories(updatedCategories);
    };

    const handleToggleCategory = (id: string) => {
        const updatedCategories: TestCategory[] = categories.map(
            (category) =>
                category.id === id
                    ? {
                        ...category,
                        status:
                            category.status === "Active"
                                ? "Inactive"
                                : "Active",
                    }
                    : category
        );

        saveCategories(updatedCategories);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* PAGE HEADER */}
            <div className="border-b border-slate-200 bg-white">
                <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ScienceOutlined />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Tests
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage laboratory tests, parameters, pricing and
                                categories.
                            </p>
                        </div>
                    </div>

                    {activeTab === "list" && (
                        <button
                            type="button"
                            onClick={handleAddTest}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            <Add fontSize="small" />
                            Add Test
                        </button>
                    )}
                </div>

                {/* TABS */}
                <div className="overflow-x-auto px-4 sm:px-6">
                    <div className="flex min-w-max gap-6">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("list");
                                setEditingTest(null);
                            }}
                            className={`border-b-2 px-1 py-3 text-sm font-medium transition ${activeTab === "list"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Test List
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("add");
                            }}
                            className={`border-b-2 px-1 py-3 text-sm font-medium transition ${activeTab === "add"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {editingTest ? "Edit Test" : "Add Test"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("categories");
                                setEditingTest(null);
                            }}
                            className={`border-b-2 px-1 py-3 text-sm font-medium transition ${activeTab === "categories"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Categories
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 sm:p-6">
                {activeTab === "list" && (
                    <TestList
                        tests={tests}
                        categories={categories}
                        onAddTest={handleAddTest}
                        onEditTest={handleEditTest}
                        onToggleStatus={handleToggleTestStatus}
                        onDeleteTest={handleDeleteTest}
                    />
                )}

                {activeTab === "add" && (
                    <AddTest
                        key={editingTest?.id ?? "new-test"}
                        categories={categories}
                        editingTest={editingTest}
                        onSave={handleSaveTest}
                        onCancel={handleCancelTest}
                    />
                )}

                {activeTab === "categories" && (
                    <Categories
                        categories={categories}
                        onSaveCategory={handleSaveCategory}
                        onToggleCategory={handleToggleCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                )}
            </div>
        </div>
    );
};

export default Tests;
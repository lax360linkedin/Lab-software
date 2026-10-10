import { useMemo, useState, type FormEvent } from "react";
import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import Search from "@mui/icons-material/Search";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ToggleOnOutlined from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlined from "@mui/icons-material/ToggleOffOutlined";
import type { LabTest, TestCategory, Status } from "./Tests";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type SampleType = {
    id: string;
    name: string;
    description: string;
    status: Status;
};

type CategoriesProps = {
    categories: TestCategory[];
    tests: LabTest[];
    onSaveCategory: (category: TestCategory) => void;
    onToggleCategory: (id: string) => void;
    onDeleteCategory?: (id: string) => void;
};

type ActiveSection = "categories" | "sampleTypes";

type DeleteTarget =
    | { type: "category"; item: TestCategory }
    | { type: "sampleType"; item: SampleType }
    | null;

const SAMPLE_TYPE_STORAGE_KEY = "lab_sample_types";

const getStoredSampleTypes = (): SampleType[] => {
    try {
        return JSON.parse(
            localStorage.getItem("lab_sample_types") || "[]"
        ) as SampleType[];
    } catch {
        return [];
    }
};


const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const StatusBadge = ({ status }: { status: Status }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status === "Active"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
            }`}
    >
        <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                }`}
        />
        {status}
    </span>
);

const Categories = ({
    categories,
    tests,
    onSaveCategory,
    onToggleCategory,
    onDeleteCategory,
}: CategoriesProps) => {
    const [activeSection, setActiveSection] = useState<ActiveSection>("categories");
    const [sampleTypes, setSampleTypes] = useState<SampleType[]>(() => getStoredSampleTypes());
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [viewCategory, setViewCategory] = useState<TestCategory | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const isCategorySection = activeSection === "categories";

    const notify = (message: string) => {
        setToastMessage(message);
        window.setTimeout(() => setToastMessage(null), 3000);
    };

    const saveSampleTypes = (updated: SampleType[]) => {
        setSampleTypes(updated);
        localStorage.setItem(
            SAMPLE_TYPE_STORAGE_KEY,
            JSON.stringify(updated)
        );
    };

    const activeCategoryCount = categories.filter( (item) => item.status === "Active" ).length;
    const inactiveCategoryCount = categories.filter( (item) => item.status === "Inactive" ).length;
    const activeSampleTypeCount = sampleTypes.filter( (item) => item.status === "Active").length;
    const getCategoryTestCount = (category: TestCategory) => tests.filter((test) => test.category === category.name).length;
    const getSampleTypeTestCount = (sampleType: SampleType) => tests.filter((test) => test.sampleType === sampleType.name).length;

    const filteredCategories = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) return categories;

        return categories.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.id.toLowerCase().includes(query)
        );
    }, [categories, searchValue]);

    const filteredSampleTypes = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) return sampleTypes;

        return sampleTypes.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.id.toLowerCase().includes(query)
        );
    }, [sampleTypes, searchValue]);

    const filteredItems = isCategorySection
        ? filteredCategories
        : filteredSampleTypes;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / rowsPerPage)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const currentItems = filteredItems.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName("");
        setDescription("");
    };

    const changeSection = (section: ActiveSection) => {
        setActiveSection(section);
        setSearchValue("");
        setCurrentPage(1);
        setViewCategory(null);
        resetForm();
    };

    const openAddForm = () => {
        setEditingId(null);
        setName("");
        setDescription("");
        setShowForm(true);
    };

    const openCategoryEdit = (category: TestCategory) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description);
        setShowForm(true);
    };

    const openSampleTypeEdit = (sampleType: SampleType) => {
        setEditingId(sampleType.id);
        setName(sampleType.name);
        setDescription(sampleType.description);
        setShowForm(true);
    };

    const handleSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) {
            notify(
                isCategorySection
                    ? "Please enter a category name."
                    : "Please enter a sample type name."
            );
            return;
        }

        const duplicateExists = isCategorySection
            ? categories.some(
                (item) =>
                    item.name.toLowerCase() === trimmedName.toLowerCase() &&
                    item.id !== editingId
            )
            : sampleTypes.some(
                (item) =>
                    item.name.toLowerCase() === trimmedName.toLowerCase() &&
                    item.id !== editingId
            );

        if (duplicateExists) {
            notify(
                isCategorySection
                    ? "This category already exists."
                    : "This sample type already exists."
            );
            return;
        }

        if (isCategorySection) {
            const existingCategory = categories.find(
                (item) => item.id === editingId
            );

            const category: TestCategory = {
                id: editingId ?? `CAT-${Date.now()}`,
                name: trimmedName,
                description: trimmedDescription,
                status: existingCategory?.status ?? "Active",
            };

            onSaveCategory(category);

            notify(
                editingId
                    ? "Category updated successfully."
                    : "Category added successfully."
            );
        } else {
            const existingSampleType = sampleTypes.find(
                (item) => item.id === editingId
            );

            const sampleType: SampleType = {
                id: editingId ?? `SAMPLE-${Date.now()}`,
                name: trimmedName,
                description: trimmedDescription,
                status: existingSampleType?.status ?? "Active",
            };

            const updated = editingId
                ? sampleTypes.map((item) =>
                    item.id === editingId ? sampleType : item
                )
                : [...sampleTypes, sampleType];

            saveSampleTypes(updated);

            notify(
                editingId
                    ? "Sample type updated successfully."
                    : "Sample type added successfully."
            );
        }

        resetForm();
    };

    const handleToggleSampleType = (id: string) => {
        const updated = sampleTypes.map((item) =>
            item.id === id
                ? {
                    ...item,
                    status:
                        item.status === "Active"
                            ? ("Inactive" as Status)
                            : ("Active" as Status),
                }
                : item
        );

        saveSampleTypes(updated);
        notify("Sample type status updated.");
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === "category") {
            const category = deleteTarget.item;

            if (getCategoryTestCount(category) > 0) {
                notify(
                    "This category has tests assigned to it. Reassign or remove those tests before deleting the category."
                );
                setDeleteTarget(null);
                return;
            }

            onDeleteCategory?.(category.id);
            notify("Category deleted successfully.");
        } else {
            const sampleType = deleteTarget.item;

            if (getSampleTypeTestCount(sampleType) > 0) {
                notify(
                    "This sample type is assigned to tests. Update those tests before deleting it."
                );
                setDeleteTarget(null);
                return;
            }

            saveSampleTypes(
                sampleTypes.filter((item) => item.id !== sampleType.id)
            );
            notify("Sample type deleted successfully.");
        }

        setDeleteTarget(null);
    };

    const categoryColumns = [
        "Category",
        "Description",
        "Tests",
        "Status",
        "Actions",
    ];

    const sampleTypeColumns = [
        "Sample Type",
        "Description",
        "Tests",
        "Status",
        "Actions",
    ];

    const categoryTests = viewCategory
        ? tests.filter((test) => test.category === viewCategory.name)
        : [];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Categories
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-800">
                                {categories.length}
                            </h3>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ScienceOutlined />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Active Categories
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-emerald-600">
                        {activeCategoryCount}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                        {inactiveCategoryCount} inactive
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Sample Types
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-800">
                        {sampleTypes.length}
                    </h3>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Active Sample Types
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-emerald-600">
                        {activeSampleTypeCount}
                    </h3>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex gap-5">
                        <button
                            type="button"
                            onClick={() => changeSection("categories")}
                            className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${isCategorySection
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Test Categories
                        </button>

                        <button
                            type="button"
                            onClick={() => changeSection("sampleTypes")}
                            className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${!isCategorySection
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Sample Types
                        </button>
                    </div>

                    <div className="pb-3">
                        <button
                            type="button"
                            onClick={openAddForm}
                            className={primaryButtonClass}
                        >
                            <Add fontSize="small" />
                            Add {isCategorySection ? "Category" : "Sample Type"}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSave}
                        className="border-b border-blue-100 bg-blue-50/50 p-4 sm:p-5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    {editingId ? "Edit" : "Add"}{" "}
                                    {isCategorySection
                                        ? "Test Category"
                                        : "Sample Type"}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter the details below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-700"
                                aria-label="Close form"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    {isCategorySection
                                        ? "Category Name"
                                        : "Sample Type Name"}
                                    <span className="ml-1 text-red-500">*</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder={
                                        isCategorySection
                                            ? "e.g. Hematology"
                                            : "e.g. Whole Blood"
                                    }
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    placeholder="Enter a short description"
                                    rows={2}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </button>
                            <button type="submit" className={primaryButtonClass}>
                                <Add fontSize="small" />
                                {editingId ? "Save Changes" : "Create"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                {isCategorySection
                                    ? "Category List"
                                    : "Sample Type List"}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {filteredItems.length} record
                                {filteredItems.length === 1 ? "" : "s"} found
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                fontSize="small"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={searchValue}
                                onChange={(event) => {
                                    setSearchValue(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={
                                    isCategorySection
                                        ? "Search categories..."
                                        : "Search sample types..."
                                }
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </div>

                    {isCategorySection ? (
                        <Table
                            columns={categoryColumns}
                            data={currentItems as TestCategory[]}
                            maxHeight="500px"
                            renderRow={(category: TestCategory) => (
                                <>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-800">
                                            {category.name}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            {category.id}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-600">
                                        {category.description || "-"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700">
                                            {getCategoryTestCount(category)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onToggleCategory(category.id)
                                            }
                                            className="inline-flex items-center gap-1.5"
                                            title="Change category status"
                                        >
                                            <StatusBadge status={category.status} />
                                            {category.status === "Active" ? (
                                                <ToggleOnOutlined className="text-emerald-600" />
                                            ) : (
                                                <ToggleOffOutlined className="text-slate-400" />
                                            )}
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setViewCategory(category)
                                                }
                                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                title="View tests"
                                            >
                                                <VisibilityOutlined fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openCategoryEdit(category)
                                                }
                                                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                                                title="Edit category"
                                            >
                                                <EditOutlined fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: "category",
                                                        item: category,
                                                    })
                                                }
                                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                title="Delete category"
                                            >
                                                <DeleteOutlineOutlined fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        />
                    ) : (
                        <Table
                            columns={sampleTypeColumns}
                            data={currentItems as SampleType[]}
                            maxHeight="500px"
                            renderRow={(sampleType: SampleType) => (
                                <>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-800">
                                            {sampleType.name}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            {sampleType.id}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-600">
                                        {sampleType.description || "-"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700">
                                            {getSampleTypeTestCount(sampleType)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleSampleType(
                                                    sampleType.id
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5"
                                            title="Change sample type status"
                                        >
                                            <StatusBadge status={sampleType.status} />
                                            {sampleType.status === "Active" ? (
                                                <ToggleOnOutlined className="text-emerald-600" />
                                            ) : (
                                                <ToggleOffOutlined className="text-slate-400" />
                                            )}
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openSampleTypeEdit(sampleType)
                                                }
                                                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                                                title="Edit sample type"
                                            >
                                                <EditOutlined fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: "sampleType",
                                                        item: sampleType,
                                                    })
                                                }
                                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                title="Delete sample type"
                                            >
                                                <DeleteOutlineOutlined fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        />
                    )}

                    {filteredItems.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <Pagination
                                totalItems={filteredItems.length}
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={setRowsPerPage}
                                currentPage={safeCurrentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {viewCategory && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
                    <button
                        type="button"
                        aria-label="Close tests drawer"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setViewCategory(null)}
                    />

                    <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Category details
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-slate-800">
                                    {viewCategory.name}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {viewCategory.description || "No description provided."}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {categoryTests.length} assigned test
                                    {categoryTests.length === 1 ? "" : "s"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewCategory(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close"
                            >
                                <Close />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                            {categoryTests.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                                    <ScienceOutlined className="text-slate-400" />
                                    <p className="mt-3 font-medium text-slate-700">
                                        No tests assigned
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Tests assigned to this category will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categoryTests.map((test) => (
                                        <div
                                            key={test.id}
                                            className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-blue-600">
                                                        {test.testCode}
                                                    </p>
                                                    <h4 className="mt-1 font-semibold text-slate-800">
                                                        {test.testName}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {test.method}
                                                    </p>
                                                </div>

                                                <div className="sm:text-right">
                                                    <p className="font-semibold text-slate-800">
                                                        ₹{test.price.toLocaleString("en-IN")}
                                                    </p>
                                                    <div className="mt-1">
                                                        <StatusBadge status={test.status} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                                    Sample: {test.sampleType}
                                                </span>
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                                    TAT: {test.turnaroundTime}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200 p-4 sm:p-5">
                            <button
                                type="button"
                                onClick={() => setViewCategory(null)}
                                className={`${secondaryButtonClass} w-full`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40">
                    <button
                        type="button"
                        aria-label="Close delete confirmation"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setDeleteTarget(null)}
                    />

                    <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 p-5">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Confirm Deletion
                            </h3>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close"
                            >
                                <Close />
                            </button>
                        </div>

                        <div className="flex-1 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <DeleteOutlineOutlined />
                            </div>

                            <h4 className="mt-4 font-semibold text-slate-800">
                                Delete "{deleteTarget.item.name}"?
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                This action cannot be undone. You cannot delete
                                a category or sample type while tests are still
                                assigned to it.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                                <DeleteOutlineOutlined fontSize="small" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-xl">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default Categories;
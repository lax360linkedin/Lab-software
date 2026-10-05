import { useMemo, useState } from "react";
import {
    Add,
    Close,
    EditOutlined,
    DeleteOutlineOutlined,
    Save,
    Search,
} from "@mui/icons-material";

import type { TestCategory } from "./Tests";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type CategoriesProps = {
    categories: TestCategory[];
    onSaveCategory: (category: TestCategory) => void;
    onToggleCategory: (id: string) => void;
    onDeleteCategory?: (id: string) => void;
};

const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Categories = ({
    categories,
    onSaveCategory,
    onToggleCategory,
    onDeleteCategory,
}: CategoriesProps) => {
    const [categorySearch, setCategorySearch] = useState("");
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const filteredData = useMemo(() => {
        const searchValue = categorySearch
            .toLowerCase()
            .trim();

        if (!searchValue) {
            return categories;
        }

        return categories.filter(
            (category) =>
                category.name
                    .toLowerCase()
                    .includes(searchValue) ||
                category.description
                    .toLowerCase()
                    .includes(searchValue)
        );
    }, [categories, categorySearch]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / rowsPerPage)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const currentData = filteredData.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const resetForm = () => {
        setCategoryName("");
        setCategoryDescription("");
        setEditingCategoryId(null);
        setShowCategoryForm(false);
    };

    const handleOpenAdd = () => {
        setCategoryName("");
        setCategoryDescription("");
        setEditingCategoryId(null);
        setShowCategoryForm(true);
    };

    const handleEdit = (category: TestCategory) => {
        setEditingCategoryId(category.id);
        setCategoryName(category.name);
        setCategoryDescription(category.description);
        setShowCategoryForm(true);
    };

    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<TestCategory | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleConfirmDelete = () => {
        if (!deletingCategory) return;
        if (onDeleteCategory) {
            onDeleteCategory(deletingCategory.id);
        }
        setDeletingCategory(null);
        showToast("Deleted successfully");
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            showToast("Please enter category name.");
            return;
        }

        const isEditing = Boolean(editingCategoryId);
        const category: TestCategory = {
            id:
                editingCategoryId ??
                `CAT-${String(
                    Date.now()
                ).slice(-6)}`,
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            status: editingCategoryId
                ? categories.find(
                    (item) => item.id === editingCategoryId
                )?.status ?? "Active"
                : "Active",
        };

        onSaveCategory(category);
        showToast(isEditing ? "Category updated successfully." : "Category created successfully.");
        resetForm();
    };

    const activeCount = categories.filter(
        (category) => category.status === "Active"
    ).length;

    const inactiveCount = categories.filter(
        (category) => category.status === "Inactive"
    ).length;

    const columns = [
        "Category",
        "Description",
        "Tests",
        "Status",
        "Actions",
    ];

    return (
        <>
            {/* SUMMARY */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Categories
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-800">
                        {categories.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Active Categories
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-emerald-600">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Inactive Categories
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-500">
                        {inactiveCount}
                    </p>
                </div>
            </div>

            {/* CATEGORY FORM */}
            {showCategoryForm && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">
                                {editingCategoryId
                                    ? "Edit Category"
                                    : "Add Category"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Create or update a test category.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                            <Close fontSize="small" />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSave}
                        className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Category Name{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) =>
                                    setCategoryName(e.target.value)
                                }
                                placeholder="e.g. Hematology"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <input
                                type="text"
                                value={categoryDescription}
                                onChange={(e) =>
                                    setCategoryDescription(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter category description"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row md:col-span-2 md:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Save fontSize="small" />

                                {editingCategoryId
                                    ? "Update Category"
                                    : "Save Category"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CATEGORY LIST */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            Test Categories
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage categories used for laboratory tests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Add fontSize="small" />
                        Add Category
                    </button>
                </div>

                {/* SEARCH */}
                <div className="border-b border-slate-100 p-4">
                    <div className="relative max-w-xl">
                        <Search
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => {
                                setCategorySearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search category..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="p-3 sm:p-5">
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="500px"
                            renderRow={(category: TestCategory) => {
                                const testCount = categories
                                    .filter(
                                        (item) =>
                                            item.name === category.name
                                    )
                                    .reduce(() => 0, 0);

                                return (
                                    <>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                                            {category.name}
                                        </td>

                                        <td className="max-w-md px-4 py-3 text-sm text-slate-600">
                                            {category.description || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                            {testCount}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onToggleCategory(category.id)
                                                }
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {category.status}
                                            </button>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Edit"
                                                    onClick={() =>
                                                        handleEdit(category)
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <EditOutlined fontSize="small" />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    onClick={() =>
                                                        setDeletingCategory(category)
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <DeleteOutlineOutlined fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                );
                            }}
                        />
                    </div>

                    {currentData.length === 0 && (
                        <div className="py-10 text-center">
                            <p className="text-sm font-medium text-slate-600">
                                No categories found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try changing your search.
                            </p>
                        </div>
                    )}

                    {filteredData.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <Pagination
                                totalItems={filteredData.length}
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={setRowsPerPage}
                                currentPage={safeCurrentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Drawer (Matching Screenshot 1 style) */}
            {deletingCategory && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setDeletingCategory(null)}
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
                                    <h3 className="text-base font-bold text-slate-900">Delete Category</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeletingCategory(null)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <Close fontSize="small" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Yellow Warning Box */}
                                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
                                    <strong className="block font-semibold">Are you sure you want to permanently delete this category?</strong>
                                    <p className="text-amber-800">
                                        This test category will be removed. This action cannot be undone.
                                    </p>
                                </div>

                                {/* Details Card */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Category Name</span>
                                        <strong className="text-slate-800 text-sm">{deletingCategory.name}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Category ID</span>
                                        <span className="font-mono font-medium text-slate-700">{deletingCategory.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Description</span>
                                        <span className="text-slate-700">{deletingCategory.description || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setDeletingCategory(null)}
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
        </>
    );
};

export default Categories;
import { useMemo, useState } from "react";
import {
    Add,
    Close,
    EditOutlined,
    FilterList,
    Search,
    VisibilityOutlined,
} from "@mui/icons-material";
import type { LabTest, TestCategory } from "./Tests";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";

type TestListProps = {
    tests: LabTest[];
    categories: TestCategory[];
    onAddTest: () => void;
    onEditTest: (test: LabTest) => void;
    onToggleStatus: (id: string) => void;
};

const TestList = ({
    tests,
    categories,
    onAddTest,
    onEditTest,
    onToggleStatus,
}: TestListProps) => {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [viewTest, setViewTest] = useState<LabTest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const filteredData = useMemo(() => {
        return tests.filter((test) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                test.testName.toLowerCase().includes(searchValue) ||
                test.testCode.toLowerCase().includes(searchValue) ||
                test.category.toLowerCase().includes(searchValue) ||
                test.sampleType.toLowerCase().includes(searchValue);

            const matchesCategory =
                categoryFilter === "All" ||
                test.category === categoryFilter;

            const matchesStatus =
                statusFilter === "All" ||
                test.status === statusFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [tests, search, categoryFilter, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / rowsPerPage)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const currentData = filteredData.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage
    );

    const activeCount = tests.filter(
        (test) => test.status === "Active"
    ).length;

    const inactiveCount = tests.filter(
        (test) => test.status === "Inactive"
    ).length;

    const columns = [
        "Test Code",
        "Test Name",
        "Category",
        "Sample Type",
        "Method",
        "Price",
        "TAT",
        "Status",
        "Actions",
    ];

    const resetFilters = () => {
        setSearch("");
        setCategoryFilter("All");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    return (
        <>
            {/* SUMMARY CARDS */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Total Tests</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-800">
                        {tests.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Active Tests</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-600">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Inactive Tests</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-500">
                        {inactiveCount}
                    </p>
                </div>
            </div>

            {/* SEARCH / FILTER */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <FilterList className="text-slate-500" fontSize="small" />

                    <h2 className="text-sm font-semibold text-slate-700">
                        Search & Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {/* SEARCH */}
                    <div className="relative xl:col-span-2">
                        <Search
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search test name, code, category..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* CATEGORY */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Categories</option>

                        {categories
                            .filter((category) => category.status === "Active")
                            .map((category) => (
                                <option
                                    key={category.id}
                                    value={category.name}
                                >
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {/* STATUS */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                {(search ||
                    categoryFilter !== "All" ||
                    statusFilter !== "All") && (
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
            </div>

            {/* TABLE */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            Laboratory Tests
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {filteredData.length} test
                            {filteredData.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onAddTest}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Add fontSize="small" />
                        Add Test
                    </button>
                </div>

                <div className="p-3 sm:p-5">
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={currentData}
                            maxHeight="400px"
                            renderRow={(test: LabTest) => (
                                <>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-600">
                                        {test.testCode}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                                        {test.testName}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {test.category}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {test.sampleType}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {test.method}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                                        ₹{test.price.toLocaleString("en-IN")}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                        {test.turnaroundTime}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onToggleStatus(test.id)
                                            }
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${test.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {test.status}
                                        </button>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                title="View"
                                                onClick={() => setViewTest(test)}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <VisibilityOutlined fontSize="small" />
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() => onEditTest(test)}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <EditOutlined fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        />
                    </div>

                    {currentData.length === 0 && (
                        <div className="py-10 text-center">
                            <p className="text-sm font-medium text-slate-600">
                                No tests found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try changing your search or filters.
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

            {/* VIEW DRAWER */}
            {viewTest && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setViewTest(null)}
                    />

                    <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
                        {/* DRAWER HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Test Details
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {viewTest.testCode}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewTest(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <Close />
                            </button>
                        </div>

                        {/* DRAWER CONTENT */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Test Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {viewTest.testName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Test Code
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {viewTest.testCode}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Category
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {viewTest.category}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Sample Type
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {viewTest.sampleType}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Method
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {viewTest.method}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Price
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        ₹{viewTest.price.toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Turnaround Time
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {viewTest.turnaroundTime}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Status
                                    </p>

                                    <span
                                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${viewTest.status === "Active"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {viewTest.status}
                                    </span>
                                </div>
                            </div>

                            {/* PARAMETERS */}
                            <div className="mt-7">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Test Parameters
                                </h3>

                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full min-w-[500px] text-left">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                                                    Parameter
                                                </th>

                                                <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                                                    Unit
                                                </th>

                                                <th className="px-4 py-3 text-xs font-semibold text-slate-600">
                                                    Reference Range
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {viewTest.parameters.map(
                                                (parameter, index) => (
                                                    <tr key={`${parameter.name}-${index}`}>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            {parameter.name || "-"}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {parameter.unit || "-"}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {parameter.referenceRange || "-"}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* DRAWER FOOTER */}
                        <div className="border-t border-slate-200 p-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setViewTest(null);
                                    onEditTest(viewTest);
                                }}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Edit Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TestList;
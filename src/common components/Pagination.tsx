import React from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface PaginationProps {
  totalItems?: number;
  rowsPerPage?: number;
  setRowsPerPage?: (value: number) => void;
  currentPage: number;
  setCurrentPage?: (value: number) => void;
  totalPages?: number;
  onPageChange?: (value: number) => void;
  rowsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  rowsPerPage = 5,
  setRowsPerPage,
  currentPage = 1,
  setCurrentPage,
  totalPages: propTotalPages,
  onPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}) => {
  const count = totalItems !== undefined ? totalItems : 0;
  const rpp = rowsPerPage > 0 ? rowsPerPage : 5;
  const setRpp = setRowsPerPage || (() => {});
  const changePage = setCurrentPage || onPageChange || (() => {});

  const calculatedTotalPages =
    count === 0 ? 1 : Math.max(1, Math.ceil(count / rpp));
  const totalPages =
    propTotalPages !== undefined ? propTotalPages : calculatedTotalPages;

  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex =
    count === 0 ? 0 : (validCurrentPage - 1) * rpp + 1;
  const endIndex =
    count === 0 ? 0 : Math.min(validCurrentPage * rpp, count);

  // If no items at all and no total pages, do not render
  if (count === 0 && propTotalPages === undefined) {
    return null;
  }

  // Ensure current rowsPerPage is included in the options list
  const options = Array.from(new Set([...rowsPerPageOptions, rpp])).sort(
    (a, b) => a - b
  );

  return (
    <div className="flex w-full items-center justify-end">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-slate-500">
            Rows per page:
          </span>

          <select
            value={rpp}
            onChange={(event) => {
              const value = Number(event.target.value);
              setRpp(value);
              changePage(1);
            }}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-600 outline-none transition focus:border-blue-500"
            aria-label="Rows per page"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Item count */}
        <span className="whitespace-nowrap text-sm text-slate-500">
          {startIndex}-{endIndex} of {count}
        </span>

        {/* Previous */}
        <button
          type="button"
          disabled={validCurrentPage <= 1}
          onClick={() => changePage(Math.max(1, validCurrentPage - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </button>

        {/* Next */}
        <button
          type="button"
          disabled={validCurrentPage >= totalPages}
          onClick={() => changePage(Math.min(totalPages, validCurrentPage + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
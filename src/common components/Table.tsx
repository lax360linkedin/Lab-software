import React from "react";

interface TableProps<T> {
  columns: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  maxHeight?: string;
  emptyMessage?: string;
  minWidth?: string;
  maxWidth?: string;
  
  centeredColumns?: string[];
}

const Table = <T,>({
  columns,
  data,
  renderRow,
  maxHeight = "430px",
  emptyMessage = "No records found",
  minWidth = "1200px",
  maxWidth = "100%",

  centeredColumns = [],
}: TableProps<T>) => {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div
        className="w-full min-w-0 overflow-x-auto overflow-y-auto"
        style={{ maxHeight }}
      >
        <table
          className="w-full border-collapse"
          style={{
            minWidth,
            maxWidth,
            tableLayout: "auto",
          }}
        >
           <thead className="sticky top-0 z-20 bg-slate-700 shadow-sm">
            <tr className="border-b border-slate-600">
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="sticky top-0 z-20 whitespace-nowrap border-b border-slate-600 bg-slate-700 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-white"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-slate-200"
                >
                  {renderRow(item, index)}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
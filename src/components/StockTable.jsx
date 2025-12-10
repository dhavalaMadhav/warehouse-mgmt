export default function StockTable({ data, columns, onRowClick }) {
  return (
    <div className="border border-black/10 rounded-[5px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-slate-50 border-b border-black/10">
        {columns.map((col, i) => (
          <div 
            key={i}
            className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide"
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {data.map((row, index) => (
          <div
            key={index}
            className="flex items-center border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col, i) => (
              <div 
                key={i}
                className="px-4 py-3 text-sm text-slate-900"
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.render ? col.render(row) : row[col.field]}
              </div>
            ))}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-12 text-black/50">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}


import React from 'react';

interface GridProps {
  activeCell: { row: number; col: string } | null;
  setActiveCell: (cell: { row: number; col: string } | null) => void;
  cellData: { [key: string]: string };
  onCellChange: (row: number, col: string, value: string) => void;
  zoom: number;
}

const Grid = ({ activeCell, setActiveCell, cellData, onCellChange, zoom }: GridProps) => {
  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="relative overflow-auto" style={{ fontSize: `${zoom/100}rem` }}>
      <div className="sticky top-0 z-10 flex">
        <div className="w-10 bg-gray-50 border-r border-b border-grid-border"></div>
        {columns.map((col) => (
          <div
            key={col}
            className="w-32 bg-gray-50 border-r border-b border-grid-border px-2 py-1 text-sm text-gray-600"
          >
            {col}
          </div>
        ))}
      </div>
      
      {rows.map((row) => (
        <div key={row} className="flex">
          <div className="sticky left-0 w-10 bg-gray-50 border-r border-b border-grid-border flex items-center justify-center text-sm text-gray-600">
            {row}
          </div>
          {columns.map((col) => (
            <div
              key={`${col}${row}`}
              className="w-32 border-r border-b border-grid-border relative"
            >
              <input
                type="text"
                className="cell-input"
                value={cellData[`${col}${row}`] || ''}
                onChange={(e) => onCellChange(row, col, e.target.value)}
                onFocus={() => setActiveCell({ row, col })}
                onBlur={() => setActiveCell(null)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;

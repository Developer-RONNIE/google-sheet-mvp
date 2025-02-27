
import React from 'react';

interface FormulaBarProps {
  activeCell: { row: number; col: string } | null;
  cellData: { [key: string]: string };
  onCellChange: (row: number, col: string, value: string) => void;
}

const FormulaBar = ({ activeCell, cellData, onCellChange }: FormulaBarProps) => {
  const cellValue = activeCell ? cellData[`${activeCell.col}${activeCell.row}`] || '' : '';
  
  return (
    <div className="border-b border-gray-200 p-2 flex items-center space-x-2 bg-white">
      <div className="text-sm text-gray-500 w-20">
        {activeCell ? `${activeCell.col}${activeCell.row}` : ''}
      </div>
      <input
        type="text"
        className="flex-1 px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={cellValue}
        onChange={(e) => 
          activeCell && onCellChange(activeCell.row, activeCell.col, e.target.value)
        }
        placeholder="Enter a value or formula"
      />
    </div>
  );
};

export default FormulaBar;


import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridProps {
  activeCell: { row: number; col: string } | null;
  setActiveCell: (cell: { row: number; col: string } | null) => void;
  cellData: { [key: string]: string };
  onCellChange: (row: number, col: string, value: string) => void;
  zoom: number;
}

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
}

type CellDataWithFormat = {
  value: string;
  format?: CellFormat;
  formula?: string;
};

type EnhancedCellData = {
  [key: string]: CellDataWithFormat;
};

const Grid = ({ activeCell, setActiveCell, cellData, onCellChange, zoom }: GridProps) => {
  const [columns, setColumns] = useState(Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)));
  const [rows, setRows] = useState(Array.from({ length: 100 }, (_, i) => i + 1));
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: string } | null>(null);
  const [isDraggingRowDivider, setIsDraggingRowDivider] = useState(false);
  const [isDraggingColDivider, setIsDraggingColDivider] = useState(false);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [rowHeights, setRowHeights] = useState<{[key: number]: number}>({});
  const [colWidths, setColWidths] = useState<{[key: string]: number}>({});
  const [startResizePosition, setStartResizePosition] = useState(0);
  const [startSize, setStartSize] = useState(0);
  const [selectedCells, setSelectedCells] = useState<{[key: string]: boolean}>({});
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Enhanced cell data with formatting
  const getEnhancedCellData = (rowIndex: number, col: string): CellDataWithFormat => {
    const cellKey = `${col}${rowIndex}`;
    const rawData = cellData[cellKey] || '';
    
    // For simplicity, we'll parse any JSON-formatted string as potential formatting data
    // In a real implementation, you'd have a more robust system
    if (rawData.startsWith('{') && rawData.endsWith('}')) {
      try {
        return JSON.parse(rawData);
      } catch (e) {
        return { value: rawData };
      }
    }
    
    return { value: rawData };
  };

  // Calculate cell dependencies and update formula results
  const calculateFormula = (formula: string) => {
    // Simple formula parser for demo purposes
    // In a real implementation, you'd use a more robust formula parser
    if (!formula) return '';
    
    // Extract cell references (e.g., A1, B2)
    const cellRefPattern = /[A-Z][0-9]+/g;
    const cellRefs = formula.match(cellRefPattern) || [];
    
    let calculatedFormula = formula;
    
    // Replace cell references with their values
    cellRefs.forEach(cellRef => {
      const col = cellRef.charAt(0);
      const row = parseInt(cellRef.substring(1));
      const cellValue = getEnhancedCellData(row, col).value || '0';
      calculatedFormula = calculatedFormula.replace(cellRef, cellValue);
    });
    
    // Try to evaluate the formula if it's a valid expression
    try {
      // eslint-disable-next-line no-eval
      return eval(calculatedFormula);
    } catch (e) {
      return `#ERROR: ${e}`;
    }
  };

  // Handle cell selection and dragging
  const handleMouseDown = (row: number, col: string, e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    setDragStart({ row, col });
    setDragEnd({ row, col });
    setDragging(true);
    setActiveCell({ row, col });
    
    // Clear previous selection
    setSelectedCells({ [`${col}${row}`]: true });
  };

  const handleMouseMove = (row: number, col: string) => {
    if (!dragging || !dragStart) return;
    
    setDragEnd({ row, col });
    
    // Update selected cells
    const newSelectedCells: {[key: string]: boolean} = {};
    
    const startRow = Math.min(dragStart.row, row);
    const endRow = Math.max(dragStart.row, row);
    const startColIndex = columns.indexOf(dragStart.col);
    const endColIndex = columns.indexOf(col);
    const startCol = columns[Math.min(startColIndex, endColIndex)];
    const endCol = columns[Math.max(startColIndex, endColIndex)];
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = columns.indexOf(startCol); c <= columns.indexOf(endCol); c++) {
        newSelectedCells[`${columns[c]}${r}`] = true;
      }
    }
    
    setSelectedCells(newSelectedCells);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Row and column resizing
  const handleRowDividerMouseDown = (rowIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRowDivider(true);
    setResizingRow(rowIndex);
    setStartResizePosition(e.clientY);
    setStartSize(rowHeights[rowIndex] || 40); // Default height
  };

  const handleColDividerMouseDown = (col: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingColDivider(true);
    setResizingCol(col);
    setStartResizePosition(e.clientX);
    setStartSize(colWidths[col] || 128); // Default width
  };

  const handleMouseMoveGlobal = (e: MouseEvent) => {
    if (isDraggingRowDivider && resizingRow !== null) {
      const diff = e.clientY - startResizePosition;
      const newHeight = Math.max(20, startSize + diff); // Minimum height of 20px
      
      setRowHeights(prev => ({
        ...prev,
        [resizingRow]: newHeight
      }));
    }
    
    if (isDraggingColDivider && resizingCol !== null) {
      const diff = e.clientX - startResizePosition;
      const newWidth = Math.max(50, startSize + diff); // Minimum width of 50px
      
      setColWidths(prev => ({
        ...prev,
        [resizingCol]: newWidth
      }));
    }
  };

  const handleMouseUpGlobal = () => {
    setIsDraggingRowDivider(false);
    setIsDraggingColDivider(false);
    setResizingRow(null);
    setResizingCol(null);
    setDragging(false);
  };

  // Add row or column
  const addRow = (afterIndex: number) => {
    const newRows = [...rows];
    newRows.splice(afterIndex, 0, afterIndex + 0.5);
    setRows(newRows.sort((a, b) => a - b).map((_, i) => i + 1));
  };

  const addColumn = (afterCol: string) => {
    const afterIndex = columns.indexOf(afterCol);
    
    if (afterIndex >= 0 && afterIndex < 25) { // Max 26 columns (A-Z)
      const newColumns = [...columns];
      
      // Shift columns after insertion point
      for (let i = columns.length - 1; i > afterIndex; i--) {
        newColumns[i] = String.fromCharCode(65 + i);
      }
      
      setColumns(newColumns);
    }
  };

  // Delete row or column
  const deleteRow = (rowIndex: number) => {
    setRows(rows.filter(r => r !== rowIndex).map((_, i) => i + 1));
    
    // Remove cell data for this row
    const newCellData = { ...cellData };
    columns.forEach(col => {
      delete newCellData[`${col}${rowIndex}`];
    });
    
    // Update cell data
    // This would need to be handled in the parent component
  };

  const deleteColumn = (col: string) => {
    setColumns(columns.filter(c => c !== col));
    
    // Remove cell data for this column
    const newCellData = { ...cellData };
    rows.forEach(row => {
      delete newCellData[`${col}${row}`];
    });
    
    // Update cell data
    // This would need to be handled in the parent component
  };

  // Effect for global mouse events
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDraggingRowDivider, isDraggingColDivider, resizingRow, resizingCol, startResizePosition, startSize]);

  return (
    <div className="relative overflow-auto" style={{ fontSize: `${zoom/100}rem` }} ref={gridRef}>
      <div className="sticky top-0 z-10 flex">
        <div className="w-10 bg-gray-50 border-r border-b border-grid-border flex justify-center items-center">
          <Plus className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={() => addRow(0)} />
        </div>
        {columns.map((col, index) => (
          <div
            key={col}
            className="bg-gray-50 border-r border-b border-grid-border px-2 py-1 text-sm text-gray-600 relative flex items-center justify-between"
            style={{ width: colWidths[col] || 128 }}
          >
            {col}
            <div className="flex">
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                onMouseDown={(e) => handleColDividerMouseDown(col, e)}
              />
              <div className="ml-2 flex space-x-1">
                <Plus className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" 
                      onClick={() => addColumn(col)} />
                <ArrowRight className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600 rotate-90" 
                       onClick={() => deleteColumn(col)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {rows.map((row) => (
        <div key={row} className="flex">
          <div 
            className="sticky left-0 bg-gray-50 border-r border-b border-grid-border flex items-center justify-between px-2"
            style={{ width: 40, height: rowHeights[row] || 40 }}
          >
            <span className="text-sm text-gray-600">{row}</span>
            <div className="flex flex-col space-y-1">
              <Plus className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" 
                    onClick={() => addRow(row)} />
              <ChevronDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" 
                     onClick={() => deleteRow(row)} />
            </div>
            <div
              className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-400"
              onMouseDown={(e) => handleRowDividerMouseDown(row, e)}
            />
          </div>
          {columns.map((col) => {
            const cellKey = `${col}${row}`;
            const isSelected = selectedCells[cellKey];
            const cellInfo = getEnhancedCellData(row, col);
            const displayValue = cellInfo.formula 
              ? calculateFormula(cellInfo.formula) 
              : cellInfo.value;
            
            return (
              <div
                key={`${col}${row}`}
                className={cn(
                  "border-r border-b border-grid-border relative",
                  isSelected && "bg-blue-50"
                )}
                style={{ 
                  width: colWidths[col] || 128, 
                  height: rowHeights[row] || 40
                }}
                onMouseDown={(e) => handleMouseDown(row, col, e)}
                onMouseMove={() => handleMouseMove(row, col)}
                onMouseUp={handleMouseUp}
              >
                <input
                  type="text"
                  className="cell-input absolute inset-0 w-full h-full"
                  style={{
                    fontWeight: cellInfo.format?.bold ? 'bold' : 'normal',
                    fontStyle: cellInfo.format?.italic ? 'italic' : 'normal',
                    color: cellInfo.format?.color || 'inherit',
                    fontSize: cellInfo.format?.fontSize ? `${cellInfo.format.fontSize}px` : 'inherit',
                  }}
                  value={displayValue || ''}
                  onChange={(e) => onCellChange(row, col, e.target.value)}
                  onFocus={() => setActiveCell({ row, col })}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;

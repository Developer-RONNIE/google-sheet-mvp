
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

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
  dataType?: 'text' | 'number' | 'date' | 'auto';
  validationError?: string;
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
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  // Enhanced cell data with formatting and validation
  const getEnhancedCellData = (rowIndex: number, col: string): CellDataWithFormat => {
    const cellKey = `${col}${rowIndex}`;
    const rawData = cellData[cellKey] || '';
    
    // For simplicity, we'll parse any JSON-formatted string as potential formatting data
    if (rawData.startsWith('{') && rawData.endsWith('}')) {
      try {
        return JSON.parse(rawData);
      } catch (e) {
        return { value: rawData };
      }
    }
    
    return { value: rawData };
  };

  // Determine data type
  const inferDataType = (value: string): 'text' | 'number' | 'date' | 'auto' => {
    if (value === '') return 'auto';
    
    // Check if number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return 'number';
    }
    
    // Check if date
    const dateRegex = /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$|^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
    if (dateRegex.test(value)) {
      return 'date';
    }
    
    return 'text';
  };

  // Validate data based on expected type
  const validateData = (value: string, expectedType?: 'text' | 'number' | 'date' | 'auto'): string | null => {
    if (!expectedType || expectedType === 'auto') {
      return null; // No validation error
    }
    
    const inferredType = inferDataType(value);
    
    if (expectedType === 'number' && inferredType !== 'number') {
      return 'Value must be a number';
    }
    
    if (expectedType === 'date' && inferredType !== 'date') {
      return 'Value must be a valid date (MM/DD/YYYY or YYYY/MM/DD)';
    }
    
    return null; // No validation error
  };

  // Validate before saving cell data
  const validateCellChange = (row: number, col: string, value: string): boolean => {
    const cellKey = `${col}${row}`;
    const cellInfo = getEnhancedCellData(row, col);
    
    if (cellInfo.dataType && cellInfo.dataType !== 'auto') {
      const error = validateData(value, cellInfo.dataType);
      
      if (error) {
        toast({
          title: "Validation Error",
          description: `${cellKey}: ${error}`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  // Get cell value for calculation
  const getCellValue = (cellRef: string): number => {
    // Extract column and row from cell reference (e.g., A1, B2)
    const col = cellRef.charAt(0);
    const row = parseInt(cellRef.substring(1));
    
    // Get cell data
    const cellData = getEnhancedCellData(row, col);
    const value = cellData.value || '0';
    
    // Try to convert to number
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : numValue;
  };
  
  // Parse cell range (e.g., A1:B3)
  const parseCellRange = (range: string): { startCol: string; startRow: number; endCol: string; endRow: number } => {
    const [start, end] = range.split(':');
    
    const startCol = start.charAt(0);
    const startRow = parseInt(start.substring(1));
    const endCol = end.charAt(0);
    const endRow = parseInt(end.substring(1));
    
    return { startCol, startRow, endCol, endRow };
  };
  
  // Get all cells in a range
  const getCellsInRange = (range: string): string[] => {
    const { startCol, startRow, endCol, endRow } = parseCellRange(range);
    
    const startColIndex = columns.indexOf(startCol);
    const endColIndex = columns.indexOf(endCol);
    
    const cells: string[] = [];
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColIndex; c <= endColIndex; c++) {
        cells.push(`${columns[c]}${r}`);
      }
    }
    
    return cells;
  };

  // Mathematical functions
  const mathFunctions = {
    SUM: (range: string): number => {
      const cells = getCellsInRange(range);
      return cells.reduce((sum, cell) => sum + getCellValue(cell), 0);
    },
    
    AVERAGE: (range: string): number => {
      const cells = getCellsInRange(range);
      const sum = cells.reduce((acc, cell) => acc + getCellValue(cell), 0);
      return sum / cells.length;
    },
    
    MAX: (range: string): number => {
      const cells = getCellsInRange(range);
      return Math.max(...cells.map(cell => getCellValue(cell)));
    },
    
    MIN: (range: string): number => {
      const cells = getCellsInRange(range);
      return Math.min(...cells.map(cell => getCellValue(cell)));
    },
    
    COUNT: (range: string): number => {
      const cells = getCellsInRange(range);
      return cells.filter(cell => {
        const value = getCellValue(cell);
        return !isNaN(value);
      }).length;
    }
  };

  // Data quality functions
  const dataQualityFunctions = {
    TRIM: (text: string): string => {
      return text.trim();
    },
    
    UPPER: (text: string): string => {
      return text.toUpperCase();
    },
    
    LOWER: (text: string): string => {
      return text.toLowerCase();
    },
    
    REMOVE_DUPLICATES: (range: string): string => {
      // In a real implementation, this would modify the actual data
      // For now, we'll just return a message
      return `Removing duplicates from ${range}`;
    },
    
    FIND_AND_REPLACE: (range: string, find: string, replace: string): string => {
      // In a real implementation, this would modify the actual data
      // For now, we'll just return a message
      return `Replacing ${find} with ${replace} in ${range}`;
    }
  };

  // Calculate cell dependencies and update formula results
  const calculateFormula = (formula: string) => {
    if (!formula) return '';
    
    // Check for mathematical functions
    const mathFunctionPattern = /(SUM|AVERAGE|MAX|MIN|COUNT)\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g;
    let calculatedFormula = formula;
    
    // Process math functions
    let mathMatch;
    while ((mathMatch = mathFunctionPattern.exec(formula)) !== null) {
      const [fullMatch, funcName, range] = mathMatch;
      
      if (mathFunctions[funcName as keyof typeof mathFunctions]) {
        const result = mathFunctions[funcName as keyof typeof mathFunctions](range);
        calculatedFormula = calculatedFormula.replace(fullMatch, result.toString());
        
        // Store test result
        setTestResults(prev => ({
          ...prev,
          [fullMatch]: result
        }));
      }
    }
    
    // Check for data quality functions
    const trimPattern = /TRIM\(([^)]+)\)/g;
    const upperPattern = /UPPER\(([^)]+)\)/g;
    const lowerPattern = /LOWER\(([^)]+)\)/g;
    
    // Process TRIM
    let trimMatch;
    while ((trimMatch = trimPattern.exec(calculatedFormula)) !== null) {
      const [fullMatch, text] = trimMatch;
      const result = dataQualityFunctions.TRIM(text.replace(/"/g, ''));
      calculatedFormula = calculatedFormula.replace(fullMatch, `"${result}"`);
      
      // Store test result
      setTestResults(prev => ({
        ...prev,
        [fullMatch]: result
      }));
    }
    
    // Process UPPER
    let upperMatch;
    while ((upperMatch = upperPattern.exec(calculatedFormula)) !== null) {
      const [fullMatch, text] = upperMatch;
      const result = dataQualityFunctions.UPPER(text.replace(/"/g, ''));
      calculatedFormula = calculatedFormula.replace(fullMatch, `"${result}"`);
      
      // Store test result
      setTestResults(prev => ({
        ...prev,
        [fullMatch]: result
      }));
    }
    
    // Process LOWER
    let lowerMatch;
    while ((lowerMatch = lowerPattern.exec(calculatedFormula)) !== null) {
      const [fullMatch, text] = lowerMatch;
      const result = dataQualityFunctions.LOWER(text.replace(/"/g, ''));
      calculatedFormula = calculatedFormula.replace(fullMatch, `"${result}"`);
      
      // Store test result
      setTestResults(prev => ({
        ...prev,
        [fullMatch]: result
      }));
    }
    
    // Extract cell references (e.g., A1, B2)
    const cellRefPattern = /[A-Z][0-9]+/g;
    const cellRefs = calculatedFormula.match(cellRefPattern) || [];
    
    // Replace cell references with their values
    cellRefs.forEach(cellRef => {
      const col = cellRef.charAt(0);
      const row = parseInt(cellRef.substring(1));
      const cellValue = getEnhancedCellData(row, col).value || '0';
      calculatedFormula = calculatedFormula.replace(cellRef, cellValue);
    });
    
    // Try to evaluate the formula if it's a valid expression
    try {
      if (calculatedFormula.includes('"')) {
        // String result
        return calculatedFormula.replace(/"/g, '');
      } else {
        // Numeric result
        // eslint-disable-next-line no-eval
        return eval(calculatedFormula);
      }
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

  // Handle cell input change with validation
  const handleCellChange = (row: number, col: string, value: string) => {
    // Perform validation if needed
    if (validateCellChange(row, col, value)) {
      // Update the cell data
      onCellChange(row, col, value);
      
      // Auto-detect and update data type
      const dataType = inferDataType(value);
      const cellKey = `${col}${row}`;
      const cellInfo = getEnhancedCellData(row, col);
      
      // Only update type if it's currently auto or not set
      if (!cellInfo.dataType || cellInfo.dataType === 'auto') {
        const updatedCellInfo = {
          ...cellInfo,
          value,
          dataType
        };
        
        onCellChange(row, col, JSON.stringify(updatedCellInfo));
      }
    }
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

  // Set data type for a cell
  const setCellDataType = (row: number, col: string, dataType: 'text' | 'number' | 'date' | 'auto') => {
    const cellKey = `${col}${row}`;
    const cellInfo = getEnhancedCellData(row, col);
    
    const updatedCellInfo = {
      ...cellInfo,
      dataType
    };
    
    onCellChange(row, col, JSON.stringify(updatedCellInfo));
    
    toast({
      title: "Data Type Set",
      description: `Cell ${cellKey} is now type: ${dataType}`,
    });
  };

  // Test formula on sample data
  const testFormula = (formula: string) => {
    try {
      const result = calculateFormula(formula);
      
      toast({
        title: "Formula Test Result",
        description: `${formula} = ${result}`,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Formula Error",
        description: `Error in formula: ${error}`,
        variant: "destructive"
      });
      
      return `#ERROR: ${error}`;
    }
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

  // Get the CSS class for cell based on data type
  const getCellTypeClass = (row: number, col: string): string => {
    const cellInfo = getEnhancedCellData(row, col);
    
    switch (cellInfo.dataType) {
      case 'number':
        return 'bg-blue-50';
      case 'date':
        return 'bg-green-50';
      case 'text':
        return '';
      default:
        // Auto-detect based on content
        const value = cellInfo.value || '';
        const inferredType = inferDataType(value);
        
        switch (inferredType) {
          case 'number':
            return 'bg-blue-50 bg-opacity-30';
          case 'date':
            return 'bg-green-50 bg-opacity-30';
          default:
            return '';
        }
    }
  };

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
            const typeClass = getCellTypeClass(row, col);
            
            return (
              <div
                key={`${col}${row}`}
                className={cn(
                  "border-r border-b border-grid-border relative",
                  isSelected && "bg-blue-100",
                  typeClass,
                  cellInfo.validationError && "border-red-500 border-2"
                )}
                style={{ 
                  width: colWidths[col] || 128, 
                  height: rowHeights[row] || 40
                }}
                onMouseDown={(e) => handleMouseDown(row, col, e)}
                onMouseMove={() => handleMouseMove(row, col)}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const menu = document.createElement('div');
                  menu.className = 'context-menu';
                  menu.innerHTML = `
                    <div class='set-type'>
                      <div onclick="setType('${row}', '${col}', 'text')">Set as Text</div>
                      <div onclick="setType('${row}', '${col}', 'number')">Set as Number</div>
                      <div onclick="setType('${row}', '${col}', 'date')">Set as Date</div>
                      <div onclick="setType('${row}', '${col}', 'auto')">Auto-detect</div>
                    </div>
                  `;
                  // Custom context menu would be implemented here in a real app
                }}
              >
                <input
                  type="text"
                  className={cn(
                    "cell-input absolute inset-0 w-full h-full",
                    cellInfo.validationError && "border-red-500"
                  )}
                  style={{
                    fontWeight: cellInfo.format?.bold ? 'bold' : 'normal',
                    fontStyle: cellInfo.format?.italic ? 'italic' : 'normal',
                    color: cellInfo.format?.color || 'inherit',
                    fontSize: cellInfo.format?.fontSize ? `${cellInfo.format.fontSize}px` : 'inherit',
                  }}
                  value={displayValue || ''}
                  onChange={(e) => handleCellChange(row, col, e.target.value)}
                  onFocus={() => setActiveCell({ row, col })}
                  title={cellInfo.dataType ? `Type: ${cellInfo.dataType}` : ''}
                />
                {cellInfo.validationError && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1">
                    !
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;

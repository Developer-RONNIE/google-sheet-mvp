
import React, { useState } from 'react';
import Toolbar from './Toolbar';
import Grid from './Grid';
import FormulaBar from './FormulaBar';
import SheetTabs from './SheetTabs';

const Spreadsheet = () => {
  const [zoom, setZoom] = useState(100);
  const [activeCell, setActiveCell] = useState<{row: number; col: string} | null>(null);
  const [cellData, setCellData] = useState<{[key: string]: string}>({});

  const handleCellChange = (row: number, col: string, value: string) => {
    setCellData(prev => ({
      ...prev,
      `${col}${row}`: value
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar zoom={zoom} setZoom={setZoom} />
      <FormulaBar activeCell={activeCell} cellData={cellData} onCellChange={handleCellChange} />
      <div className="flex-1 overflow-auto">
        <Grid
          activeCell={activeCell}
          setActiveCell={setActiveCell}
          cellData={cellData}
          onCellChange={handleCellChange}
          zoom={zoom}
        />
      </div>
      <SheetTabs />
    </div>
  );
};

export default Spreadsheet;

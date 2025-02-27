
import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
      [`${col}${row}`]: value
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Logo and Auth */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <img 
            src="/placeholder.svg" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="font-semibold text-gray-700">Friendly Sheet</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Guest Mode</span>
          </Button>
          <Button 
            variant="default"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <img 
              src="/placeholder.svg" 
              alt="Google" 
              className="h-4 w-4"
            />
            <span>Sign in with Google</span>
          </Button>
        </div>
      </div>

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

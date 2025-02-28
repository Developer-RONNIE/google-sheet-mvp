
import React, { useState } from 'react';
import { User, FileSpreadsheet, Edit2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Toolbar from './Toolbar';
import Grid from './Grid';
import FormulaBar from './FormulaBar';
import SheetTabs from './SheetTabs';
import TutorialModal from './TutorialModal';

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

const Spreadsheet = () => {
  const [zoom, setZoom] = useState(100);
  const [activeCell, setActiveCell] = useState<{row: number; col: string} | null>(null);
  const [cellData, setCellData] = useState<{[key: string]: string}>({});
  const [fileName, setFileName] = useState("Untitled Spreadsheet");
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleCellChange = (row: number, col: string, value: string) => {
    // Check if value is a formula
    if (value.startsWith('=')) {
      setCellData(prev => ({
        ...prev,
        [`${col}${row}`]: JSON.stringify({
          value: '', // Will be calculated on display
          formula: value.substring(1) // Remove the = sign
        })
      }));
    } else {
      // Regular value
      setCellData(prev => ({
        ...prev,
        [`${col}${row}`]: value
      }));
    }
    
    // Update dependencies (in a real implementation, you'd track cell dependencies)
    updateDependentCells(col, row);
  };
  
  const updateDependentCells = (col: string, row: number) => {
    // In a real implementation, this would update cells that depend on the changed cell
    // For now, this is a placeholder
    console.log(`Cell ${col}${row} updated, should update dependent cells`);
  };

  const handleFormatCell = (format: CellFormat) => {
    if (!activeCell) return;
    
    const { col, row } = activeCell;
    const cellKey = `${col}${row}`;
    const currentData = cellData[cellKey] || '';
    
    // Try to parse existing data as JSON
    let cellInfo: CellDataWithFormat;
    
    try {
      cellInfo = currentData.startsWith('{') && currentData.endsWith('}') 
        ? JSON.parse(currentData) 
        : { value: currentData };
    } catch (e) {
      cellInfo = { value: currentData };
    }
    
    // Apply new formatting
    const newCellInfo = {
      ...cellInfo,
      format: {
        ...cellInfo.format,
        ...format
      }
    };
    
    // Update cell data
    setCellData(prev => ({
      ...prev,
      [cellKey]: JSON.stringify(newCellInfo)
    }));
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const toggleFileNameEdit = () => {
    setIsEditingFileName(!isEditingFileName);
  };

  const saveFileName = () => {
    setIsEditingFileName(false);
  };

  const openTutorial = () => {
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Logo and Auth */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 border-b border-gray-200 bg-white gap-2">
        {/* Logo and Filename - Always on the left, even on mobile */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-start">
          <div className="p-1 bg-green-600 rounded">
            <FileSpreadsheet className="h-6 w-6 text-white" />
          </div>
          
          {isEditingFileName ? (
            <div className="flex items-center">
              <Input
                type="text"
                value={fileName}
                onChange={handleFileNameChange}
                className="h-8 px-2 py-1 text-sm font-semibold"
                autoFocus
                onBlur={saveFileName}
                onKeyDown={(e) => e.key === 'Enter' && saveFileName()}
              />
            </div>
          ) : (
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={toggleFileNameEdit}
            >
              <span className="font-semibold text-gray-700">{fileName}</span>
              <Edit2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Tutorial and Auth Buttons - Now shown on left in mobile, right in desktop */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-start sm:justify-end">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center space-x-1"
            onClick={openTutorial}
          >
            <Info className="h-4 w-4" />
            <span className="ml-1">{isMobile ? "Help" : "Functions Tutorial"}</span>
          </Button>
          
          {isMobile ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=32&h=32&fit=crop" 
                  alt="Google" 
                  className="h-4 w-4 rounded-full"
                />
                <span className="ml-2">Sign in</span>
              </Button>
            </div>
          ) : (
            <>
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
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=32&h=32&fit=crop" 
                  alt="Google" 
                  className="h-4 w-4 rounded-full"
                />
                <span>Sign in with Google</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <Toolbar 
        zoom={zoom} 
        setZoom={setZoom} 
        activeCell={activeCell} 
        onFormatCell={handleFormatCell} 
      />
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

      {/* Tutorial Modal */}
      <TutorialModal isOpen={isTutorialOpen} onClose={closeTutorial} />
    </div>
  );
};

export default Spreadsheet;

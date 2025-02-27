
import React, { useState } from 'react';
import { User, FileSpreadsheet, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Toolbar from './Toolbar';
import Grid from './Grid';
import FormulaBar from './FormulaBar';
import SheetTabs from './SheetTabs';

const Spreadsheet = () => {
  const [zoom, setZoom] = useState(100);
  const [activeCell, setActiveCell] = useState<{row: number; col: string} | null>(null);
  const [cellData, setCellData] = useState<{[key: string]: string}>({});
  const [fileName, setFileName] = useState("Untitled Spreadsheet");
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const isMobile = useIsMobile();

  const handleCellChange = (row: number, col: string, value: string) => {
    setCellData(prev => ({
      ...prev,
      [`${col}${row}`]: value
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Logo and Auth */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-b border-gray-200 bg-white gap-2">
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
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
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
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

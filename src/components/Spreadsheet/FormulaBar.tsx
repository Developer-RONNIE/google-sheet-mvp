
import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FormulaBarProps {
  activeCell: { row: number; col: string } | null;
  cellData: { [key: string]: string };
  onCellChange: (row: number, col: string, value: string) => void;
}

const FormulaBar = ({ activeCell, cellData, onCellChange }: FormulaBarProps) => {
  const [editValue, setEditValue] = useState('');
  const [testMode, setTestMode] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (activeCell) {
      const cellKey = `${activeCell.col}${activeCell.row}`;
      const rawData = cellData[cellKey] || '';
      
      // Check if this is JSON (format + value)
      if (rawData.startsWith('{') && rawData.endsWith('}')) {
        try {
          const parsed = JSON.parse(rawData);
          
          // If it's a formula, show it with the = prefix
          if (parsed.formula) {
            setEditValue(`=${parsed.formula}`);
          } else {
            setEditValue(parsed.value || '');
          }
        } catch (e) {
          setEditValue(rawData);
        }
      } else {
        setEditValue(rawData);
      }
    } else {
      setEditValue('');
    }
  }, [activeCell, cellData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeCell) {
      onCellChange(activeCell.row, activeCell.col, editValue);
    }
  };
  
  const handleBlur = () => {
    if (activeCell) {
      onCellChange(activeCell.row, activeCell.col, editValue);
    }
  };
  
  const testFormula = () => {
    if (!editValue.startsWith('=')) {
      toast({
        title: "Formula Required",
        description: "Enter a formula starting with = to test",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real implementation, this would use a proper formula parser
      const formula = editValue.substring(1);
      
      // Show that test mode is active
      setTestMode(true);
      
      // Apply the formula to the current cell
      if (activeCell) {
        onCellChange(activeCell.row, activeCell.col, editValue);
        
        // Show test notification
        toast({
          title: "Formula Test",
          description: `Formula applied: ${editValue}`,
        });
      }
      
      // Reset test mode after a delay
      setTimeout(() => {
        setTestMode(false);
      }, 3000);
    } catch (e) {
      toast({
        title: "Formula Error",
        description: `Error testing formula: ${e}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="border-b border-gray-200 p-2 flex items-center space-x-2 bg-white">
      <div className="text-sm text-gray-500 w-20">
        {activeCell ? `${activeCell.col}${activeCell.row}` : ''}
      </div>
      <div className="relative flex-1">
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
          {editValue.startsWith('=') ? 'ƒx' : ''}
        </span>
        <input
          type="text"
          className={`w-full px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${editValue.startsWith('=') ? 'pl-8' : 'pl-2'} ${testMode ? 'bg-yellow-50' : ''}`}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter a value or formula (start with =)"
        />
      </div>
      
      {editValue.startsWith('=') && (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center"
          onClick={testFormula}
        >
          <Play className="h-4 w-4 mr-1" />
          Test
        </Button>
      )}
    </div>
  );
};

export default FormulaBar;

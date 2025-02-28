
import React, { useState, useEffect } from 'react';
import { Play, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormulaBarProps {
  activeCell: { row: number; col: string } | null;
  cellData: { [key: string]: string };
  onCellChange: (row: number, col: string, value: string) => void;
}

const FormulaBar = ({ activeCell, cellData, onCellChange }: FormulaBarProps) => {
  const [editValue, setEditValue] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [resultValue, setResultValue] = useState<string | number>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Calculate result from formula or get value
  const calculateResult = (value: string) => {
    if (!value.startsWith('=')) {
      return value;
    }
    
    try {
      // Get formula part without the = sign
      const formula = value.substring(1);
      
      // Process formula to get result
      // This is a simplistic implementation; in a real app, you'd use a proper formula parser
      let result = '';
      
      // Check for SUM function
      const sumMatch = formula.match(/SUM\(([A-Z][0-9]+:[A-Z][0-9]+)\)/);
      if (sumMatch) {
        result = 'SUM result';
      } 
      // Check for AVERAGE function
      else if (formula.match(/AVERAGE\(([A-Z][0-9]+:[A-Z][0-9]+)\)/)) {
        result = 'AVERAGE result';
      }
      // Check for MAX function
      else if (formula.match(/MAX\(([A-Z][0-9]+:[A-Z][0-9]+)\)/)) {
        result = 'MAX result';
      }
      // Check for MIN function
      else if (formula.match(/MIN\(([A-Z][0-9]+:[A-Z][0-9]+)\)/)) {
        result = 'MIN result';
      }
      // Check for COUNT function
      else if (formula.match(/COUNT\(([A-Z][0-9]+:[A-Z][0-9]+)\)/)) {
        result = 'COUNT result';
      }
      // Check for TRIM function
      else if (formula.match(/TRIM\("([^"]*)"\)/)) {
        result = 'TRIM result';
      }
      // Check for UPPER function
      else if (formula.match(/UPPER\("([^"]*)"\)/)) {
        result = 'UPPER result';
      }
      // Check for LOWER function
      else if (formula.match(/LOWER\("([^"]*)"\)/)) {
        result = 'LOWER result';
      }
      // Simple math expression
      else {
        try {
          // For simple math expressions, try to evaluate
          result = eval(formula);
        } catch (e) {
          result = '#ERROR';
        }
      }
      
      return result;
    } catch (e) {
      return '#ERROR';
    }
  };
  
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
            const formulaWithEq = `=${parsed.formula}`;
            setEditValue(formulaWithEq);
            setResultValue(calculateResult(formulaWithEq));
          } else {
            setEditValue(parsed.value || '');
            setResultValue(parsed.value || '');
          }
        } catch (e) {
          setEditValue(rawData);
          setResultValue(rawData);
        }
      } else {
        setEditValue(rawData);
        setResultValue(rawData);
      }
    } else {
      setEditValue('');
      setResultValue('');
    }
  }, [activeCell, cellData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    setResultValue(calculateResult(e.target.value));
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
    <div className="border-b border-gray-200 p-2 flex flex-wrap md:flex-nowrap items-center gap-2 bg-white">
      <div className="text-sm text-gray-500 w-20 flex-shrink-0">
        {activeCell ? `${activeCell.col}${activeCell.row}` : ''}
      </div>
      
      {/* New Result Display Section */}
      <div className="flex items-center bg-gray-50 rounded-md px-3 py-1 w-full md:w-auto md:min-w-[120px] md:max-w-[180px]">
        <Calculator className="h-4 w-4 text-gray-400 mr-2" />
        <div className="font-mono text-sm truncate">
          {editValue.startsWith('=') ? (
            <span className="text-blue-600">{resultValue}</span>
          ) : (
            <span className="text-gray-600">{resultValue}</span>
          )}
        </div>
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

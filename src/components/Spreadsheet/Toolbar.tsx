
import React, { useState } from 'react';
import { 
  Undo2, Redo2, Printer, ZoomIn, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, Table, PlusSquare, 
  MinusSquare, ChevronDown, Type, Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  activeCell: { row: number; col: string } | null;
  onFormatCell: (format: { bold?: boolean; italic?: boolean; color?: string; fontSize?: number }) => void;
}

const Toolbar = ({ zoom, setZoom, activeCell, onFormatCell }: ToolbarProps) => {
  const [fontColor, setFontColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(11);
  
  const handleFontSizeChange = (value: string) => {
    const size = parseInt(value);
    setFontSize(size);
    onFormatCell({ fontSize: size });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontColor(e.target.value);
    onFormatCell({ color: e.target.value });
  };
  
  const toggleBold = () => {
    onFormatCell({ bold: true });
  };
  
  const toggleItalic = () => {
    onFormatCell({ italic: true });
  };

  return (
    <div className="border-b border-gray-200 bg-toolbar-bg p-2 flex flex-wrap items-center space-x-2">
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button className="toolbar-button" aria-label="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Redo">
          <Redo2 className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Print">
          <Printer className="w-4 h-4" />
        </button>
      </div>
      
      <Select value={zoom.toString()} onValueChange={(value) => setZoom(Number(value))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder={`${zoom}%`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="50">50%</SelectItem>
          <SelectItem value="75">75%</SelectItem>
          <SelectItem value="100">100%</SelectItem>
          <SelectItem value="125">125%</SelectItem>
          <SelectItem value="150">150%</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
        <button 
          className="toolbar-button" 
          aria-label="Bold"
          onClick={toggleBold}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          className="toolbar-button" 
          aria-label="Italic"
          onClick={toggleItalic}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Underline">
          <Underline className="w-4 h-4" />
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-button" aria-label="Text Color">
              <Type className="w-4 h-4" />
              <div 
                className="w-2 h-2 rounded-full ml-1" 
                style={{ backgroundColor: fontColor }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Text Color</p>
              <Input 
                type="color" 
                value={fontColor} 
                onChange={handleColorChange}
                className="w-full h-8"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                  <div 
                    key={color}
                    className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setFontColor(color);
                      onFormatCell({ color });
                    }}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Select 
          value={fontSize.toString()} 
          onValueChange={handleFontSizeChange}
        >
          <SelectTrigger className="w-[60px]">
            <SelectValue placeholder={fontSize} />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
        <button className="toolbar-button" aria-label="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="toolbar-button border-l border-gray-200 pl-2" aria-label="Table Options">
            <Table className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <PlusSquare className="w-4 h-4 mr-2" />
              Insert Row
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <MinusSquare className="w-4 h-4 mr-2" />
              Delete Row
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <PlusSquare className="w-4 h-4 mr-2" />
              Insert Column
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <MinusSquare className="w-4 h-4 mr-2" />
              Delete Column
            </Button>
            <hr className="my-2" />
            <Button variant="ghost" className="w-full justify-start text-red-500" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Contents
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Toolbar;

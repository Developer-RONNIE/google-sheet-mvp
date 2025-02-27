
import React from 'react';
import { 
  Undo2, Redo2, Printer, ZoomIn, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, Table
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

const Toolbar = ({ zoom, setZoom }: ToolbarProps) => {
  return (
    <div className="border-b border-gray-200 bg-toolbar-bg p-2 flex items-center space-x-2">
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
        <button className="toolbar-button" aria-label="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button className="toolbar-button" aria-label="Underline">
          <Underline className="w-4 h-4" />
        </button>
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

      <button className="toolbar-button border-l border-gray-200 pl-2" aria-label="Insert Table">
        <Table className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toolbar;

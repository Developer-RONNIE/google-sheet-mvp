
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const SheetTabs = () => {
  const [sheets, setSheets] = useState(['Sheet1']);
  const [activeSheet, setActiveSheet] = useState('Sheet1');

  const addNewSheet = () => {
    const newSheetNumber = sheets.length + 1;
    const newSheetName = `Sheet${newSheetNumber}`;
    setSheets([...sheets, newSheetName]);
    setActiveSheet(newSheetName);
  };

  return (
    <div className="border-t border-gray-200 bg-white flex items-center">
      {sheets.map((sheet) => (
        <div
          key={sheet}
          className={`sheet-tab ${
            activeSheet === sheet ? 'bg-blue-50 text-blue-600' : ''
          }`}
          onClick={() => setActiveSheet(sheet)}
        >
          {sheet}
        </div>
      ))}
      <button
        onClick={addNewSheet}
        className="p-2 hover:bg-gray-100 transition-colors"
        aria-label="Add new sheet"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SheetTabs;

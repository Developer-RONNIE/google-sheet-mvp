
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Spreadsheet Functions Tutorial</DialogTitle>
          <DialogDescription>
            Learn how to use mathematical and data quality functions in your spreadsheet.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="intro" className="w-full mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="intro">Introduction</TabsTrigger>
            <TabsTrigger value="math">Mathematical Functions</TabsTrigger>
            <TabsTrigger value="data">Data Quality Functions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Getting Started with Formulas</h3>
            <p>To use functions in the spreadsheet, follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Select a cell where you want the formula result to appear</li>
              <li>Type <code className="bg-gray-100 px-1 rounded">=</code> to start a formula</li>
              <li>Type the function name in UPPERCASE (e.g., <code className="bg-gray-100 px-1 rounded">SUM</code>)</li>
              <li>Add parentheses and required arguments</li>
              <li>Press Enter to calculate the result</li>
            </ol>
            
            <h3 className="text-lg font-medium mt-6">Cell References</h3>
            <p>You can reference other cells in your formulas:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Single cell: <code className="bg-gray-100 px-1 rounded">A1</code></li>
              <li>Cell range: <code className="bg-gray-100 px-1 rounded">A1:B5</code> (from cell A1 to cell B5)</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-6">
              <p className="text-sm">For example, to sum values from cells A1 through A5, use:</p>
              <p className="font-mono bg-white p-2 rounded mt-2">=SUM(A1:A5)</p>
            </div>
          </TabsContent>
          
          <TabsContent value="math" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Mathematical Functions</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">SUM</td>
                    <td className="px-6 py-4">Calculates the sum of values in a range</td>
                    <td className="px-6 py-4 font-mono">=SUM(A1:A5)</td>
                    <td className="px-6 py-4">Sum of all values in cells A1 through A5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">AVERAGE</td>
                    <td className="px-6 py-4">Calculates the average of values in a range</td>
                    <td className="px-6 py-4 font-mono">=AVERAGE(B1:B10)</td>
                    <td className="px-6 py-4">Average of all values in cells B1 through B10</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">MAX</td>
                    <td className="px-6 py-4">Returns the maximum value in a range</td>
                    <td className="px-6 py-4 font-mono">=MAX(C1:C20)</td>
                    <td className="px-6 py-4">Highest value in cells C1 through C20</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">MIN</td>
                    <td className="px-6 py-4">Returns the minimum value in a range</td>
                    <td className="px-6 py-4 font-mono">=MIN(D1:D20)</td>
                    <td className="px-6 py-4">Lowest value in cells D1 through D20</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">COUNT</td>
                    <td className="px-6 py-4">Counts the number of cells with numerical values</td>
                    <td className="px-6 py-4 font-mono">=COUNT(A1:A10)</td>
                    <td className="px-6 py-4">Number of cells with numerical values in the range</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-md mt-6">
              <p className="font-medium">Tips for Mathematical Functions:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Mathematical functions only work with numerical values</li>
                <li>Text values are treated as 0 in calculations</li>
                <li>You can nest functions within other functions</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Data Quality Functions</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">TRIM</td>
                    <td className="px-6 py-4">Removes leading and trailing spaces</td>
                    <td className="px-6 py-4 font-mono">=TRIM("  hello  ")</td>
                    <td className="px-6 py-4">hello</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">UPPER</td>
                    <td className="px-6 py-4">Converts text to uppercase</td>
                    <td className="px-6 py-4 font-mono">=UPPER("hello")</td>
                    <td className="px-6 py-4">HELLO</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">LOWER</td>
                    <td className="px-6 py-4">Converts text to lowercase</td>
                    <td className="px-6 py-4 font-mono">=LOWER("HELLO")</td>
                    <td className="px-6 py-4">hello</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">REMOVE_DUPLICATES</td>
                    <td className="px-6 py-4">Removes duplicate rows from a range</td>
                    <td className="px-6 py-4 font-mono">=REMOVE_DUPLICATES(A1:B5)</td>
                    <td className="px-6 py-4">Range with duplicates removed</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">FIND_AND_REPLACE</td>
                    <td className="px-6 py-4">Replaces text in a range</td>
                    <td className="px-6 py-4 font-mono">=FIND_AND_REPLACE(A1:B5, "old", "new")</td>
                    <td className="px-6 py-4">Range with "old" replaced by "new"</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md mt-6">
              <p className="font-medium">Tips for Data Quality Functions:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Text string arguments should be enclosed in double quotes</li>
                <li>TRIM, UPPER, and LOWER functions work with text values</li>
                <li>REMOVE_DUPLICATES compares entire rows for duplicates</li>
                <li>FIND_AND_REPLACE is case-sensitive by default</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close Tutorial</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;

"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { ScissorsIcon, Loader2, Download, FileCheck, Eye } from "lucide-react";

export default function PDFSplitter({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);
  const [splitPdfName, setSplitPdfName] = useState("split.pdf");
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState("");
  const [error, setError] = useState(null);
  const [splitMode, setSplitMode] = useState("extract"); // extract or split

  // Load PDF info when file changes
  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        if (!file) return;
        
        // Reset state
        setSplitPdfUrl(null);
        setError(null);
        
        // Load the PDF document to get page count
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
        
        // Set default selection to all pages
        setSelectedPages(`1-${pdfDoc.getPageCount()}`);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF file. Please ensure the file is a valid PDF document.");
      }
    };
    
    loadPdfInfo();
  }, [file]);

  const parsePageRanges = (input) => {
    if (!input.trim()) return [];
    
    const pages = new Set();
    const ranges = input.split(",").map(range => range.trim());
    
    for (const range of ranges) {
      if (range.includes("-")) {
        // Handle range like "1-5"
        const [start, end] = range.split("-").map(Number);
        if (isNaN(start) || isNaN(end)) continue;
        
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i > 0 && i <= pageCount) pages.add(i);
        }
      } else {
        // Handle single page like "3"
        const pageNum = Number(range);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pageCount) {
          pages.add(pageNum);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Get the selected pages
      const pagesToExtract = parsePageRanges(selectedPages);
      
      if (pagesToExtract.length === 0) {
        setError("Please select at least one valid page to extract.");
        setIsProcessing(false);
        return;
      }
      
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy selected pages to the new document
      for (const pageNum of pagesToExtract) {
        // Adjust for 0-based index
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Serialize the new PDF to bytes
      const newPdfBytes = await newPdfDoc.save();
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([newPdfBytes], { type: "application/pdf" });
      
      // Generate URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      
      if (splitMode === "extract") {
        setSplitPdfName(`extracted_pages_${timestamp}.pdf`);
      } else {
        setSplitPdfName(`split_${timestamp}.pdf`);
      }
      
      setSplitPdfUrl(url);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error splitting PDF:", err);
      setError("Failed to split PDF. Please ensure the file is a valid PDF document.");
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    setSelectedPages(e.target.value);
    // Reset result when input changes
    setSplitPdfUrl(null);
  };

  const handleModeChange = (mode) => {
    setSplitMode(mode);
    setSplitPdfUrl(null);
  };

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Split PDF</h2>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileCheck className="text-green-500 mr-2" size={20} />
            <div className="flex-1 truncate">{file.name}</div>
            <div className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total pages: {pageCount}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => handleModeChange("extract")}
              className={`py-2 px-4 font-medium ${
                splitMode === "extract" 
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Extract Pages
            </button>
            <button
              onClick={() => handleModeChange("split")}
              className={`py-2 px-4 font-medium ${
                splitMode === "split" 
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Split by Ranges
            </button>
          </div>
          
          <div className="mt-4">
            {splitMode === "extract" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages to extract (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  type="text"
                  value={selectedPages}
                  onChange={handleInputChange}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter page numbers or ranges separated by commas.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Split document by page ranges
                </label>
                <input
                  type="text"
                  value={selectedPages}
                  onChange={handleInputChange}
                  placeholder="e.g., 1-3, 4-8, 9-12"
                  className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter page ranges separated by commas to split into multiple documents.
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {!splitPdfUrl && (
          <button
            onClick={splitPdf}
            disabled={isProcessing || pageCount === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-blue-300 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <ScissorsIcon className="mr-2" size={20} />
                {splitMode === "extract" ? "Extract Pages" : "Split PDF"}
              </>
            )}
          </button>
        )}

        {splitPdfUrl && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={splitPdfUrl}
                download={splitPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download {splitMode === "extract" ? "Extracted" : "Split"} PDF
              </a>
              
              <button
                onClick={() => window.open(splitPdfUrl, '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Eye className="mr-2" size={20} />
                Preview
              </button>
            </div>
            
            <button
              onClick={splitPdf}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md"
            >
              Regenerate
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          All processing happens in your browser. Your files are never uploaded to any server.
        </div>
      </div>
    </div>
  );
}
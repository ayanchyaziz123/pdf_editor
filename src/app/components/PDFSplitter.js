"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { 
  Scissors, 
  Loader2, 
  Download, 
  FileCheck, 
  Eye, 
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info
} from "lucide-react";

export default function PDFSplitter({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResults, setSplitResults] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState("");
  const [error, setError] = useState(null);
  const [splitMode, setSplitMode] = useState("extract");
  const [validationError, setValidationError] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Load PDF info when file changes
  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        if (!file) return;
        
        setIsLoadingPdf(true);
        setSplitResults([]);
        setError(null);
        setValidationError(null);
        
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        setSelectedPages(`1-${count}`);
        
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Unable to load PDF file. Please ensure you've selected a valid PDF document.");
      } finally {
        setIsLoadingPdf(false);
      }
    };
    
    loadPdfInfo();
  }, [file]);

  const parsePageRanges = (input) => {
    if (!input.trim()) return { pages: [], error: "Please specify page numbers or ranges." };
    
    const pages = new Set();
    const ranges = input.split(",").map(range => range.trim()).filter(Boolean);
    
    try {
      for (const range of ranges) {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(s => s.trim()).map(Number);
          
          if (isNaN(start) || isNaN(end)) {
            return { pages: [], error: `Invalid range format: "${range}". Use format like "1-5".` };
          }
          
          if (start < 1 || end > pageCount || start > end) {
            return { pages: [], error: `Invalid range "${range}". Pages must be between 1-${pageCount} and start ≤ end.` };
          }
          
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        } else {
          const pageNum = Number(range);
          if (isNaN(pageNum)) {
            return { pages: [], error: `"${range}" is not a valid page number.` };
          }
          
          if (pageNum < 1 || pageNum > pageCount) {
            return { pages: [], error: `Page ${pageNum} is out of range. Document has ${pageCount} pages.` };
          }
          
          pages.add(pageNum);
        }
      }
      
      return { pages: Array.from(pages).sort((a, b) => a - b), error: null };
    } catch (err) {
      return { pages: [], error: "Invalid page selection format.", err };
    }
  };

  const splitPdf = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSplitResults([]);
      
      const { pages: pagesToExtract, error: parseError } = parsePageRanges(selectedPages);
      
      if (parseError) {
        setValidationError(parseError);
        setIsProcessing(false);
        return;
      }
      
      if (pagesToExtract.length === 0) {
        setValidationError("Please select at least one page to process.");
        setIsProcessing(false);
        return;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      if (splitMode === "extract") {
        // Extract selected pages into one document
        const newPdfDoc = await PDFDocument.create();
        
        for (const pageNum of pagesToExtract) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
          newPdfDoc.addPage(copiedPage);
        }
        
        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
        const fileName = `extracted_pages_${pagesToExtract.join('-')}_${timestamp}.pdf`;
        
        setSplitResults([{
          url,
          fileName,
          pageRange: pagesToExtract.join(', '),
          pageCount: pagesToExtract.length
        }]);
        
      } else {
        // Split into multiple documents based on ranges
        const ranges = selectedPages.split(",").map(range => range.trim()).filter(Boolean);
        const results = [];
        
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const { pages: rangePages } = parsePageRanges(range);
          
          if (rangePages.length > 0) {
            const newPdfDoc = await PDFDocument.create();
            
            for (const pageNum of rangePages) {
              const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
              newPdfDoc.addPage(copiedPage);
            }
            
            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
            const fileName = `split_part_${i + 1}_pages_${rangePages.join('-')}_${timestamp}.pdf`;
            
            results.push({
              url,
              fileName,
              pageRange: rangePages.join('-'),
              pageCount: rangePages.length,
              partNumber: i + 1
            });
          }
        }
        
        setSplitResults(results);
      }
      
      setValidationError(null);
      
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("An error occurred while processing the PDF. Please try again or check your file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedPages(value);
    setSplitResults([]);
    
    // Real-time validation
    if (value.trim() && pageCount > 0) {
      const { error } = parsePageRanges(value);
      setValidationError(error);
    } else {
      setValidationError(null);
    }
  };

  const handleModeChange = (mode) => {
    setSplitMode(mode);
    setSplitResults([]);
    setValidationError(null);
  };

  const resetAll = () => {
    setSplitResults([]);
    setError(null);
    setValidationError(null);
    if (pageCount > 0) {
      setSelectedPages(`1-${pageCount}`);
    }
  };

  if (!file) {
    return (
      <div className="mt-8 mb-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No PDF Selected</h2>
          <p className="text-gray-600">Please select a PDF file to begin splitting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Document Splitter</h2>
          <p className="text-gray-600">Extract specific pages or split your PDF into multiple documents</p>
        </div>

        <div className="p-8">
          {/* File Info */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileCheck className="text-green-600 flex-shrink-0" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      {isLoadingPdf ? (
                        <div className="flex items-center">
                          <Loader2 className="animate-spin mr-1" size={16} />
                          Loading pages...
                        </div>
                      ) : (
                        <span className="flex items-center">
                          <FileText className="mr-1" size={16} />
                          {pageCount} pages
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {pageCount > 0 && (
            <>
              {/* Mode Selection */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => handleModeChange("extract")}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        splitMode === "extract" 
                          ? "border-blue-600 text-blue-600" 
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Extract Pages
                    </button>
                    <button
                      onClick={() => handleModeChange("split")}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        splitMode === "split" 
                          ? "border-blue-600 text-blue-600" 
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Split Document
                    </button>
                  </nav>
                </div>
                
                {/* Mode Description */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                      {splitMode === "extract" ? (
                        <p><strong>Extract Pages:</strong> Creates a single PDF containing only the pages you specify.</p>
                      ) : (
                        <p><strong>Split Document:</strong> Creates multiple PDF files, each containing the page ranges you specify.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {splitMode === "extract" ? "Pages to Extract" : "Split Ranges"}
                </label>
                <input
                  type="text"
                  value={selectedPages}
                  onChange={handleInputChange}
                  placeholder={splitMode === "extract" ? "e.g., 1-3, 5, 7-9" : "e.g., 1-3, 4-8, 9-12"}
                  className={`block w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    validationError 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } focus:ring-2 focus:ring-opacity-20`}
                  disabled={isProcessing}
                />
                
                {validationError ? (
                  <div className="mt-2 flex items-start space-x-2 text-sm text-red-600">
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                    <span>{validationError}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">
                    {splitMode === "extract" 
                      ? "Enter page numbers or ranges separated by commas (e.g., 1-3, 5, 7-9)"
                      : "Enter page ranges separated by commas to create multiple documents"
                    }
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {splitResults.length === 0 && (
                <div className="flex space-x-4 mb-8">
                  <button
                    onClick={splitPdf}
                    disabled={isProcessing || validationError || !selectedPages.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Processing PDF...
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2" size={20} />
                        {splitMode === "extract" ? "Extract Pages" : "Split PDF"}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetAll}
                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center"
                  >
                    <RefreshCw className="mr-2" size={16} />
                    Reset
                  </button>
                </div>
              )}

              {/* Results */}
              {splitResults.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">
                      {splitMode === "extract" 
                        ? "Pages extracted successfully!" 
                        : `PDF split into ${splitResults.length} documents successfully!`
                      }
                    </span>
                  </div>

                  <div className="space-y-4">
                    {splitResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {splitMode === "split" ? `Part ${result.partNumber}` : "Extracted Document"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Pages {result.pageRange} • {result.pageCount} page{result.pageCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <a
                            href={result.url}
                            download={result.fileName}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                          >
                            <Download className="mr-2" size={16} />
                            Download
                          </a>
                          
                          <button
                            onClick={() => window.open(result.url, '_blank')}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 transition-colors flex items-center justify-center"
                          >
                            <Eye className="mr-2" size={16} />
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={resetAll}
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Process Another Selection
                  </button>
                </div>
              )}
            </>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <CheckCircle2 className="text-green-500" size={16} />
              <span>All processing happens locally in your browser. Your files never leave your device.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
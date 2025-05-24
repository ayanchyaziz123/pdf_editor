"use client";
import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Trash2, Loader2, Download, FileCheck, Eye, Check } from "lucide-react";


export default function PDFPageDeleter({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState(null);
  const [modifiedPdfName, setModifiedPdfName] = useState("modified.pdf");
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [error, setError] = useState(null);
  // const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Load PDF info when file changes
  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        if (!file) return;
        
        // Reset state
        setModifiedPdfUrl(null);
        setError(null);
        setSelectedPages([]);
        
        // Load the PDF document to get page count
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        
        // Create pages array with indexes
        setPages(Array.from({ length: count }, (_, i) => ({
          index: i,
          pageNumber: i + 1,
        })));
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF file. Please ensure the file is a valid PDF document.");
      }
    };
    
    loadPdfInfo();
  }, [file]);

  const togglePageSelection = (pageIndex) => {
    setSelectedPages(prevSelected => {
      if (prevSelected.includes(pageIndex)) {
        return prevSelected.filter(i => i !== pageIndex);
      } else {
        return [...prevSelected, pageIndex];
      }
    });
  };

  const selectAllPages = () => {
    setSelectedPages(pages.map(page => page.index));
  };

  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  const invertSelection = () => {
    setSelectedPages(
      pages
        .map(page => page.index)
        .filter(index => !selectedPages.includes(index))
    );
  };

  const deletePages = async () => {
    try {
      if (selectedPages.length === 0) {
        setError("Please select at least one page to delete.");
        return;
      }

      if (selectedPages.length === pageCount) {
        setError("Cannot delete all pages. At least one page must remain.");
        return;
      }
      
      setIsProcessing(true);
      setError(null);
      
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy all pages EXCEPT the selected ones to delete
      const pagesToKeep = pages
        .filter(page => !selectedPages.includes(page.index))
        .map(page => page.index);
      
      // Copy the pages from the original document
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
      
      // Add the copied pages to the new document
      copiedPages.forEach(page => {
        newPdfDoc.addPage(page);
      });
      
      // Save the modified PDF
      const modifiedPdfBytes = await newPdfDoc.save();
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      
      // Generate URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `modified_${timestamp}.pdf`;
      
      setModifiedPdfUrl(url);
      setModifiedPdfName(fileName);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error deleting pages:", err);
      setError("Failed to delete pages. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Delete PDF Pages</h2>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileCheck className="text-green-500 mr-2" size={20} />
            <div className="flex-1 truncate">{file.name}</div>
            <div className="text-gray-500 text-sm">{formatFileSize(file.size)}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total pages: {pageCount}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium text-gray-700">
              {selectedPages.length} pages selected
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={selectAllPages}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button 
                onClick={deselectAllPages}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Deselect All
              </button>
              <button 
                onClick={invertSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Invert
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {pages.map((page) => (
              <button
                key={page.index}
                onClick={() => togglePageSelection(page.index)}
                className={`relative aspect-[3/4] flex items-center justify-center border rounded-md transition-colors ${
                  selectedPages.includes(page.index)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-sm">{page.pageNumber}</span>
                {selectedPages.includes(page.index) && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                    <Check size={12} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {!modifiedPdfUrl && (
          <button
            onClick={deletePages}
            disabled={isProcessing || selectedPages.length === 0 || selectedPages.length === pageCount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-red-300 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2" size={20} />
                Delete {selectedPages.length} {selectedPages.length === 1 ? 'Page' : 'Pages'}
              </>
            )}
          </button>
        )}

        {modifiedPdfUrl && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={modifiedPdfUrl}
                download={modifiedPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Modified PDF
              </a>
              
              <button
                onClick={() => window.open(modifiedPdfUrl, '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Eye className="mr-2" size={20} />
                Preview
              </button>
            </div>
            
            <button
              onClick={deletePages}
              className="w-full border border-red-600 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-md"
            >
              Delete More Pages
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
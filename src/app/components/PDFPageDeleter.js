"use client";
import { useState, useEffect} from "react";
import { PDFDocument } from "pdf-lib";
import { Trash2, Loader2, Download, FileCheck, Eye, Check, X } from "lucide-react";

export default function PDFPageDeleter({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState(null);
  const [modifiedPdfName, setModifiedPdfName] = useState("modified.pdf");
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [error, setError] = useState(null);
  const [pageImages, setPageImages] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [currentPdfBytes, setCurrentPdfBytes] = useState(null);

  // Load PDF.js from CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      if (window.pdfjsLib) {
        setPdfJsLoaded(true);
        return;
      }

      try {
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          // Set worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfJsLoaded(true);
        };
        script.onerror = () => {
          setError('Failed to load PDF.js library');
        };
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to load PDF.js library', err);
      }
    };

    loadPdfJs();
  }, []);

  // Load PDF info and generate previews when file changes
  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        if (!file || !pdfJsLoaded) return;
        
        // Reset state
        setModifiedPdfUrl(null);
        setError(null);
        setSelectedPages([]);
        setPageImages({});
        setLoadingPreviews(true);
        setHasModifications(false);
        setCurrentPdfBytes(null);
        
        // Load the PDF document to get page count using pdf-lib
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        
        // Create pages array with stable IDs
        const pagesArray = Array.from({ length: count }, (_, i) => ({
          id: `page_${i}`, // Stable identifier
          originalIndex: i, // Original position in PDF
          pageNumber: i + 1,
        }));
        setPages(pagesArray);
        
        // Generate page previews using PDF.js
        await generatePagePreviews(arrayBuffer, count);
        
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF file. Please ensure the file is a valid PDF document.");
        setLoadingPreviews(false);
      }
    };
    
    loadPdfInfo();
  }, [file, pdfJsLoaded]);

  const generatePagePreviews = async (arrayBuffer, count) => {
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js not loaded');
      }

      // Load PDF with PDF.js
      const loadingTask = window.pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      const newPageImages = {};
      
      // Generate previews for each page
      for (let pageNum = 1; pageNum <= count; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          
          // Set scale for thumbnail (smaller for performance)
          const scale = 0.5;
          const viewport = page.getViewport({ scale });
          
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const context = canvas.getContext('2d');
          
          // Render page
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          // Convert to data URL
          newPageImages[pageNum - 1] = canvas.toDataURL('image/jpeg', 0.8);
          
          // Update state incrementally so user sees progress
          setPageImages(prev => ({ ...prev, [pageNum - 1]: newPageImages[pageNum - 1] }));
          
        } catch (pageErr) {
          console.error(`Error rendering page ${pageNum}:`, pageErr);
          // Create a placeholder for failed pages
          newPageImages[pageNum - 1] = null;
        }
      }
      
      setLoadingPreviews(false);
    } catch (err) {
      console.error("Error generating previews:", err);
      setError("Failed to generate page previews. You can still use the tool without previews.");
      setLoadingPreviews(false);
    }
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages(prevSelected => {
      if (prevSelected.includes(pageId)) {
        return prevSelected.filter(id => id !== pageId);
      } else {
        return [...prevSelected, pageId];
      }
    });
  };

  const deleteSinglePage = async (pageId) => {
    try {
      if (pageCount === 1) {
        setError("Cannot delete the last remaining page.");
        return;
      }
      
      setIsProcessing(true);
      setError(null);
      
      // Find the page to delete
      const pageToDelete = pages.find(page => page.id === pageId);
      if (!pageToDelete) {
        setError("Page not found.");
        setIsProcessing(false);
        return;
      }
      
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Get the pages to keep (all except the one being deleted)
      const remainingPages = pages.filter(page => page.id !== pageId);
      const pagesToKeep = remainingPages.map(page => page.originalIndex);
      
      // Copy the pages from the original document
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
      
      // Add the copied pages to the new document
      copiedPages.forEach(page => {
        newPdfDoc.addPage(page);
      });
      
      // Save the modified PDF
      const modifiedPdfBytes = await newPdfDoc.save();
      
      // Store the current PDF bytes for download
      setCurrentPdfBytes(modifiedPdfBytes);
      setHasModifications(true);
      
      // Update the pages state - create new pages with updated info
      const updatedPages = remainingPages.map((page, newIndex) => ({
        id: `page_${newIndex}`, // New stable ID
        originalIndex: newIndex, // New index in the modified PDF
        pageNumber: newIndex + 1, // Sequential page number
      }));
      
      setPages(updatedPages);
      setPageCount(updatedPages.length);
      
      // Update page images - map old images to new positions
      const updatedPageImages = {};
      updatedPages.forEach((newPage, newIndex) => {
        // Find the original page that corresponds to this position
        const originalPage = remainingPages[newIndex];
        if (pageImages[originalPage.originalIndex]) {
          updatedPageImages[newIndex] = pageImages[originalPage.originalIndex];
        }
      });
      setPageImages(updatedPageImages);
      
      // Clear selections for deleted pages
      setSelectedPages(prev => prev.filter(selectedId => selectedId !== pageId));
      
      // Create a new file object for future operations
      const newFile = new File([modifiedPdfBytes], file.name, { type: "application/pdf" });
      
      // Update the file reference (this is a bit hacky but necessary for the component to work)
      Object.defineProperty(newFile, 'arrayBuffer', {
        value: () => Promise.resolve(modifiedPdfBytes.buffer.slice())
      });
      
      // Replace the file reference
      file = newFile;
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error deleting page:", err);
      setError("Failed to delete page. Please try again.");
      setIsProcessing(false);
    }
  };

  const downloadCurrentPdf = () => {
    if (currentPdfBytes) {
      const blob = new Blob([currentPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `modified_${timestamp}.pdf`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const previewCurrentPdf = () => {
    if (currentPdfBytes) {
      const blob = new Blob([currentPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const selectAllPages = () => {
    setSelectedPages(pages.map(page => page.id));
  };

  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  const invertSelection = () => {
    setSelectedPages(
      pages
        .map(page => page.id)
        .filter(id => !selectedPages.includes(id))
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
        .filter(page => !selectedPages.includes(page.id))
        .map(page => page.originalIndex);
      
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

  // Show loading state while PDF.js is loading
  if (!pdfJsLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-gray-600">Loading PDF viewer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Delete PDF Pages</h2>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileCheck className="text-green-500 mr-2" size={20} />
            <div className="flex-1 truncate">{file?.name || 'sample.pdf'}</div>
            <div className="text-gray-500 text-sm">{formatFileSize(file?.size || 1024000)}</div>
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
              {selectedPages.length} pages selected for batch delete
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
          
          {loadingPreviews && Object.keys(pageImages).length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2" size={24} />
              <span className="text-gray-600">Generating page previews...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`relative group flex flex-col items-center p-2 border-2 rounded-lg transition-all ${
                    selectedPages.includes(page.id)
                      ? "border-red-500 bg-red-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Delete Cross Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSinglePage(page.id);
                    }}
                    disabled={isProcessing || pageCount === 1}
                    className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full p-1 shadow-md transition-colors"
                    title={pageCount === 1 ? "Cannot delete the last page" : `Delete page ${page.pageNumber}`}
                  >
                    <X size={14} />
                  </button>

                  {/* Page Preview - Clickable for selection */}
                  <button
                    onClick={() => togglePageSelection(page.id)}
                    className="w-full"
                  >
                    <div className="relative mb-2 w-full aspect-[3/4] bg-white rounded border overflow-hidden">
                      {pageImages[page.originalIndex] ? (
                        <img
                          src={pageImages[page.originalIndex]}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      ) : loadingPreviews ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Loader2 className="animate-spin" size={16} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
                          Page {page.pageNumber}
                        </div>
                      )}
                      
                      {/* Selection overlay */}
                      {selectedPages.includes(page.id) && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-red-500 text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Page number */}
                    <div className="text-sm font-medium text-gray-700">
                      Page {page.pageNumber}
                    </div>
                  </button>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg pointer-events-none transition-colors" />
                </div>
              ))}
            </div>
          )}
          
          {loadingPreviews && Object.keys(pageImages).length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Loading previews... ({Object.keys(pageImages).length}/{pageCount} pages)
            </div>
          )}
        </div>

        {/* Download/Preview section for cross-button deletions */}
        {hasModifications && !modifiedPdfUrl && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-blue-800 font-medium mb-2">✓ PDF Modified</div>
              <div className="text-blue-700 text-sm">You&apos;ve made changes to the PDF. Download or preview your modified document.</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadCurrentPdf}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Modified PDF
              </button>
              
              <button
                onClick={previewCurrentPdf}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Eye className="mr-2" size={20} />
                Preview PDF
              </button>
            </div>
          </div>
        )}

        {!modifiedPdfUrl && selectedPages.length > 0 && (
          <button
            onClick={deletePages}
            disabled={isProcessing || selectedPages.length === 0 || selectedPages.length === pageCount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-red-300 flex items-center justify-center mb-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2" size={20} />
                Delete {selectedPages.length} Selected {selectedPages.length === 1 ? 'Page' : 'Pages'}
              </>
            )}
          </button>
        )}

        {/* Final Download Section - only show when batch delete creates a final PDF */}
        {modifiedPdfUrl && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-green-800 font-medium mb-2">✓ PDF Successfully Modified</div>
              <div className="text-green-700 text-sm">Your PDF has been processed. Download or preview the result below.</div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={modifiedPdfUrl}
                download={modifiedPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Final PDF
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
              onClick={() => {
                setModifiedPdfUrl(null);
                setSelectedPages([]);
              }}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md"
            >
              Continue Editing
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
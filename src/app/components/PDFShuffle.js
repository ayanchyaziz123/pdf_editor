"use client";

import { useState, useEffect, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { 
  Shuffle, 
  Loader2, 
  Download, 
  FileCheck, 
  Eye, 
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
  Upload,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  RotateCw,
  Move,
  GripVertical
} from "lucide-react";

export default function ShufflePDF({ file: externalFile, onFileChange }) {
  const [file, setFile] = useState(externalFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [shuffledPdfUrl, setShuffledPdfUrl] = useState(null);
  const [shuffledPdfName, setShuffledPdfName] = useState("");
  const [originalPages, setOriginalPages] = useState([]);
  const [arrangedPages, setArrangedPages] = useState([]);
  const [error, setError] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pageImages, setPageImages] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const fileInputRef = useRef(null);

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
        setError('Failed to load PDF.js library');
        console.error(err);
      }
    };

    loadPdfJs();
  }, []);

  // Update internal file state when external file changes
  useEffect(() => {
    if (externalFile) {
      setFile(externalFile);
      setError(null);
      setShuffledPdfUrl(null);
    }
  }, [externalFile]);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setShuffledPdfUrl(null);
      // Notify parent component if callback provided
      if (onFileChange) {
        onFileChange(selectedFile);
      }
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Generate page previews using PDF.js
  const generatePagePreviews = async (arrayBuffer, pageCount) => {
    try {
      if (!window.pdfjsLib) {
        console.warn('PDF.js not loaded, skipping previews');
        return;
      }

      setLoadingPreviews(true);

      // Load PDF with PDF.js
      const loadingTask = window.pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      const newPageImages = {};
      
      // Generate previews for each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
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
      setLoadingPreviews(false);
      // Don't show error for preview generation failure - just continue without previews
    }
  };

  // Load PDF pages when file changes
  useEffect(() => {
    const loadPdfPages = async () => {
      try {
        if (!file || !pdfJsLoaded) return;
        
        setIsLoadingPdf(true);
        setShuffledPdfUrl(null);
        setError(null);
        setPageImages({});
        
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        // Create page objects with metadata
        const pages = Array.from({ length: pageCount }, (_, index) => ({
          id: `page-${index + 1}`,
          originalIndex: index,
          pageNumber: index + 1,
          rotation: 0
        }));
        
        setOriginalPages(pages);
        setArrangedPages([...pages]); // Start with original order
        
        // Generate page previews
        await generatePagePreviews(arrayBuffer, pageCount);
        
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Unable to load PDF file. Please ensure you've selected a valid PDF document.");
        setOriginalPages([]);
        setArrangedPages([]);
        setPageImages({});
      } finally {
        setIsLoadingPdf(false);
      }
    };
    
    loadPdfPages();
  }, [file, pdfJsLoaded]);

  // Drag and drop handlers for page reordering
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handlePageDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handlePageDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null) return;
    
    const newPages = [...arrangedPages];
    const draggedPage = newPages[draggedItem];
    
    // Remove dragged item
    newPages.splice(draggedItem, 1);
    
    // Insert at new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newPages.splice(insertIndex, 0, draggedPage);
    
    setArrangedPages(newPages);
    setDraggedItem(null);
    setDragOverIndex(null);
    setShuffledPdfUrl(null);
  };

  // Page manipulation functions
  const movePage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= arrangedPages.length) return;
    
    const newPages = [...arrangedPages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    
    setArrangedPages(newPages);
    setShuffledPdfUrl(null);
  };

  const duplicatePage = (index) => {
    const newPages = [...arrangedPages];
    const pageToClone = { ...newPages[index], id: `${newPages[index].id}-copy-${Date.now()}` };
    newPages.splice(index + 1, 0, pageToClone);
    
    setArrangedPages(newPages);
    setShuffledPdfUrl(null);
  };

  const deletePage = (index) => {
    if (arrangedPages.length <= 1) {
      setError("Cannot delete the last remaining page.");
      return;
    }
    
    const newPages = arrangedPages.filter((_, i) => i !== index);
    setArrangedPages(newPages);
    setShuffledPdfUrl(null);
  };

  const rotatePage = (index) => {
    const newPages = [...arrangedPages];
    newPages[index] = {
      ...newPages[index],
      rotation: (newPages[index].rotation + 90) % 360
    };
    setArrangedPages(newPages);
    setShuffledPdfUrl(null);
  };

  // Shuffle operations
  const shufflePages = () => {
    const newPages = [...arrangedPages];
    for (let i = newPages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPages[i], newPages[j]] = [newPages[j], newPages[i]];
    }
    setArrangedPages(newPages);
    setShuffledPdfUrl(null);
  };

  const reversePages = () => {
    setArrangedPages([...arrangedPages].reverse());
    setShuffledPdfUrl(null);
  };

  const resetOrder = () => {
    setArrangedPages([...originalPages]);
    setShuffledPdfUrl(null);
  };

  // Generate the reordered PDF
  const generateShuffledPdf = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (arrangedPages.length === 0) {
        setError("No pages to process.");
        setIsProcessing(false);
        return;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      // Copy pages in the new order
      for (const pageInfo of arrangedPages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [pageInfo.originalIndex]);
        
        // Apply rotation if needed
        if (pageInfo.rotation !== 0) {
          copiedPage.setRotation({ angle: pageInfo.rotation });
        }
        
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `shuffled_${file.name.replace('.pdf', '')}_${timestamp}.pdf`;
      
      setShuffledPdfUrl(url);
      setShuffledPdfName(fileName);
      
    } catch (err) {
      console.error("Error generating shuffled PDF:", err);
      setError("An error occurred while generating the shuffled PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while PDF.js is loading
  if (!pdfJsLoaded) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-gray-600">Loading PDF viewer...</span>
        </div>
      </div>
    );
  }

  // If no file is provided and no external file, show the upload interface
  if (!file) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your PDF</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Select PDF File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* File Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileCheck className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{file.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                {isLoadingPdf ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-1" size={16} />
                    Loading pages...
                  </div>
                ) : (
                  <span>{originalPages.length} pages</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              if (onFileChange) {
                onFileChange(null);
              }
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {originalPages.length > 0 && (
        <div className="p-8">
          {/* Control Buttons */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={shufflePages}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Shuffle className="mr-2" size={16} />
                Shuffle All
              </button>
              <button
                onClick={reversePages}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <RefreshCw className="mr-2" size={16} />
                Reverse Order
              </button>
              <button
                onClick={resetOrder}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <RotateCw className="mr-2" size={16} />
                Reset to Original
              </button>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-blue-800">
                  <p><strong>How to use:</strong> Drag pages to reorder them, or use the buttons on each page to move, duplicate, rotate, or delete pages. Changes are reflected in real-time.</p>
                </div>
              </div>
            </div>
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

          {/* Page Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Arrange Pages ({arrangedPages.length} pages)
              </h3>
              {loadingPreviews && Object.keys(pageImages).length > 0 && (
                <div className="text-sm text-gray-500">
                  Loading previews... ({Object.keys(pageImages).length}/{originalPages.length})
                </div>
              )}
            </div>
            
            {loadingPreviews && Object.keys(pageImages).length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin mr-2" size={24} />
                <span className="text-gray-600">Generating page previews...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {arrangedPages.map((page, index) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handlePageDragOver(e, index)}
                    onDrop={(e) => handlePageDrop(e, index)}
                    className={`bg-white border-2 rounded-lg p-3 cursor-move transition-all ${
                      draggedItem === index 
                        ? 'border-blue-500 shadow-lg opacity-50' 
                        : dragOverIndex === index 
                          ? 'border-blue-300 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Page Preview */}
                    <div className="relative aspect-[3/4] bg-white rounded border overflow-hidden mb-3">
                      {pageImages[page.originalIndex] ? (
                        <img
                          src={pageImages[page.originalIndex]}
                          alt={`Page ${page.pageNumber}`}
                          className={`w-full h-full object-contain ${
                            page.rotation !== 0 ? `transform rotate-${page.rotation === 90 ? '90' : page.rotation === 180 ? '180' : '270'}` : ''
                          }`}
                          style={page.rotation !== 0 ? { transform: `rotate(${page.rotation}deg)` } : {}}
                        />
                      ) : loadingPreviews ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Loader2 className="animate-spin" size={16} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FileText className="text-gray-400" size={24} />
                        </div>
                      )}
                      
                      {/* Drag handle */}
                      <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
                        <GripVertical className="text-gray-400" size={12} />
                      </div>
                      
                      {/* Rotation indicator */}
                      {page.rotation !== 0 && (
                        <div className="absolute top-1 left-1 bg-blue-100 text-blue-800 text-xs px-1 rounded">
                          {page.rotation}°
                        </div>
                      )}
                    </div>
                    
                    {/* Page Info */}
                    <div className="text-center mb-3">
                      <div className="text-sm font-medium text-gray-900">
                        Page {page.pageNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        Position {index + 1}
                      </div>
                    </div>
                    
                    {/* Page Controls */}
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => movePage(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => movePage(index, index + 1)}
                        disabled={index === arrangedPages.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => duplicatePage(index)}
                        className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => rotatePage(index)}
                        className="p-1 text-green-400 hover:text-green-600 transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw size={14} />
                      </button>
                    </div>
                    
                    {arrangedPages.length > 1 && (
                      <button
                        onClick={() => deletePage(index)}
                        className="w-full mt-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          {!shuffledPdfUrl && (
            <div className="text-center mb-8">
              <button
                onClick={generateShuffledPdf}
                disabled={isProcessing || arrangedPages.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Move className="mr-2" size={20} />
                    Generate Shuffled PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {shuffledPdfUrl && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
                <CheckCircle2 size={20} />
                <span className="font-medium">PDF shuffled successfully!</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Your Shuffled PDF is Ready</h4>
                
                <div className="flex space-x-4">
                  <a
                    href={shuffledPdfUrl}
                    download={shuffledPdfName}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Download className="mr-2" size={20} />
                    Download Shuffled PDF
                  </a>
                  
                  <button
                    onClick={() => window.open(shuffledPdfUrl, '_blank')}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
                  >
                    <Eye className="mr-2" size={20} />
                    Preview
                  </button>
                </div>
                
                <button
                  onClick={() => setShuffledPdfUrl(null)}
                  className="w-full mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Make More Changes
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            All processing happens in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      )}
    </div>
  );
}
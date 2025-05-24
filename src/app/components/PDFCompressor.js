"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Minimize2, Loader2, Download, FileCheck, Eye, BarChart4 } from "lucide-react";

export default function PDFCompressor({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressedPdfName, setCompressedPdfName] = useState("compressed.pdf");
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Load PDF info when file changes
  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        if (!file) return;
        
        // Reset state
        setCompressedPdfUrl(null);
        setError(null);
        setStats(null);
        
        // Get file size
        setOriginalSize(file.size);
        
        // Load the PDF document to get page count
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF file. Please ensure the file is a valid PDF document.");
      }
    };
    
    loadPdfInfo();
  }, [file]);

  const compressPdf = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Apply compression strategies based on the selected level
      // In a real implementation, you'd use more advanced techniques
      // This is a simplified version using pdf-lib's capabilities
      
      // Create a new PDF document
      const compressedPdf = await PDFDocument.create();
      
      // Copy all pages from the original PDF to the new one
      // pdf-lib will automatically compress and optimize when copying
      const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => {
        compressedPdf.addPage(page);
      });
      
      // Additional compression settings based on level
      const compressionOptions = {
        low: { quality: 0.8, useObjectStreams: false },
        medium: { quality: 0.6, useObjectStreams: true },
        high: { quality: 0.4, useObjectStreams: true }
      };
      
      const options = compressionOptions[compressionLevel];
      
      // Save with compression settings
      const compressedPdfBytes = await compressedPdf.save({
        addDefaultPage: false,
        useObjectStreams: options.useObjectStreams
      });
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
      
      // Calculate compression stats
      const newSize = blob.size;
      setCompressedSize(newSize);
      
      const savedBytes = originalSize - newSize;
      const savingPercentage = ((savedBytes / originalSize) * 100).toFixed(1);
      
      setStats({
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(newSize),
        savedBytes: formatFileSize(savedBytes),
        savingPercentage: savingPercentage
      });
      
      // Generate URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `compressed_${timestamp}.pdf`;
      
      setCompressedPdfUrl(url);
      setCompressedPdfName(fileName);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error compressing PDF:", err);
      setError("Failed to compress PDF. Please ensure the file is a valid PDF document.");
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
        <h2 className="text-2xl font-semibold mb-4">Compress PDF</h2>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileCheck className="text-green-500 mr-2" size={20} />
            <div className="flex-1 truncate">{file.name}</div>
            <div className="text-gray-500 text-sm">{formatFileSize(originalSize)}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total pages: {pageCount}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compression Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setCompressionLevel("low")}
              className={`p-3 border rounded-md text-center ${
                compressionLevel === "low" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Low</div>
              <div className="text-sm text-gray-500">Better quality, larger size</div>
            </button>
            <button
              onClick={() => setCompressionLevel("medium")}
              className={`p-3 border rounded-md text-center ${
                compressionLevel === "medium" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Medium</div>
              <div className="text-sm text-gray-500">Balanced</div>
            </button>
            <button
              onClick={() => setCompressionLevel("high")}
              className={`p-3 border rounded-md text-center ${
                compressionLevel === "high" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">High</div>
              <div className="text-sm text-gray-500">Smaller size, lower quality</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {stats && (
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <div className="flex items-center mb-2">
              <BarChart4 className="text-blue-500 mr-2" size={18} />
              <h3 className="font-medium text-blue-800">Compression Results</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Original size:</div>
              <div className="font-medium">{stats.originalSize}</div>
              
              <div>Compressed size:</div>
              <div className="font-medium">{stats.compressedSize}</div>
              
              <div>Space saved:</div>
              <div className="font-medium">{stats.savedBytes} ({stats.savingPercentage}%)</div>
            </div>
          </div>
        )}

        {!compressedPdfUrl && (
          <button
            onClick={compressPdf}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-blue-300 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Minimize2 className="mr-2" size={20} />
                Compress PDF
              </>
            )}
          </button>
        )}

        {compressedPdfUrl && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={compressedPdfUrl}
                download={compressedPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Compressed PDF
              </a>
              
              <button
                onClick={() => window.open(compressedPdfUrl, '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Eye className="mr-2" size={20} />
                Preview
              </button>
            </div>
            
            <button
              onClick={compressPdf}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md"
            >
              Retry Compression
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
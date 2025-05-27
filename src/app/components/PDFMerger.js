"use client";

import { useState, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, FileCheck, Loader2, Download, Eye, RefreshCw } from "lucide-react";

export default function PDFMerger({ files = [] }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [mergedPdfName, setMergedPdfName] = useState("merged.pdf");
  const [error, setError] = useState(null);
  const [filesHash, setFilesHash] = useState("");

  // Create a hash of the files to detect changes
  const createFilesHash = useCallback((fileList) => {
    if (!fileList || fileList.length === 0) return "";
    return fileList.map(file => `${file.name}-${file.size}-${file.lastModified}`).join("|");
  }, []);

  // Reset state when files actually change
  useEffect(() => {
    const newHash = createFilesHash(files);
    if (newHash !== filesHash) {
      setFilesHash(newHash);
      setMergedPdfUrl(null);
      setError(null);
      
      // Clean up previous blob URL to prevent memory leaks
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    }
  }, [files, filesHash, createFilesHash, mergedPdfUrl]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    };
  }, [mergedPdfUrl]);

  const mergePdfs = async () => {
    if (!files || files.length < 2) {
      setError("Please upload at least two PDF files to merge.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Convert File object to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          
          // Load PDF document
          const pdf = await PDFDocument.load(arrayBuffer);
          
          // Copy all pages from the current PDF to the merged PDF
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => {
            mergedPdf.addPage(page);
          });
        } catch (fileError) {
          throw new Error(`Error processing file "${file.name}": ${fileError.message}`);
        }
      }
      
      // Serialize the merged PDF to bytes
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      
      // Clean up previous URL if it exists
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
      
      // Generate URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `merged_${timestamp}.pdf`;
      
      setMergedPdfUrl(url);
      setMergedPdfName(fileName);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error merging PDFs:", err);
      setError(err.message || "Failed to merge PDFs. Please ensure all files are valid PDF documents.");
      setIsProcessing(false);
    }
  };

  const handlePreview = () => {
    if (mergedPdfUrl) {
      window.open(mergedPdfUrl, '_blank');
    }
  };

  const handleRegenerate = () => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
    setMergedPdfUrl(null);
    setError(null);
  };

  // Don't render if no files
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Merge {files.length} PDF{files.length > 1 ? 's' : ''}
          </h2>
          <div className="text-sm text-gray-500">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </div>
        </div>
        
        {/* File List */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Files to merge (in order):
          </h3>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}-${file.size}`} className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="bg-green-100 text-green-600 rounded-full p-2 mr-4">
                <FileCheck size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{file.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>Position {index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Action Buttons */}
        {!mergedPdfUrl ? (
          <button
            onClick={mergePdfs}
            disabled={isProcessing || files.length < 2}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Merging PDFs...
              </>
            ) : (
              <>
                <ArrowDown className="mr-3" size={24} />
                Merge {files.length} PDFs
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
              <div className="font-medium">✓ PDFs merged successfully!</div>
              <div className="text-sm mt-1">Your merged PDF is ready for download</div>
            </div>

            {/* Download and Preview Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={mergedPdfUrl}
                download={mergedPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
              >
                <Download className="mr-2" size={20} />
                Download PDF
              </a>
              
              <button
                onClick={handlePreview}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
              >
                <Eye className="mr-2" size={20} />
                Preview
              </button>
            </div>
            
            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <RefreshCw className="mr-2" size={20} />
              Merge Again
            </button>
          </div>
        )}
        
        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>🔒 Privacy Protected:</strong> All PDF processing happens locally in your browser. 
            Your files are never uploaded to any server or stored anywhere.
          </div>
        </div>
      </div>
    </div>
  );
}
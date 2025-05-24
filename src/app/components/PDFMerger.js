"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, FileCheck, Loader2, Download } from "lucide-react";

export default function PDFMerger({ files }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [mergedPdfName, setMergedPdfName] = useState("merged.pdf");
  const [error, setError] = useState(null);

  // Process files when they change
  useEffect(() => {
    // Reset state when files change
    setMergedPdfUrl(null);
    setError(null);
  }, [files]);

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError("Please upload at least two PDF files to merge.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each file
      for (const file of files) {
        // Convert File object to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF document
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages from the current PDF to the merged PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }
      
      // Serialize the merged PDF to bytes
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      
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
      setError("Failed to merge PDFs. Please ensure all files are valid PDF documents.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 mb-16">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Merge {files.length} PDFs</h2>
        
        <div className="space-y-3 mb-6">
          {files.map((file, index) => (
            <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md">
              <FileCheck className="text-green-500 mr-2" size={20} />
              <div className="flex-1 truncate">{file.name}</div>
              <div className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {!mergedPdfUrl && (
          <button
            onClick={mergePdfs}
            disabled={isProcessing || files.length < 2}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-blue-300 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <ArrowDown className="mr-2" size={20} />
                Merge PDFs
              </>
            )}
          </button>
        )}

        {mergedPdfUrl && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={mergedPdfUrl}
                download={mergedPdfName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Merged PDF
              </a>
              
              <button
                onClick={() => window.open(mergedPdfUrl, '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                Preview
              </button>
            </div>
            
            <button
              onClick={mergePdfs}
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
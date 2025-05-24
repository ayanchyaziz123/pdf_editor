"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { 

  Loader2, 
  Download, 
  FileCheck, 
  Eye, 
  RefreshCw 
} from "lucide-react";

export default function PDFConverter({ file }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState(null);
  const [convertedFileName, setConvertedFileName] = useState("converted.pdf");
  const [conversionType, setConversionType] = useState("pdf-to-image");
  const [conversionFormat, setConversionFormat] = useState("jpeg");
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [imageQuality, setImageQuality] = useState(80);
  const [pageToConvert, setPageToConvert] = useState(1);

  // Conversion options
  const pdfToOptions = [
    { value: "jpeg", label: "JPEG Image" },
    { value: "png", label: "PNG Image" },
    { value: "html", label: "HTML" },
    { value: "text", label: "Plain Text" }
  ];

  const imageToPdfOptions = [
    { value: "default", label: "Default (Letter)" },
    { value: "a4", label: "A4" },
    { value: "legal", label: "Legal" },
    { value: "fit", label: "Fit to Image" }
  ];

  // Load PDF info when file changes
  useEffect(() => {
    const loadFileInfo = async () => {
      try {
        if (!file) return;
        
        // Reset state
        setConvertedFileUrl(null);
        setError(null);
        
        // Determine file type
        const fileType = file.type;
        if (fileType.includes("pdf")) {
          setConversionType("pdf-to-image");
          // Get PDF page count
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          setPageCount(pdfDoc.getPageCount());
          // Default to first page
          setPageToConvert(1);
        } else if (fileType.includes("image")) {
          setConversionType("image-to-pdf");
        } else {
          setConversionType("other-to-pdf");
        }
      } catch (err) {
        console.error("Error loading file:", err);
        setError("Failed to load file. Please ensure the file is valid.");
      }
    };
    
    loadFileInfo();
  }, [file]);

  const convertPdfToImage = async () => {
    try {
      // In a real implementation, you would use a canvas or a library like pdf.js
      // to render the PDF page as an image, then convert to the desired format
      
      // For demonstration purposes, we'll create a placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some text to show page number
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.fillText(`Converted from PDF - Page ${pageToConvert}`, 50, 50);
      
      // Convert canvas to image blob
      return new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, `image/${conversionFormat}`, imageQuality / 100);
      });
    } catch (error) {
      console.error("Error converting PDF to image:", error);
      throw new Error("Failed to convert PDF to image");
    }
  };

  const convertImageToPdf = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a blank page
      const page = pdfDoc.addPage([600, 800]);
      
      // In a real implementation, you would:
      // 1. Load the image file
      // 2. Embed it in the PDF
      // 3. Draw it on the page
      
      // For demonstration purposes, we'll create a simple PDF
      const { width, height } = page.getSize();
      console.log("width", width);
      page.drawText(`Converted from ${file.name}`, {
        x: 50,
        y: height - 50,
        size: 20
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error("Error converting image to PDF:", error);
      throw new Error("Failed to convert image to PDF");
    }
  };

  const convertTextToPdf = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a blank page
      const page = pdfDoc.addPage([600, 800]);
      
      // In a real implementation, you would:
      // 1. Read the text file
      // 2. Format it properly
      // 3. Add it to the PDF
      
      // For demonstration purposes, we'll create a simple PDF
      const { width, height } = page.getSize();
      page.drawText(`Converted from ${file.name}`, {
        x: 50,
        y: height - 50,
        size: 20
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error("Error converting text to PDF:", error);
      throw new Error("Failed to convert text to PDF");
    }
  };

  const convertPdfToText = async () => {
    // In a real implementation, you would use a library like pdf.js
    // to extract text from the PDF
    
    // For demonstration purposes, we'll create a placeholder text file
    const text = `This is extracted text from ${file.name}\n\nPage ${pageToConvert}\n\nThis is a placeholder text extraction. In a real implementation, you would see the actual text content from the PDF document.`;
    return new Blob([text], { type: 'text/plain' });
  };

  const convertPdfToHtml = async () => {
    // In a real implementation, you would use a library to convert PDF to HTML
    
    // For demonstration purposes, we'll create a placeholder HTML file
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Converted from ${file.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .page { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Converted from PDF</h1>
        <div class="page">
          <h2>Page ${pageToConvert}</h2>
          <p>This is a placeholder HTML conversion. In a real implementation, you would see the actual content from the PDF document formatted as HTML.</p>
        </div>
      </body>
      </html>
    `;
    return new Blob([html], { type: 'text/html' });
  };

  const convertFile = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      let resultBlob;
      let fileExtension;
      let mimeType;
      
      // Perform the appropriate conversion based on the file type and selected options
      if (conversionType === "pdf-to-image") {
        if (conversionFormat === "jpeg" || conversionFormat === "png") {
          resultBlob = await convertPdfToImage();
          fileExtension = conversionFormat;
          mimeType = `image/${conversionFormat}`;
        } else if (conversionFormat === "text") {
          resultBlob = await convertPdfToText();
          fileExtension = "txt";
          mimeType = "text/plain";
        } else if (conversionFormat === "html") {
          resultBlob = await convertPdfToHtml();
          fileExtension = "html";
          mimeType = "text/html";
        }
      } else if (conversionType === "image-to-pdf" || conversionType === "other-to-pdf") {
        if (file.type.includes("image")) {
          resultBlob = await convertImageToPdf();
        } else {
          resultBlob = await convertTextToPdf();
        }
        fileExtension = "pdf";
        mimeType = "application/pdf";
      }
      console.log("Compressed size:", mimeType);
      
      // Generate URL for the blob
      const url = URL.createObjectURL(resultBlob);
      
      // Generate a filename
      const originalName = file.name.split('.')[0];
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const fileName = `${originalName}_converted_${timestamp}.${fileExtension}`;
      
      setConvertedFileUrl(url);
      setConvertedFileName(fileName);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error converting file:", err);
      setError("Failed to convert file. Please try again with a different file or format.");
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
        <h2 className="text-2xl font-semibold mb-4">Convert {file.type.includes("pdf") ? "PDF" : "to PDF"}</h2>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileCheck className="text-green-500 mr-2" size={20} />
            <div className="flex-1 truncate">{file.name}</div>
            <div className="text-gray-500 text-sm">{formatFileSize(file.size)}</div>
          </div>
          {file.type.includes("pdf") && (
            <div className="mt-2 text-sm text-gray-600">
              Total pages: {pageCount}
            </div>
          )}
        </div>

        <div className="mb-6">
          {file.type.includes("pdf") ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convert PDF to:
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {pdfToOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConversionFormat(option.value)}
                    className={`p-3 border rounded-md text-center ${
                      conversionFormat === option.value
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
              
              {(conversionFormat === "jpeg" || conversionFormat === "png") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Quality: {imageQuality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={imageQuality}
                    onChange={(e) => setImageQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              {pageCount > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page to Convert
                  </label>
                  <select
                    value={pageToConvert}
                    onChange={(e) => setPageToConvert(parseInt(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[...Array(pageCount)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        Page {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Options:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {imageToPdfOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConversionFormat(option.value)}
                    className={`p-3 border rounded-md text-center ${
                      conversionFormat === option.value
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {!convertedFileUrl && (
          <button
            onClick={convertFile}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-purple-300 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={20} />
                Convert {file.type.includes("pdf") ? `to ${conversionFormat.toUpperCase()}` : "to PDF"}
              </>
            )}
          </button>
        )}

        {convertedFileUrl && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={convertedFileUrl}
                download={convertedFileName}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
              >
                <Download className="mr-2" size={20} />
                Download Converted File
              </a>
              
              {(conversionFormat === "jpeg" || conversionFormat === "png" || conversionFormat === "html" || conversionFormat === "pdf") && (
                <button
                  onClick={() => window.open(convertedFileUrl, '_blank')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md flex-1 flex items-center justify-center"
                >
                  <Eye className="mr-2" size={20} />
                  Preview
                </button>
              )}
            </div>
            
            <button
              onClick={convertFile}
              className="w-full border border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-2 px-4 rounded-md"
            >
              Convert Again
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>All processing happens in your browser. Your files are never uploaded to any server.</p>
          <p className="mt-1 italic">Note: This is a demonstration. In a production environment, you would use specialized libraries for high-quality conversions.</p>
        </div>
      </div>
    </div>
  );
}
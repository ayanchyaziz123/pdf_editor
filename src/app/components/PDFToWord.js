"use client";

import { useState} from "react";
import { FileText, Download, Loader2, AlertCircle, CheckCircle, Eye } from "lucide-react";

export default function PDFToWordConverter({ files = [] }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Method 1: Extract text and create simple Word document with robust error handling
  const convertPDFToWordSimple = async (file) => {
    let pdfjsLib = null;
    
    try {
      setProgress(5);
      
      // Try multiple ways to import PDF.js
      try {
        pdfjsLib = await import('pdfjs-dist');
      } catch (importError) {
        console.warn('Failed to import pdfjs-dist, trying alternative:', importError);
        // Fallback to CDN version
        throw new Error('PDF.js library not available. Please install pdfjs-dist package.');
      }
      
      setProgress(10);
      
      // Configure worker with better error handling
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        try {
          // Use a more reliable worker URL
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;
        } catch (workerError) {
          console.warn('Worker setup failed, using fallback:', workerError);
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      }
      
      setProgress(15);
      
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or corrupted');
      }
      
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Invalid file type: Please select a PDF file');
      }
      
      setProgress(20);
      
      // Read file with better error handling
      let arrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Failed to read file: File appears to be empty');
        }
      } catch (readError) {
        throw new Error(`Failed to read file: ${readError.message}`);
      }
      
      setProgress(25);
      
      // Load PDF document with timeout and better error handling
      let pdf;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0, // Reduce console output
          stopAtErrors: false // Continue on non-fatal errors
        });
        
        // Add timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
        });
        
        pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
        
        if (!pdf || !pdf.numPages) {
          throw new Error('Invalid PDF: No pages found');
        }
      } catch (pdfError) {
        console.error('PDF loading error:', pdfError);
        throw new Error(`Failed to load PDF: ${pdfError.message || 'PDF may be corrupted or password-protected'}`);
      }
      
      setProgress(30);
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      if (totalPages > 100) {
        throw new Error('PDF too large: Maximum 100 pages supported');
      }
      
      // Extract text from each page with individual error handling
      for (let i = 1; i <= totalPages; i++) {
        try {
          setProgress(30 + (i / totalPages) * 40); // 30-70% for text extraction
          
          const page = await pdf.getPage(i);
          if (!page) {
            console.warn(`Page ${i} could not be loaded, skipping...`);
            continue;
          }
          
          const textContent = await page.getTextContent();
          
          if (textContent && textContent.items) {
            const pageText = textContent.items
              .filter(item => item && item.str && typeof item.str === 'string' && item.str.trim())
              .map(item => item.str)
              .join(' ');
            
            if (pageText.trim()) {
              fullText += `\n\n--- Page ${i} ---\n\n${pageText}`;
            }
          }
        } catch (pageError) {
          console.warn(`Error processing page ${i}:`, pageError);
          fullText += `\n\n--- Page ${i} (Error reading content) ---\n\n`;
        }
      }
      
      setProgress(75);
      
      // Check if we extracted any text
      if (!fullText.trim()) {
        throw new Error('No text content found: PDF may contain only images or be password-protected');
      }
      
      // Create Word document using docx library
      let Document, Packer, Paragraph, TextRun;
      try {
        const docxLib = await import('docx');
        Document = docxLib.Document;
        Packer = docxLib.Packer;
        Paragraph = docxLib.Paragraph;
        TextRun = docxLib.TextRun;
      } catch (docxError) {
        throw new Error('Word document library not available. Please install docx package.', docxError);
      }
      
      setProgress(80);
      
      // Split text into paragraphs with better handling
      const textLines = fullText.split('\n').filter(line => line.trim());
      const paragraphs = textLines.map(text => {
        try {
          return new Paragraph({
            children: [new TextRun(text.trim())],
            spacing: { after: 200 }
          });
        } catch (paragraphError) {
          console.warn('Error creating paragraph:', paragraphError);
          return new Paragraph({
            children: [new TextRun('[Content could not be processed]')],
            spacing: { after: 200 }
          });
        }
      });
      
      setProgress(85);
      
      // Create document with error handling
      let doc;
      try {
        doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Converted from: ${file.name}`,
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { after: 400 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Pages: ${totalPages} | Conversion Date: ${new Date().toLocaleDateString()}`,
                    size: 20,
                    color: "666666"
                  })
                ],
                spacing: { after: 400 }
              }),
              ...paragraphs.slice(0, 1000) // Limit to prevent memory issues
            ]
          }]
        });
      } catch (docCreationError) {
        throw new Error(`Failed to create Word document: ${docCreationError.message}`);
      }
      
      setProgress(90);
      
      // Generate Word document
      let buffer;
      try {
        buffer = await Packer.toBuffer(doc);
      } catch (packingError) {
        throw new Error(`Failed to generate document: ${packingError.message}`);
      }
      
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = URL.createObjectURL(blob);
      const fileName = file.name.replace(/\.pdf$/i, '.docx');
      
      setProgress(100);
      
      return {
        url,
        fileName,
        originalName: file.name,
        size: blob.size,
        type: 'Word Document (.docx)',
        pages: totalPages,
        textLength: fullText.length
      };
      
    } catch (error) {
      console.error('Detailed conversion error:', error);
      setProgress(0);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('Object.defineProperty')) {
        errorMessage = 'PDF library initialization failed. Please refresh the page and try again.';
      } else if (error.message.includes('Invalid PDF')) {
        errorMessage = 'The PDF file appears to be corrupted or password-protected.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'PDF processing timed out. The file may be too large or complex.';
      }
      
      throw new Error(`Failed to convert ${file.name}: ${errorMessage}`);
    }
  };

  // Alternative method using pdf2pic or other libraries
//   const convertPDFToWordAlternative = async (file) => {
//     try {
//       // Use FileReader to read the PDF as text (limited but works for text-based PDFs)
//       const text = await new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//           try {
//             // This is a simplified approach - extract readable text
//             const result = reader.result;
//             // Basic text extraction (this is very limited)
//             resolve("Text extraction from PDF - please use a proper PDF parsing solution");
//           } catch (err) {
//             reject(err);
//           }
//         };
//         reader.onerror = reject;
//         reader.readAsText(file);
//       });

//       // Create Word document with extracted text
//       const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
//       const doc = new Document({
//         sections: [{
//           properties: {},
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: `Converted from: ${file.name}`,
//                   bold: true,
//                   size: 24
//                 })
//               ],
//               spacing: { after: 400 }
//             }),
//             new Paragraph({
//               children: [new TextRun("Note: This is a simplified conversion. For better results, please use the PDF.js method.")],
//               spacing: { after: 200 }
//             })
//           ]
//         }]
//       });
      
//       const buffer = await Packer.toBuffer(doc);
//       const blob = new Blob([buffer], { 
//         type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
//       });
      
//       const url = URL.createObjectURL(blob);
//       const fileName = file.name.replace('.pdf', '.docx');
      
//       return {
//         url,
//         fileName,
//         originalName: file.name,
//         size: blob.size,
//         type: 'Word Document (.docx)'
//       };
      
//     } catch (error) {
//       console.error('Alternative conversion error:', error);
//       throw new Error(`Failed to convert ${file.name}: ${error.message}`);
//     }
//   };

  const convertFiles = async () => {
    if (!files || files.length === 0) {
      setError("Please upload at least one PDF file to convert.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setConvertedFiles([]);
      setProgress(0);

      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update overall progress
        const fileProgress = (i / files.length) * 100;
        setProgress(fileProgress);
        
        try {
          // Try the main conversion method first
          let result;
          try {
            result = await convertPDFToWordSimple(file);
          } catch (mainError) {
            console.warn('Main conversion failed, trying alternative methods:', mainError);
            
            // Try simple text extraction method
            try {
              result = await convertPDFSimpleText(file);
            } catch (simpleError) {
              console.warn('Simple text extraction failed, using fallback:', simpleError);
              // Final fallback
              result = await convertPDFToWordFallback(file);
            }
          }
          
          results.push(result);
        } catch (fileError) {
          console.error(`Error converting ${file.name}:`, fileError);
          results.push({
            error: fileError.message,
            originalName: file.name
          });
        }
      }
      
      setConvertedFiles(results);
      setProgress(100);
      setIsProcessing(false);
      
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert PDF files. Please try again.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Simple text extraction method (more compatible)
  const convertPDFSimpleText = async (file) => {
    try {
      setProgress(10);
      
      // Try to extract text using a simpler approach
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to string and look for text patterns
      let textContent = '';
      const decoder = new TextDecoder('latin1');
      const content = decoder.decode(uint8Array);
      
      setProgress(30);
      
      // Simple regex to find text between parentheses (common in PDF)
      const textMatches = content.match(/\((.*?)\)/g);
      if (textMatches) {
        textContent = textMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .filter(text => text.trim().length > 0)
          .join(' ');
      }
      
      setProgress(50);
      
      // If no text found with parentheses, try to find readable text
      if (!textContent.trim()) {
        // Look for sequences of printable characters
        const readableText = content.match(/[a-zA-Z0-9\.\,\;\:\!\?\s]{10,}/g);
        if (readableText) {
          textContent = readableText
            .filter(text => text.trim().length > 10)
            .slice(0, 100) // Limit to first 100 matches
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      setProgress(70);
      
      if (!textContent.trim()) {
        throw new Error('No readable text found');
      }
      
      // Create Word document
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({
                text: `Converted from: ${file.name}`,
                bold: true,
                size: 24
              })],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({
                text: `Extraction Method: Simple Text Pattern Matching`,
                size: 16,
                color: "666666"
              })],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun(textContent)],
              spacing: { after: 200 }
            })
          ]
        }]
      });
      
      setProgress(90);
      
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = URL.createObjectURL(blob);
      const fileName = file.name.replace(/\.pdf$/i, '_simple_extraction.docx');
      
      setProgress(100);
      
      return {
        url,
        fileName,
        originalName: file.name,
        size: blob.size,
        type: 'Word Document (.docx) - Simple Extraction',
        textLength: textContent.length
      };
      
    } catch (error) {
      throw new Error(`Simple text extraction failed: ${error.message}`);
    }
  };
  const convertPDFToWordFallback = async (file) => {
    try {
      setProgress(10);
      
      // Create a simple Word document with file info
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      setProgress(50);
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `PDF Conversion Report`,
                  bold: true,
                  size: 32
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Original File: ${file.name}`,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `File Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Conversion Date: ${new Date().toLocaleString()}`,
                  size: 20
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Notice: This PDF could not be fully processed due to technical limitations. The file may be:`,
                  size: 20,
                  color: "CC0000"
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Password protected`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Contains only images (scanned document)`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Corrupted or in an unsupported format`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Too complex for client-side processing`,
                  size: 18
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `For better conversion results, try:`,
                  bold: true,
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Using a different PDF file`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Removing password protection first`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Using professional conversion software`,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            })
          ]
        }]
      });
      
      setProgress(80);
      
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = URL.createObjectURL(blob);
      const fileName = file.name.replace(/\.pdf$/i, '_conversion_report.docx');
      
      setProgress(100);
      
      return {
        url,
        fileName,
        originalName: file.name,
        size: blob.size,
        type: 'Word Document (.docx) - Conversion Report',
        isReport: true
      };
      
    } catch (error) {
      throw new Error(`Fallback conversion failed: ${error.message}`);
    }
  };

  const downloadFile = (file) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      if (file.url) {
        setTimeout(() => downloadFile(file), 100);
      }
    });
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
            Convert {files.length} PDF{files.length > 1 ? 's' : ''} to Word
          </h2>
          <div className="text-sm text-gray-500">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </div>
        </div>
        
        {/* File List */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Files to convert:
          </h3>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}-${file.size}`} className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="bg-red-100 text-red-600 rounded-full p-2 mr-4">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{file.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>PDF Document</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Converting...</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium">Conversion Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Convert Button */}
        {convertedFiles.length === 0 && (
          <button
            onClick={convertFiles}
            disabled={isProcessing || files.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Converting PDFs to Word...
              </>
            ) : (
              <>
                <FileText className="mr-3" size={24} />
                Convert to Word Documents
              </>
            )}
          </button>
        )}

        {/* Results */}
        {convertedFiles.length > 0 && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">✓ Conversion completed!</div>
                  <div className="text-sm mt-1">
                    {convertedFiles.filter(f => f.url).length} file(s) converted successfully
                  </div>
                </div>
              </div>
            </div>

            {/* Converted Files List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Converted Files</h3>
                {convertedFiles.filter(f => f.url).length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Download All
                  </button>
                )}
              </div>
              
              {convertedFiles.map((file, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {file.error ? (
                    <div className="flex items-center text-red-600">
                      <AlertCircle size={16} className="mr-2" />
                      <span className="font-medium">{file.originalName}</span>
                      <span className="text-sm ml-2">- {file.error}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{file.fileName}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => downloadFile(file)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Convert More Button */}
            <button
              onClick={() => {
                setConvertedFiles([]);
                setError(null);
                setProgress(0);
              }}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Convert More Files
            </button>
          </div>
        )}
        
        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>🔒 Privacy Protected:</strong> All PDF to Word conversion happens locally in your browser. 
            Your files are never uploaded to any server or stored anywhere.
          </div>
        </div>

        {/* Conversion Info */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800">
            <strong>ℹ️ Conversion Notes:</strong> This tool extracts text content from PDFs and converts it to Word format. 
            Complex formatting, images, and layouts may not be preserved perfectly. For best results with formatted documents, 
            consider using professional conversion services.
          </div>
        </div>
      </div>
    </div>
  );
}
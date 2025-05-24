"use client";
import { useState } from "react";
import Navbar from '../../components/Navbar'
import Footer from "@/app/components/Footer";
import MultiFileUploader from "../../components/MultiFileUploader";
import PDFMerger from "../../components/PDFMerger";

export default function MergePDFPage() {
  const [files, setFiles] = useState([]);

  const handleFilesUpload = (uploadedFiles) => {
    setFiles(uploadedFiles);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Merge PDFs</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Combine multiple PDF files into a single document.
        </p>
        
        <MultiFileUploader 
          onFilesUpload={handleFilesUpload} 
          acceptedFileTypes=".pdf"
          maxFileSizeMB={10}
        />
        
        {files.length > 1 && (
          <PDFMerger files={files} />
        )}
      </div>
      <Footer />
    </>
  );
}
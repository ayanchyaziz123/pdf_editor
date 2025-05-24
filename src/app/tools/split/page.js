"use client";
import { useState } from "react";
import Navbar from '../../components/Navbar'
import Footer from "@/app/components/Footer";
import FileUploader from "../../components/FileUploader";
import PDFSplitter from "../../components/PDFSplitter";

export default function SplitPDFPage() {
  const [file, setFile] = useState(null);

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Split PDF</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Extract pages or split a PDF into multiple files.
        </p>
        
        {!file ? (
          <FileUploader 
            onFileUpload={handleFileUpload} 
            acceptedFileTypes=".pdf"
            maxFileSizeMB={10}
          />
        ) : (
          <PDFSplitter file={file} />
        )}
      </div>
      <Footer />
    </>
  );
}   
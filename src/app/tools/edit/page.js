"use client";
import { useState } from "react";
import Navbar from '../../components/Navbar'
import Footer from "@/app/components/Footer";
import FileUploader from "@/app/components/FileUploader";
import PDFEditor from "@/app/components/PDFEditor";

export default function EditPDFPage() {
  const [file, setFile] = useState(null);

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Edit PDF</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Upload your PDF file to edit text, add images, or annotate pages.
        </p>
        
        {!file ? (
          <FileUploader 
            onFileUpload={handleFileUpload} 
            acceptedFileTypes=".pdf"
            maxFileSizeMB={10}
          />
        ) : (
          <PDFEditor file={file} />
        )}
      </div>
      <Footer />
    </>
  );
}

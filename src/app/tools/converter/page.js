"use client";

import { useState } from "react";
import Navbar from '../../components/Navbar';
import Footer from "@/app/components/Footer";
import FileUploader from "../../components/FileUploader";
import PDFConverter from "../../components/PDFConverter";
import { FileUp } from "lucide-react";

export default function ConvertPDFPage() {
  const [file, setFile] = useState(null);
  
  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
  };
  
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Convert PDF</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Convert PDFs to other formats and vice versa.
        </p>
                
        {!file ? (
          <FileUploader 
            onFileUpload={handleFileUpload}
            acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
            maxFileSizeMB={20}
            description="Upload a PDF to convert it to other formats, or upload a file to convert it to PDF."
          />
        ) : (
          <PDFConverter file={file} />
        )}
      </div>
      <Footer />
    </>
  );
}
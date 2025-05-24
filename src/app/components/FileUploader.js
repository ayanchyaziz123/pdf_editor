"use client";
import { useState, useRef } from "react";
import { FileUp, X } from "lucide-react";

export default function FileUploader({ onFileUpload, acceptedFileTypes, maxFileSizeMB = 10 }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  
  const maxSizeInBytes = maxFileSizeMB * 1024 * 1024;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check file type
    if (acceptedFileTypes) {
      const fileType = file.name.split('.').pop().toLowerCase();
      const isAcceptedType = acceptedFileTypes.includes(fileType) || 
                            acceptedFileTypes.includes(`.${fileType}`);
      
      if (!isAcceptedType) {
        setError(`File type .${fileType} is not supported. Please upload a ${acceptedFileTypes} file.`);
        return false;
      }
    }
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds ${maxFileSizeMB}MB limit.`);
      return false;
    }
    
    setError("");
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const clearError = () => {
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex justify-between">
          <p>{error}</p>
          <button onClick={clearError} className="ml-4 text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        } transition-colors duration-200 cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center">
          <FileUp 
            size={48} 
            className={`mb-4 ${dragActive ? "text-blue-500" : "text-gray-400"}`}
          />
          <p className="mb-2 text-lg font-medium">
            {dragActive ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            or click to browse from your computer
          </p>
          <p className="text-xs text-gray-400">
            Maximum file size: {maxFileSizeMB}MB
            {acceptedFileTypes && ` · Supported formats: ${acceptedFileTypes}`}
          </p>
        </div>
      </div>
    </div>
  );
}

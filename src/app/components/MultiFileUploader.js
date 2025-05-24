"use client";
import { useState, useRef } from "react";
import { FileUp, X, File, Trash2 } from "lucide-react";

export default function MultiFileUploader({ onFilesUpload, acceptedFileTypes, maxFileSizeMB = 10 }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
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
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = [...files];
      let hasError = false;
      
      Array.from(e.dataTransfer.files).forEach(file => {
        if (validateFile(file)) {
          newFiles.push(file);
        } else {
          hasError = true;
        }
      });
      
      if (!hasError) {
        setError("");
      }
      
      setFiles(newFiles);
      onFilesUpload(newFiles);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = [...files];
      let hasError = false;
      
      Array.from(e.target.files).forEach(file => {
        if (validateFile(file)) {
          newFiles.push(file);
        } else {
          hasError = true;
        }
      });
      
      if (!hasError) {
        setError("");
      }
      
      setFiles(newFiles);
      onFilesUpload(newFiles);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesUpload(newFiles);
  };

  const clearError = () => {
    setError("");
  };

  const handleClick = () => {
    inputRef.current.click();
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
          multiple
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center">
          <FileUp 
            size={48} 
            className={`mb-4 ${dragActive ? "text-blue-500" : "text-gray-400"}`}
          />
          <p className="mb-2 text-lg font-medium">
            {dragActive ? "Drop your files here" : "Drag & drop your files here"}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            or click to browse from your computer
          </p>
          <p className="text-xs text-gray-400">
            Maximum file size: {maxFileSizeMB}MB per file
            {acceptedFileTypes && ` · Supported formats: ${acceptedFileTypes}`}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files ({files.length})</h3>
          <ul className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`}
                className={`flex items-center justify-between px-4 py-3 ${
                  index !== files.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex items-center">
                  <File size={20} className="text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
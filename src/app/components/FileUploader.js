"use client";
import { useState, useRef } from "react";
import { FileUp, X, CheckCircle, AlertCircle, File } from "lucide-react";

export default function FileUploader({ 
  onFileUpload, 
  acceptedFileTypes, 
  maxFileSizeMB = 10,
  title = "Upload File",
  description = "Select or drag and drop your file to get started",
  multiple = false,
  disabled = false
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const inputRef = useRef(null);
  
  const maxSizeInBytes = maxFileSizeMB * 1024 * 1024;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedTypesDisplay = () => {
    if (!acceptedFileTypes) return "All file types";
    if (Array.isArray(acceptedFileTypes)) {
      return acceptedFileTypes.map(type => type.startsWith('.') ? type.toUpperCase() : `.${type.toUpperCase()}`).join(', ');
    }
    return acceptedFileTypes.toUpperCase();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Reset previous states
    setError("");
    setUploadSuccess(false);
    
    // Check file type
    if (acceptedFileTypes) {
      const fileType = file.name.split('.').pop().toLowerCase();
      const acceptedTypes = Array.isArray(acceptedFileTypes) ? acceptedFileTypes : [acceptedFileTypes];
      const isAcceptedType = acceptedTypes.some(type => 
        type.toLowerCase() === fileType || 
        type.toLowerCase() === `.${fileType}` ||
        type.toLowerCase().replace('.', '') === fileType
      );
      
      if (!isAcceptedType) {
        setError(`File type ".${fileType}" is not supported. Please upload: ${getAcceptedTypesDisplay()}`);
        return false;
      }
    }
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      setError(`File size (${formatFileSize(file.size)}) exceeds the ${maxFileSizeMB}MB limit.`);
      return false;
    }
    
    return true;
  };

  const processFile = async (file) => {
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    setUploadedFileName(file.name);
    
    try {
      await onFileUpload(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setError("Upload failed. Please try again.", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (disabled || isUploading) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const clearError = () => {
    setError("");
  };

  const resetUploader = () => {
    setError("");
    setUploadSuccess(false);
    setUploadedFileName("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button 
              onClick={clearError}
              className="ml-4 text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {uploadSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Successfully uploaded: <span className="font-medium">{uploadedFileName}</span>
              </p>
            </div>
            <button 
              onClick={resetUploader}
              className="ml-4 text-green-400 hover:text-green-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out
          ${disabled 
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60" 
            : dragActive 
              ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]" 
              : error
                ? "border-red-300 hover:border-red-400"
                : uploadSuccess
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={Array.isArray(acceptedFileTypes) ? acceptedFileTypes.join(',') : acceptedFileTypes}
          onChange={handleChange}
          multiple={multiple}
          disabled={disabled || isUploading}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div className={`
            p-3 rounded-full transition-colors duration-200
            ${uploadSuccess 
              ? "bg-green-100" 
              : dragActive 
                ? "bg-blue-100" 
                : "bg-gray-100"
            }
          `}>
            {uploadSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : isUploading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileUp className={`w-8 h-8 ${dragActive ? "text-blue-600" : "text-gray-500"}`} />
            )}
          </div>
          
          {/* Main Text */}
          <div className="space-y-2">
            <p className={`text-lg font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}>
              {isUploading 
                ? "Uploading..." 
                : uploadSuccess 
                  ? "Upload Complete!" 
                  : dragActive 
                    ? "Drop your file here" 
                    : "Drag and drop your file here"
              }
            </p>
            
            {!isUploading && !uploadSuccess && (
              <>
                <p className="text-sm text-gray-500">
                  or <span className="text-blue-600 font-medium">click to browse</span> from your computer
                </p>
                
                {/* File Requirements */}
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <File size={12} />
                    Maximum size: <span className="font-medium">{maxFileSizeMB}MB</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: <span className="font-medium">{getAcceptedTypesDisplay()}</span>
                  </p>
                </div>
              </>
            )}
            
            {uploadSuccess && (
              <button
                onClick={resetUploader}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Upload another file
              </button>
            )}
          </div>
        </div>
        
        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
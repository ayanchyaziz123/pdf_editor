"use client";
import { useState, useRef } from "react";
import { FileUp, X, File, Trash2, AlertCircle, CheckCircle, Plus, FolderOpen } from "lucide-react";

export default function MultiFileUploader({ 
  onFilesUpload, 
  acceptedFileTypes, 
  maxFileSizeMB = 10,
  maxFiles = 10,
  title = "Upload Files",
  description = "Select or drag and drop multiple files to get started",
  disabled = false 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    // You could expand this with more specific icons
    return <File size={20} className="text-blue-500" />;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      // Only set drag inactive if we're leaving the main container
      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      if (
        clientX <= rect.left ||
        clientX >= rect.right ||
        clientY <= rect.top ||
        clientY >= rect.bottom
      ) {
        setDragActive(false);
      }
    }
  };

  const validateFile = (file) => {
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
        return `File type ".${fileType}" is not supported. Please upload: ${getAcceptedTypesDisplay()}`;
      }
    }
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      return `File size (${formatFileSize(file.size)}) exceeds the ${maxFileSizeMB}MB limit.`;
    }
    
    return null;
  };

  const addFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];
    
    Array.from(newFiles).forEach(file => {
      // Check if file already exists
      const isDuplicate = files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (isDuplicate) {
        errors.push(`"${file.name}" is already uploaded`);
        return;
      }
      
      // Check max files limit
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      setError(errors[0]); // Show first error
    } else {
      setError("");
    }
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesUpload(updatedFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (disabled || isUploading) return;
    
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input value to allow same file selection again
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesUpload(newFiles);
    setError(""); // Clear any errors when removing files
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError("");
    onFilesUpload([]);
  };

  const clearError = () => {
    setError("");
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
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
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out
          ${disabled 
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60" 
            : dragActive 
              ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]" 
              : files.length > 0
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
          multiple
          disabled={disabled || isUploading}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div className={`
            p-4 rounded-full transition-colors duration-200
            ${files.length > 0 
              ? "bg-green-100" 
              : dragActive 
                ? "bg-blue-100" 
                : "bg-gray-100"
            }
          `}>
            {files.length > 0 ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : dragActive ? (
              <FolderOpen className="w-10 h-10 text-blue-600" />
            ) : (
              <FileUp className="w-10 h-10 text-gray-500" />
            )}
          </div>
          
          {/* Main Text */}
          <div className="space-y-2">
            <p className={`text-lg font-semibold ${disabled ? "text-gray-400" : "text-gray-900"}`}>
              {files.length > 0 
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected` 
                : dragActive 
                  ? "Drop your files here" 
                  : "Drag and drop files here"
              }
            </p>
            
            <p className="text-sm text-gray-500">
              or <span className="text-blue-600 font-medium cursor-pointer">click to browse</span> from your computer
            </p>
            
            {/* File Requirements */}
            <div className="pt-3 space-y-1">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>Max {maxFiles} files</span>
                <span>•</span>
                <span>Up to {maxFileSizeMB}MB each</span>
              </div>
              <p className="text-xs text-gray-500">
                Supported: <span className="font-medium">{getAcceptedTypesDisplay()}</span>
              </p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus size={16} />
                Add more files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Selected Files ({files.length}/{maxFiles})
                </h4>
                <p className="text-sm text-gray-600">
                  Total size: {formatFileSize(getTotalSize())}
                </p>
              </div>
              <button
                onClick={clearAllFiles}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>
          
          {/* File Items */}
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}-${file.size}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0 mr-4">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
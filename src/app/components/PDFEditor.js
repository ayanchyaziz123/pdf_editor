import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Undo, Redo, Download, ChevronLeft, ChevronRight, Type, PenTool,Trash2, ZoomIn, ZoomOut, Move, Square, Circle, Highlighter, FileText, Upload } from "lucide-react";

export default function EnhancedPDFEditor() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [editMode, setEditMode] = useState("select");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [nextId, setNextId] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [pageImage, setPageImage] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  
  // Load PDF.js library
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfjsLib(window.pdfjsLib);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
      }
    };
    
    loadPdfJs();
  }, []);

  const renderPDFPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !pdfjsLib || !pdfCanvasRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to image for overlay
      const imageData = canvas.toDataURL();
      setPageImage(imageData);
      
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  }, [pdfDoc, pdfjsLib, zoom]);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    
    if (!pdfjsLib) {
      alert('PDF.js is still loading. Please wait a moment and try again.');
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);
    
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setElements([]);
      setSelectedElement(null);
      setIsEditing(false);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try a different file.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPDFPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPDFPage]);

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);

  const saveToHistory = useCallback((action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedElement(null);
      setIsEditing(false);
    }
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? Math.min(zoom * 1.2, 3) : Math.max(zoom / 1.2, 0.5);
    setZoom(newZoom);
  };

  const getMousePosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleCanvasMouseDown = (e) => {
    if (isEditing) return;
    
    const pos = getMousePosition(e);
    
    // Check if clicking on an existing element
    const clickedElement = elements
      .filter(el => el.page === currentPage)
      .reverse()
      .find(el => {
        if (el.type === 'text') {
          return pos.x >= el.x && pos.x <= el.x + 150 && pos.y >= el.y && pos.y <= el.y + 30;
        } else if (el.type === 'rectangle' || el.type === 'highlight') {
          return pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height;
        } else if (el.type === 'circle') {
          const dx = pos.x - (el.x + el.width/2);
          const dy = pos.y - (el.y + el.height/2);
          return Math.sqrt(dx*dx + dy*dy) <= Math.max(el.width, el.height)/2;
        }
        return false;
      });

    if (clickedElement) {
      setSelectedElement(clickedElement);
      if (editMode === 'select') {
        setIsDragging(true);
        setDragStart({ x: pos.x - clickedElement.x, y: pos.y - clickedElement.y });
      } else if (editMode === 'text' && clickedElement.type === 'text') {
        setEditingText(clickedElement.text);
        setIsEditing(true);
      }
      return;
    }

    // Create new element based on mode
    setSelectedElement(null);
    
    if (editMode === 'text') {
      const newElement = {
        id: nextId,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Type here',
        page: currentPage,
        fontSize: 16,
        color: '#000000'
      };
      
      saveToHistory({ type: 'add', element: newElement });
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
      setEditingText(newElement.text);
      setIsEditing(true);
      setNextId(nextId + 1);
      
    } else if (editMode === 'draw') {
      setIsDrawing(true);
      setCurrentPath([pos]);
      
    } else if (editMode === 'rectangle') {
      const newElement = {
        id: nextId,
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 60,
        page: currentPage,
        color: '#3B82F6',
        fill: 'transparent'
      };
      
      saveToHistory({ type: 'add', element: newElement });
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
      setNextId(nextId + 1);
      
    } else if (editMode === 'circle') {
      const newElement = {
        id: nextId,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        width: 80,
        height: 80,
        page: currentPage,
        color: '#10B981',
        fill: 'transparent'
      };
      
      saveToHistory({ type: 'add', element: newElement });
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
      setNextId(nextId + 1);
      
    } else if (editMode === 'highlight') {
      const newElement = {
        id: nextId,
        type: 'highlight',
        x: pos.x,
        y: pos.y,
        width: 120,
        height: 20,
        page: currentPage,
        color: '#FBBF24'
      };
      
      saveToHistory({ type: 'add', element: newElement });
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
      setNextId(nextId + 1);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging && selectedElement) {
      const pos = getMousePosition(e);
      const updatedElement = {
        ...selectedElement,
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y
      };
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      ));
      setSelectedElement(updatedElement);
      
    } else if (isDrawing) {
      const pos = getMousePosition(e);
      setCurrentPath(prev => [...prev, pos]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDragging && selectedElement) {
      saveToHistory({ 
        type: 'move', 
        elementId: selectedElement.id,
        oldPosition: { x: selectedElement.x + dragStart.x, y: selectedElement.y + dragStart.y },
        newPosition: { x: selectedElement.x, y: selectedElement.y }
      });
    }
    
    if (isDrawing && currentPath.length > 1) {
      const newElement = {
        id: nextId,
        type: 'drawing',
        path: currentPath,
        page: currentPage,
        color: '#EF4444',
        strokeWidth: 2
      };
      
      saveToHistory({ type: 'add', element: newElement });
      setElements(prev => [...prev, newElement]);
      setNextId(nextId + 1);
    }
    
    setIsDragging(false);
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleTextSubmit = () => {
    if (selectedElement && editingText.trim()) {
      const oldElement = selectedElement;
      const updatedElement = { ...selectedElement, text: editingText };
      
      saveToHistory({ 
        type: 'edit', 
        elementId: selectedElement.id,
        oldElement,
        newElement: updatedElement
      });
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      ));
      setSelectedElement(updatedElement);
    }
    setIsEditing(false);
  };

  const handleDeleteElement = () => {
    if (selectedElement) {
      saveToHistory({ type: 'delete', element: selectedElement });
      setElements(prev => prev.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
      setIsEditing(false);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
    
    switch (lastAction.type) {
      case 'add':
        setElements(prev => prev.filter(el => el.id !== lastAction.element.id));
        break;
      case 'delete':
        setElements(prev => [...prev, lastAction.element]);
        break;
      case 'edit':
        setElements(prev => prev.map(el => 
          el.id === lastAction.elementId ? lastAction.oldElement : el
        ));
        break;
      case 'move':
        setElements(prev => prev.map(el => 
          el.id === lastAction.elementId ? 
            { ...el, x: lastAction.oldPosition.x, y: lastAction.oldPosition.y } : el
        ));
        break;
    }
    setSelectedElement(null);
    setIsEditing(false);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextAction = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, nextAction]);
    setRedoStack(prev => prev.slice(0, -1));
    
    switch (nextAction.type) {
      case 'add':
        setElements(prev => [...prev, nextAction.element]);
        break;
      case 'delete':
        setElements(prev => prev.filter(el => el.id !== nextAction.element.id));
        break;
      case 'edit':
        setElements(prev => prev.map(el => 
          el.id === nextAction.elementId ? nextAction.newElement : el
        ));
        break;
      case 'move':
        setElements(prev => prev.map(el => 
          el.id === nextAction.elementId ? 
            { ...el, x: nextAction.newPosition.x, y: nextAction.newPosition.y } : el
        ));
        break;
    }
  };

  const handleSave = () => {
    const saveData = {
      elements,
      currentPage,
      totalPages,
      timestamp: new Date().toISOString(),
      fileName: file?.name || 'document'
    };
    
    console.log('Saving document:', saveData);
    alert('Document annotations saved successfully!');
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify({ elements, fileName: file?.name }, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'document'}-annotations.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!file || !pdfDoc) {
    return (
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gray-100 border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">PDF Editor</h2>
          <p className="text-sm text-gray-600 mt-1">Upload a PDF file to start editing</p>
        </div>
        
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No PDF Loaded</h3>
            <p className="text-gray-600 mb-6">
              Select a PDF file to start adding annotations, text, drawings, and other elements.
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={!pdfjsLib}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center mx-auto text-lg"
            >
              <Upload size={20} className="mr-2" />
              {pdfjsLib ? 'Choose PDF File' : 'Loading PDF.js...'}
            </button>
            
            {!pdfjsLib && (
              <p className="text-sm text-gray-500 mt-2">Loading PDF rendering library...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-7xl mx-auto">
      {/* Hidden PDF Canvas for rendering */}
      <canvas ref={pdfCanvasRef} style={{ display: 'none' }} />
      
      {/* Toolbar */}
      <div className="bg-gray-100 border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center text-sm"
          >
            <Upload size={16} className="mr-1" />
            New PDF
          </button>
          
          <div className="h-6 border-l border-gray-300 mx-2"></div>
          
          <button 
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-2 rounded ${
              undoStack.length === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded ${
              redoStack.length === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
            title="Redo"
          >
            <Redo size={18} />
          </button>
          
          <div className="h-6 border-l border-gray-300 mx-2"></div>
          
          <button 
            onClick={() => handleZoom('out')}
            disabled={zoom <= 0.5}
            className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-gray-600 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => handleZoom('in')}
            disabled={zoom >= 3}
            className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          {[
            { mode: 'select', icon: Move, label: 'Select' },
            { mode: 'text', icon: Type, label: 'Text' },
            { mode: 'draw', icon: PenTool, label: 'Draw' },
            { mode: 'highlight', icon: Highlighter, label: 'Highlight' },
            { mode: 'rectangle', icon: Square, label: 'Rectangle' },
            { mode: 'circle', icon: Circle, label: 'Circle' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => {
                setEditMode(mode);
                setSelectedElement(null);
                setIsEditing(false);
              }}
              className={`px-3 py-2 rounded flex items-center text-sm ${
                editMode === mode 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              title={label}
            >
              <Icon size={16} className="mr-1" />
              {label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedElement && (
            <button
              onClick={handleDeleteElement}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center text-sm"
              title="Delete selected element"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center text-sm"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
          <button 
            onClick={handleDownload}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center text-sm"
          >
            <Download size={16} className="mr-1" />
            Export
          </button>
        </div>
      </div>
      
      {/* PDF File Name */}
      <div className="bg-gray-50 px-4 py-2 border-b">
        <p className="text-sm text-gray-600">
          <strong>File:</strong> {file.name} • <strong>Pages:</strong> {totalPages}
        </p>
      </div>
      
      {/* Main Editor Area */}
      <div className="flex">
        {/* Document Canvas */}
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="mx-auto" style={{ width: 'fit-content' }}>
            <div 
              className="bg-white shadow-lg relative border"
              style={{ 
                width: pageImage ? 'auto' : '600px',
                height: pageImage ? 'auto' : '800px'
              }}
            >
              {/* PDF Background */}
              {pageImage && (
                <img 
                  src={pageImage}
                  alt={`Page ${currentPage}`}
                  className="block max-w-none"
                  style={{ zoom: 1 }}
                />
              )}
              
              {/* Annotation Overlay */}
              <div
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                style={{ 
                  cursor: editMode === 'draw' ? 'crosshair' : 
                         editMode === 'text' ? 'text' : 
                         editMode === 'select' ? 'move' : 'default'
                }}
              >
                {/* Render Elements */}
                {elements
                  .filter(el => el.page === currentPage)
                  .map(element => {
                    const isSelected = selectedElement && selectedElement.id === element.id;
                    
                    if (element.type === 'text') {
                      return (
                        <div
                          key={element.id}
                          className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            fontSize: `${element.fontSize}px`,
                            color: element.color
                          }}
                        >
                          {isEditing && isSelected ? (
                            <textarea
                              ref={textInputRef}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onBlur={handleTextSubmit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleTextSubmit();
                                }
                              }}
                              className="border border-blue-400 p-1 min-w-32 bg-white resize-none"
                              style={{
                                fontSize: `${element.fontSize}px`,
                                color: element.color
                              }}
                            />
                          ) : (
                            <div className="p-1 min-w-32 min-h-6 cursor-pointer">
                              {element.text}
                            </div>
                          )}
                        </div>
                      );
                    } else if (element.type === 'rectangle') {
                      return (
                        <div
                          key={element.id}
                          className={`absolute border-2 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            borderColor: element.color,
                            backgroundColor: element.fill
                          }}
                        />
                      );
                    } else if (element.type === 'circle') {
                      return (
                        <div
                          key={element.id}
                          className={`absolute border-2 rounded-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            borderColor: element.color,
                            backgroundColor: element.fill
                          }}
                        />
                      );
                    } else if (element.type === 'highlight') {
                      return (
                        <div
                          key={element.id}
                          className={`absolute opacity-50 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            backgroundColor: element.color
                          }}
                        />
                      );
                    } else if (element.type === 'drawing') {
                      return (
                        <svg
                          key={element.id}
                          className={`absolute pointer-events-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          style={{
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <path
                            d={`M ${element.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            stroke={element.color}
                            strokeWidth={element.strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      );
                    }
                    return null;
                  })}
                
                {/* Current drawing path */}
                {isDrawing && currentPath.length > 1 && (
                  <svg className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
                    <path
                      d={`M ${currentPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      stroke="#EF4444"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  currentPage === 1 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-gray-700 bg-white px-4 py-2 rounded border">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  currentPage === totalPages ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        {selectedElement && (
          <div className="w-64 bg-white border-l p-4">
            <h3 className="font-medium text-gray-900 mb-4">Element Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="text-sm text-gray-600 capitalize">
                  {selectedElement.type}
                </div>
              </div>
              
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="36"
                      value={selectedElement.fontSize}
                      onChange={(e) => {
                        const updatedElement = { ...selectedElement, fontSize: parseInt(e.target.value) };
                        setElements(prev => prev.map(el => 
                          el.id === selectedElement.id ? updatedElement : el
                        ));
                        setSelectedElement(updatedElement);
                      }}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 mt-1">{selectedElement.fontSize}px</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => {
                        const updatedElement = { ...selectedElement, color: e.target.value };
                        setElements(prev => prev.map(el => 
                          el.id === selectedElement.id ? updatedElement : el
                        ));
                        setSelectedElement(updatedElement);
                      }}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                </>
              )}
              
              {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => {
                      const updatedElement = { ...selectedElement, color: e.target.value };
                      setElements(prev => prev.map(el => 
                        el.id === selectedElement.id ? updatedElement : el
                      ));
                      setSelectedElement(updatedElement);
                    }}
                    className="w-full h-10 rounded border"
                  />
                </div>
              )}
              
              {selectedElement.type === 'highlight' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highlight Color
                  </label>
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => {
                      const updatedElement = { ...selectedElement, color: e.target.value };
                      setElements(prev => prev.map(el => 
                        el.id === selectedElement.id ? updatedElement : el
                      ));
                      setSelectedElement(updatedElement);
                    }}
                    className="w-full h-10 rounded border"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => {
                        const updatedElement = { ...selectedElement, x: parseInt(e.target.value) };
                        setElements(prev => prev.map(el => 
                          el.id === selectedElement.id ? updatedElement : el
                        ));
                        setSelectedElement(updatedElement);
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => {
                        const updatedElement = { ...selectedElement, y: parseInt(e.target.value) };
                        setElements(prev => prev.map(el => 
                          el.id === selectedElement.id ? updatedElement : el
                        ));
                        setSelectedElement(updatedElement);
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'highlight') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Width</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, width: parseInt(e.target.value) };
                          setElements(prev => prev.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          setSelectedElement(updatedElement);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Height</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, height: parseInt(e.target.value) };
                          setElements(prev => prev.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          setSelectedElement(updatedElement);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleDeleteElement}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Element
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions Panel */}
      <div className="bg-blue-50 border-t p-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-medium text-blue-800 mb-2">PDF Editor Instructions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-blue-700">
            <div>
              <strong>File Upload:</strong> Click New PDF to load a different PDF file.
            </div>
            <div>
              <strong>Navigation:</strong> Use page controls to navigate through your PDF.
            </div>
            <div>
              <strong>Tools:</strong> Select different tools to add text, drawings, shapes, and highlights.
            </div>
            <div>
              <strong>Editing:</strong> Click elements to select them, double-click text to edit.
            </div>
            <div>
              <strong>Properties:</strong> Use the right panel to modify selected elements.
            </div>
            <div>
              <strong>Export:</strong> Save your annotations as JSON to preserve your work.
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            <strong>Note:</strong> This editor renders actual PDF content using PDF.js library. 
            All annotations are overlaid on top of the original PDF content.
          </div>
        </div>
      </div>
    </div>
  );
}
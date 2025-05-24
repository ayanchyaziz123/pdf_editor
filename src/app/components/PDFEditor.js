import { useState, useEffect, useRef } from "react";
import { Save, Undo, Redo, Download, ChevronLeft, ChevronRight, Type, PenTool, StickyNote, Trash2 } from "lucide-react";

// This component creates a more functional PDF editor with actual text editing capabilities
export default function EnhancedPDFEditor({ file }) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState("text"); // text, draw, annotate
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [nextId, setNextId] = useState(1);
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);
  
  useEffect(() => {
    // Create a URL for the uploaded file to display
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // In a real implementation, we would load the PDF with PDF.js
      // For this demo, we'll simulate loading
      const timer = setTimeout(() => {
        setTotalPages(5); // Placeholder
        setIsLoading(false);
      }, 1000);
      
      return () => {
        URL.revokeObjectURL(url);
        clearTimeout(timer);
      };
    }
  }, [file]);
  
  useEffect(() => {
    // Focus the text input when editing starts
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Save current work before changing pages
      const action = {
        type: "changePage",
        from: currentPage,
        to: newPage,
        elements: [...textElements]
      };
      setUndoStack([...undoStack, action]);
      setRedoStack([]);
      
      setCurrentPage(newPage);
      setSelectedElement(null);
      setIsEditing(false);
    }
  };
  
  const handleCanvasClick = (e) => {
    if (editMode === "text" && !isEditing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create a new text element
      const newElement = {
        id: nextId,
        type: "text",
        x,
        y,
        text: "Type here",
        page: currentPage,
        fontSize: 16,
        color: "#000000"
      };
      
      // Save action for undo
      const action = {
        type: "addElement",
        element: newElement
      };
      setUndoStack([...undoStack, action]);
      setRedoStack([]);
      
      setTextElements([...textElements, newElement]);
      setSelectedElement(newElement);
      setEditingText(newElement.text);
      setIsEditing(true);
      setNextId(nextId + 1);
    } else if (!isEditing) {
      // Deselect when clicking on canvas
      setSelectedElement(null);
    }
  };
  
  const handleTextElementClick = (element, e) => {
    e.stopPropagation();
    
    if (editMode === "text") {
      setSelectedElement(element);
      
      if (e.detail === 2) { // Double click
        setEditingText(element.text);
        setIsEditing(true);
      }
    }
  };
  
  const handleTextChange = (e) => {
    setEditingText(e.target.value);
  };
  
  const handleTextSubmit = () => {
    if (selectedElement) {
      const oldElement = {...selectedElement};
      
      // Update the text element
      const updatedElements = textElements.map(el => 
        el.id === selectedElement.id ? { ...el, text: editingText } : el
      );
      
      // Save action for undo
      const action = {
        type: "editElement",
        oldElement,
        newElement: { ...oldElement, text: editingText }
      };
      setUndoStack([...undoStack, action]);
      setRedoStack([]);
      
      setTextElements(updatedElements);
      setIsEditing(false);
    }
  };
  
  const handleDeleteElement = () => {
    if (selectedElement) {
      // Save action for undo
      const action = {
        type: "deleteElement",
        element: selectedElement
      };
      setUndoStack([...undoStack, action]);
      setRedoStack([]);
      
      const updatedElements = textElements.filter(el => el.id !== selectedElement.id);
      setTextElements(updatedElements);
      setSelectedElement(null);
      setIsEditing(false);
    }
  };
  
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      
      // Apply the undo action
      let newElements = [...textElements];
      
      if (lastAction.type === "addElement") {
        newElements = textElements.filter(el => el.id !== lastAction.element.id);
      } else if (lastAction.type === "editElement") {
        newElements = textElements.map(el => 
          el.id === lastAction.oldElement.id ? lastAction.oldElement : el
        );
      } else if (lastAction.type === "deleteElement") {
        newElements = [...textElements, lastAction.element];
      }
      
      setUndoStack(newUndoStack);
      setRedoStack([...redoStack, lastAction]);
      setTextElements(newElements);
      setSelectedElement(null);
      setIsEditing(false);
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      
      // Apply the redo action
      let newElements = [...textElements];
      
      if (nextAction.type === "addElement") {
        newElements = [...textElements, nextAction.element];
      } else if (nextAction.type === "editElement") {
        newElements = textElements.map(el => 
          el.id === nextAction.newElement.id ? nextAction.newElement : el
        );
      } else if (nextAction.type === "deleteElement") {
        newElements = textElements.filter(el => el.id !== nextAction.element.id);
      }
      
      setRedoStack(newRedoStack);
      setUndoStack([...undoStack, nextAction]);
      setTextElements(newElements);
      setSelectedElement(null);
      setIsEditing(false);
    }
  };
  
  const handleSave = () => {
    // In a real implementation, this would save the edited PDF
    console.log("Saving PDF with edits:", textElements);
    
    // Simulate saving
    alert("PDF saved successfully!");
  };
  
  const handleDownload = () => {
    // In a real implementation, this would generate a new PDF with edits
    alert("In a full implementation, this would download your edited PDF");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-2 rounded ${
              undoStack.length === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded ${
              redoStack.length === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <div className="h-6 border-l border-gray-300 mx-2"></div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setEditMode("text");
                setSelectedElement(null);
                setIsEditing(false);
              }}
              className={`px-3 py-1 rounded flex items-center ${
                editMode === "text" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Type size={16} className="mr-1" />
              Text
            </button>
            <button 
              onClick={() => {
                setEditMode("draw");
                setSelectedElement(null);
                setIsEditing(false);
              }}
              className={`px-3 py-1 rounded flex items-center ${
                editMode === "draw" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <PenTool size={16} className="mr-1" />
              Draw
            </button>
            <button 
              onClick={() => {
                setEditMode("annotate");
                setSelectedElement(null);
                setIsEditing(false);
              }}
              className={`px-3 py-1 rounded flex items-center ${
                editMode === "annotate" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <StickyNote size={16} className="mr-1" />
              Annotate
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedElement && (
            <button
              onClick={handleDeleteElement}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center"
              title="Delete selected element"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded flex items-center"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
          <button 
            onClick={handleDownload}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1 rounded flex items-center"
          >
            <Download size={16} className="mr-1" />
            Download
          </button>
        </div>
      </div>
      
      {/* PDF Preview and Editor */}
      <div className="p-4">
        <div className="bg-gray-100 border rounded-lg p-2 mb-4">
          <div className="w-full h-96 relative" ref={canvasRef} onClick={handleCanvasClick}>
            {/* PDF preview */}
            <iframe 
              src={`${previewUrl}#page=${currentPage}`}
              className="w-full h-full rounded border bg-white"
              title="PDF Preview"
              style={{ pointerEvents: "none" }} // Prevents iframe from capturing clicks
            ></iframe>
            
            {/* Text overlay for editing */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {textElements
                .filter(el => el.page === currentPage)
                .map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer ${
                      selectedElement && selectedElement.id === element.id 
                        ? "ring-2 ring-blue-500" 
                        : ""
                    }`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      pointerEvents: "auto" // Enable clicks on this element
                    }}
                    onClick={(e) => handleTextElementClick(element, e)}
                  >
                    {isEditing && selectedElement && selectedElement.id === element.id ? (
                      <textarea
                        ref={textInputRef}
                        value={editingText}
                        onChange={handleTextChange}
                        onBlur={handleTextSubmit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleTextSubmit();
                          }
                        }}
                        className="border border-blue-400 p-1 min-w-40 bg-white"
                        style={{
                          fontSize: `${element.fontSize}px`,
                          color: element.color
                        }}
                      />
                    ) : (
                      <div 
                        className="p-1 cursor-pointer"
                        style={{
                          fontSize: `${element.fontSize}px`,
                          color: element.color,
                          minWidth: "100px",
                          minHeight: "24px"
                        }}
                      >
                        {element.text}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Page Navigation */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1 rounded ${
              currentPage === 1 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${
              currentPage === totalPages ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      {editMode === "text" && (
        <div className="p-4 bg-blue-50 border-t">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Text Editing Instructions:</h3>
          <ul className="text-xs text-blue-700 list-disc list-inside">
            <li>Click anywhere on the document to add new text</li>
            <li>Double-click on existing text to edit it</li>
            <li>Click once on text to select it (for deletion)</li>
            <li>Press Enter to save text changes</li>
          </ul>
        </div>
      )}
    </div>
  );
}
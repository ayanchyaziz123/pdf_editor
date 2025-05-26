import Link from "next/link";
import { 
  FileEdit,
  Combine,
  Scissors,
  FileArchive,
  FileUp,
  Trash,
  Rotate3d,
  Printer,
  Shuffle,
  Lock,
  Unlock,
  FileImage,
  Type,
  Stamp,
  Search,
  Eye,
  Copy,
  FileText,
  Image,
  PenTool,
  Highlighter,
  MessageSquare,
  BarChart3,
  FileCheck,
  Crop,
  ArrowUpDown,

  Shield,
  Bookmark,
  Layers,

  Zap,
  Settings,

  Hash,

} from "lucide-react";

const tools = [
  // Core PDF Tools
  {
    id: "edit",
    name: "Edit PDF",
    description: "Modify text and images in your PDF files",
    icon: FileEdit,
    color: "bg-blue-500",
    category: "edit"
  },
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    icon: Combine,
    color: "bg-green-500",
    category: "organize"
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split a PDF into multiple files",
    icon: Scissors,
    color: "bg-yellow-500",
    category: "organize"
  },
  {
    id: "delete_page",
    name: "Delete Pages",
    description: "Remove unwanted pages from your PDF",
    icon: Trash,
    color: "bg-red-500",
    category: "organize"
  },
  {
    id: "shuffle",
    name: "Shuffle Pages",
    description: "Reorder and rearrange PDF pages",
    icon: Shuffle,
    color: "bg-indigo-500",
    category: "organize"
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Change the orientation of your PDF pages",
    icon: Rotate3d,
    color: "bg-pink-500",
    category: "organize"
  },

  // Conversion & Format Tools
  {
    id: "convert",
    name: "Convert PDF",
    description: "Convert PDFs to other formats and vice versa",
    icon: FileUp,
    color: "bg-purple-500",
    category: "convert"
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    description: "Extract pages as JPG, PNG, or other image formats",
    icon: FileImage,
    color: "bg-orange-500",
    category: "convert"
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    description: "Create PDF from multiple images",
    icon: Image,
    color: "bg-teal-500",
    category: "convert"
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileText,
    color: "bg-blue-600",
    category: "convert"
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert spreadsheets to PDF format",
    icon: BarChart3,
    color: "bg-emerald-500",
    category: "convert"
  },

  // Security Tools
  {
    id: "protect",
    name: "Protect PDF",
    description: "Add password protection and permissions",
    icon: Lock,
    color: "bg-gray-700",
    category: "security"
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    description: "Remove password protection from PDFs",
    icon: Unlock,
    color: "bg-gray-600",
    category: "security"
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add text or image watermarks to your PDF",
    icon: Stamp,
    color: "bg-cyan-500",
    category: "security"
  },
  {
    id: "redact",
    name: "Redact PDF",
    description: "Permanently remove sensitive information",
    icon: Shield,
    color: "bg-slate-600",
    category: "security"
  },

  // Annotation & Markup Tools
  {
    id: "annotate",
    name: "Annotate PDF",
    description: "Add comments, notes, and markup",
    icon: MessageSquare,
    color: "bg-violet-500",
    category: "annotate"
  },
  {
    id: "highlight",
    name: "Highlight Text",
    description: "Highlight important text and passages",
    icon: Highlighter,
    color: "bg-yellow-400",
    category: "annotate"
  },
  {
    id: "draw",
    name: "Draw on PDF",
    description: "Add drawings, shapes, and freehand annotations",
    icon: PenTool,
    color: "bg-rose-500",
    category: "annotate"
  },
  {
    id: "signature",
    name: "E-Sign PDF",
    description: "Add electronic signatures to documents",
    icon: Type,
    color: "bg-indigo-600",
    category: "annotate"
  },

  // Optimization & Quality Tools
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: FileArchive,
    color: "bg-red-500",
    category: "optimize"
  },
  {
    id: "enhance",
    name: "Enhance PDF",
    description: "Improve image quality and text clarity",
    icon: Zap,
    color: "bg-amber-500",
    category: "optimize"
  },
  {
    id: "crop",
    name: "Crop Pages",
    description: "Trim and crop PDF page margins",
    icon: Crop,
    color: "bg-lime-500",
    category: "optimize"
  },
  {
    id: "repair",
    name: "Repair PDF",
    description: "Fix corrupted or damaged PDF files",
    icon: Settings,
    color: "bg-gray-500",
    category: "optimize"
  },

  // Analysis & Information Tools
  {
    id: "search",
    name: "Search PDF",
    description: "Find and extract text from PDF documents",
    icon: Search,
    color: "bg-blue-400",
    category: "analyze"
  },
  {
    id: "extract-text",
    name: "Extract Text",
    description: "Extract all text content from PDF",
    icon: Type,
    color: "bg-green-400",
    category: "analyze"
  },
  {
    id: "extract-images",
    name: "Extract Images",
    description: "Extract all images from PDF pages",
    icon: Image,
    color: "bg-purple-400",
    category: "analyze"
  },
  {
    id: "pdf-info",
    name: "PDF Info",
    description: "View detailed information about your PDF",
    icon: FileCheck,
    color: "bg-cyan-600",
    category: "analyze"
  },
  {
    id: "compare",
    name: "Compare PDFs",
    description: "Find differences between two PDF files",
    icon: ArrowUpDown,
    color: "bg-orange-600",
    category: "analyze"
  },

  // Advanced Tools
  {
    id: "ocr",
    name: "OCR Text Recognition",
    description: "Convert scanned PDFs to searchable text",
    icon: Eye,
    color: "bg-emerald-600",
    category: "advanced"
  },
  {
    id: "form-filler",
    name: "Fill Forms",
    description: "Fill out PDF forms automatically",
    icon: FileText,
    color: "bg-blue-700",
    category: "advanced"
  },
  {
    id: "bookmark",
    name: "Add Bookmarks",
    description: "Create navigation bookmarks and table of contents",
    icon: Bookmark,
    color: "bg-amber-600",
    category: "advanced"
  },
  {
    id: "batch-process",
    name: "Batch Processing",
    description: "Process multiple PDFs at once",
    icon: Layers,
    color: "bg-slate-500",
    category: "advanced"
  },

  // Utility Tools
  {
    id: "print",
    name: "Print PDF",
    description: "Print your PDFs with customized settings",
    icon: Printer,
    color: "bg-gray-600",
    category: "utility"
  },
  {
    id: "preview",
    name: "PDF Viewer",
    description: "View and navigate PDF files online",
    icon: Eye,
    color: "bg-teal-600",
    category: "utility"
  },
  {
    id: "duplicate",
    name: "Duplicate Pages",
    description: "Create copies of specific pages",
    icon: Copy,
    color: "bg-indigo-400",
    category: "utility"
  },
  {
    id: "page-numbers",
    name: "Add Page Numbers",
    description: "Insert custom page numbers and headers/footers",
    icon: Hash,
    color: "bg-violet-600",
    category: "utility"
  }
];

const categories = {
  edit: "Editing",
  organize: "Organization", 
  convert: "Conversion",
  security: "Security",
  annotate: "Annotation",
  optimize: "Optimization",
  analyze: "Analysis",
  advanced: "Advanced",
  utility: "Utilities"
};

export default function ToolsGrid() {
  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Complete PDF Toolkit
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Everything you need to work with PDF files - from basic editing to advanced processing
        </p>
      </div>

      {Object.entries(groupedTools).map(([categoryKey, categoryTools]) => (
        <div key={categoryKey} className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
            {categories[categoryKey]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryTools.map((tool) => (
              <Link 
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
              >
                <div className="p-6">
                  <div className={`${tool.color} text-white p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <tool.icon size={24} />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-gray-700">
                    {tool.name}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <div className="px-6 pb-4">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {categories[categoryKey]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Need a Custom Tool?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Let us know what PDF tool you need and we'll consider adding it to our toolkit.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Request a Tool
        </button>
      </div>
    </div>
  );
}
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
  TrendingUp,
  Star
} from "lucide-react";

const tools = [
  // Available Tools
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    icon: Combine,
    color: "bg-green-500",
    category: "organize",
    popular: true,
    available: true
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split a PDF into multiple files",
    icon: Scissors,
    color: "bg-yellow-500",
    category: "organize",
    popular: true,
    available: true
  },
  {
    id: "delete_page",
    name: "Delete Pages",
    description: "Remove unwanted pages from your PDF",
    icon: Trash,
    color: "bg-red-500",
    category: "organize",
    popular: true,
    available: true
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: FileArchive,
    color: "bg-red-500",
    category: "optimize",
    available: true
  },
  {
    id: "edit",
    name: "Edit PDF",
    description: "Modify text and images in your PDF files",
    icon: FileEdit,
    color: "bg-blue-500",
    category: "edit",
    popular: true,
    available: true
  },
  {
    id: "shuffle",
    name: "Shuffle Pages",
    description: "Reorder and rearrange PDF pages",
    icon: Shuffle,
    color: "bg-indigo-500",
    category: "organize",
    popular: true,
    available: true
  },

  // Coming Soon Tools
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Change the orientation of your PDF pages",
    icon: Rotate3d,
    color: "bg-pink-500",
    category: "organize",
    available: false
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Change the orientation of your PDF pages",
    icon: Rotate3d,
    color: "bg-pink-500",
    category: "organize",
    available: false
  },

  // Conversion & Format Tools - Coming Soon
  {
    id: "convert",
    name: "Convert PDF",
    description: "Convert PDFs to other formats and vice versa",
    icon: FileUp,
    color: "bg-purple-500",
    category: "convert",
    available: false
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    description: "Extract pages as JPG, PNG, or other image formats",
    icon: FileImage,
    color: "bg-orange-500",
    category: "convert",
    available: false
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    description: "Create PDF from multiple images",
    icon: Image,
    color: "bg-teal-500",
    category: "convert",
    available: false
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileText,
    color: "bg-blue-600",
    category: "convert",
    available: false
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert spreadsheets to PDF format",
    icon: BarChart3,
    color: "bg-emerald-500",
    category: "convert",
    available: false
  },

  // Security Tools - Coming Soon
  {
    id: "protect",
    name: "Protect PDF",
    description: "Add password protection and permissions",
    icon: Lock,
    color: "bg-gray-700",
    category: "security",
    available: false
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    description: "Remove password protection from PDFs",
    icon: Unlock,
    color: "bg-gray-600",
    category: "security",
    available: false
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add text or image watermarks to your PDF",
    icon: Stamp,
    color: "bg-cyan-500",
    category: "security",
    available: false
  },
  {
    id: "redact",
    name: "Redact PDF",
    description: "Permanently remove sensitive information",
    icon: Shield,
    color: "bg-slate-600",
    category: "security",
    available: false
  },

  // Annotation & Markup Tools - Coming Soon
  {
    id: "annotate",
    name: "Annotate PDF",
    description: "Add comments, notes, and markup",
    icon: MessageSquare,
    color: "bg-violet-500",
    category: "annotate",
    available: false
  },
  {
    id: "highlight",
    name: "Highlight Text",
    description: "Highlight important text and passages",
    icon: Highlighter,
    color: "bg-yellow-400",
    category: "annotate",
    available: false
  },
  {
    id: "draw",
    name: "Draw on PDF",
    description: "Add drawings, shapes, and freehand annotations",
    icon: PenTool,
    color: "bg-rose-500",
    category: "annotate",
    available: false
  },
  {
    id: "signature",
    name: "E-Sign PDF",
    description: "Add electronic signatures to documents",
    icon: Type,
    color: "bg-indigo-600",
    category: "annotate",
    available: false
  },

  // Optimization & Quality Tools - Coming Soon (except compress)
  {
    id: "enhance",
    name: "Enhance PDF",
    description: "Improve image quality and text clarity",
    icon: Zap,
    color: "bg-amber-500",
    category: "optimize",
    available: false
  },
  {
    id: "crop",
    name: "Crop Pages",
    description: "Trim and crop PDF page margins",
    icon: Crop,
    color: "bg-lime-500",
    category: "optimize",
    available: false
  },
  {
    id: "repair",
    name: "Repair PDF",
    description: "Fix corrupted or damaged PDF files",
    icon: Settings,
    color: "bg-gray-500",
    category: "optimize",
    available: false
  },

  // Analysis & Information Tools - Coming Soon
  {
    id: "search",
    name: "Search PDF",
    description: "Find and extract text from PDF documents",
    icon: Search,
    color: "bg-blue-400",
    category: "analyze",
    available: false
  },
  {
    id: "extract-text",
    name: "Extract Text",
    description: "Extract all text content from PDF",
    icon: Type,
    color: "bg-green-400",
    category: "analyze",
    available: false
  },
  {
    id: "extract-images",
    name: "Extract Images",
    description: "Extract all images from PDF pages",
    icon: Image,
    color: "bg-purple-400",
    category: "analyze",
    available: false
  },
  {
    id: "pdf-info",
    name: "PDF Info",
    description: "View detailed information about your PDF",
    icon: FileCheck,
    color: "bg-cyan-600",
    category: "analyze",
    available: false
  },
  {
    id: "compare",
    name: "Compare PDFs",
    description: "Find differences between two PDF files",
    icon: ArrowUpDown,
    color: "bg-orange-600",
    category: "analyze",
    available: false
  },

  // Advanced Tools - Coming Soon
  {
    id: "ocr",
    name: "OCR Text Recognition",
    description: "Convert scanned PDFs to searchable text",
    icon: Eye,
    color: "bg-emerald-600",
    category: "advanced",
    available: false
  },
  {
    id: "form-filler",
    name: "Fill Forms",
    description: "Fill out PDF forms automatically",
    icon: FileText,
    color: "bg-blue-700",
    category: "advanced",
    available: false
  },
  {
    id: "bookmark",
    name: "Add Bookmarks",
    description: "Create navigation bookmarks and table of contents",
    icon: Bookmark,
    color: "bg-amber-600",
    category: "advanced",
    available: false
  },
  {
    id: "batch-process",
    name: "Batch Processing",
    description: "Process multiple PDFs at once",
    icon: Layers,
    color: "bg-slate-500",
    category: "advanced",
    available: false
  },

  // Utility Tools - Coming Soon
  {
    id: "print",
    name: "Print PDF",
    description: "Print your PDFs with customized settings",
    icon: Printer,
    color: "bg-gray-600",
    category: "utility",
    available: false
  },
  {
    id: "preview",
    name: "PDF Viewer",
    description: "View and navigate PDF files online",
    icon: Eye,
    color: "bg-teal-600",
    category: "utility",
    available: false
  },
  {
    id: "duplicate",
    name: "Duplicate Pages",
    description: "Create copies of specific pages",
    icon: Copy,
    color: "bg-indigo-400",
    category: "utility",
    available: false
  },
  {
    id: "page-numbers",
    name: "Add Page Numbers",
    description: "Insert custom page numbers and headers/footers",
    icon: Hash,
    color: "bg-violet-600",
    category: "utility",
    available: false
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
  // Get available popular tools only
  const popularToolsOrder = ["merge", "shuffle", "split", "edit", "delete_page"];
  const popularTools = popularToolsOrder
    .map(id => tools.find(tool => tool.id === id))
    .filter(tool => tool && tool.available);
  
  // Group remaining tools by category (excluding popular ones)
  const remainingTools = tools.filter(tool => !tool.popular);
  const groupedTools = remainingTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const ToolCard = ({ tool, isPopular = false }) => {
    const isAvailable = tool.available;
    
    const CardContent = (
      <div className={`group bg-white rounded-xl shadow-sm transition-all duration-300 overflow-hidden border border-gray-100 ${
        isAvailable 
          ? `hover:shadow-lg hover:border-gray-200 ${isPopular ? 'hover:shadow-xl' : ''}` 
          : 'opacity-75'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${tool.color} text-white p-3 rounded-lg inline-block ${
              isAvailable ? 'group-hover:scale-110' : ''
            } transition-transform duration-200 relative`}>
              <tool.icon size={24} />
              {!isAvailable && (
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-bold">?</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {isPopular && isAvailable && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Star size={12} className="fill-current" />
                  Popular
                </div>
              )}
              {!isAvailable && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  <span>🚧</span>
                  Coming Soon
                </div>
              )}
            </div>
          </div>
          <h4 className={`text-lg font-semibold mb-2 ${
            isAvailable 
              ? 'text-gray-900 group-hover:text-gray-700' 
              : 'text-gray-500'
          }`}>
            {tool.name}
          </h4>
          <p className={`text-sm leading-relaxed ${
            isAvailable ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {isAvailable ? tool.description : "This feature is currently under development and will be available soon."}
          </p>
        </div>
        <div className="px-6 pb-4">
          <div className={`text-xs font-medium uppercase tracking-wider ${
            isAvailable ? 'text-gray-400' : 'text-gray-300'
          }`}>
            {categories[tool.category]}
          </div>
        </div>
      </div>
    );

    if (isAvailable) {
      return (
        <Link 
          key={tool.id}
          href={`/tools/${tool.id}`}
          className="cursor-pointer"
        >
          {CardContent}
        </Link>
      );
    } else {
      return (
        <div key={tool.id} className="cursor-not-allowed">
          {CardContent}
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Most Popular Tools Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Most Popular Tools</h3>
            <p className="text-gray-600 mt-1">The most commonly used PDF tools by our users</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} isPopular={true} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-100 mb-16"></div>

      {/* All Tools by Category */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">All PDF Tools</h3>
        <p className="text-gray-600">Complete toolkit for all your PDF needs, organized by category</p>
      </div>

      {Object.entries(groupedTools).map(([categoryKey, categoryTools]) => (
        <div key={categoryKey} className="mb-16">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
            {categories[categoryKey]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Need a Custom Tool?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Can&apos;t find what you&apos;re looking for? Let us know what PDF tool you need and we&apos;ll consider adding it to our toolkit.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Request a Tool
        </button>
      </div>
    </div>
  );
}
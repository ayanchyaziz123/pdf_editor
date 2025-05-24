import Link from "next/link";
import { 
  FileEdit, 
  Combine, 
  Scissors, 
  FileArchive, 
  FileUp, 
  Trash
} from "lucide-react";

const tools = [
  {
    id: "edit",
    name: "Edit PDF",
    description: "Modify text and images in your PDF files",
    icon: FileEdit,
    color: "bg-blue-500",
  },
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    icon: Combine,
    color: "bg-green-500",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split a PDF into multiple files",
    icon: Scissors,
    color: "bg-yellow-500",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: FileArchive,
    color: "bg-red-500",
  },
  {
    id: "convert",
    name: "Convert PDF",
    description: "Convert PDFs to other formats and vice versa",
    icon: FileUp,
    color: "bg-purple-500",
  },
  {
    id: "delete_page",
    name: "Delete Pages",
    description: "Delete specific page",
    icon: Trash,
    color: "bg-indigo-500",
  },
  // {
  //   id: "rotate",
  //   name: "Rotate PDF",
  //   description: "Change the orientation of your PDF pages",
  //   icon: Rotate3d,
  //   color: "bg-pink-500",
  // },
  // {
  //   id: "print",
  //   name: "Print PDF",
  //   description: "Print your PDFs with customized settings",
  //   icon: Printer,
  //   color: "bg-gray-500",
  // },
];

export default function ToolsGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-center mb-12">Our PDF Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            href={`/tools/${tool.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className={`${tool.color} text-white p-3 rounded-md inline-block mb-4`}>
                <tool.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
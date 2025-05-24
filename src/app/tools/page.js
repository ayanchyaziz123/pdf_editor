import Navbar from "../components/Navbar";
import ToolsGrid from "../components/ToolsGrid";
import Footer from "../components/Footer";

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">All PDF Tools</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Explore our complete collection of tools designed to help you work with PDF files efficiently.
        </p>
        <ToolsGrid />
      </div>
      <Footer />
    </>
  );
}
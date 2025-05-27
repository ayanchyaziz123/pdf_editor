import Navbar from "./components/Navbar";
import ToolsGrid from "./components/ToolsGrid";
import Footer from "./components/Footer";


export default function Home() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ToolsGrid />
      </div>
      <Footer />
    </>
  );
}

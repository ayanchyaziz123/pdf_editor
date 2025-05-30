import Navbar from "./components/Navbar";
import ToolsGrid from "./components/ToolsGrid";
import Footer from "./components/Footer";
import AdBanner from "./components/AdBanner";

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Top banner ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdBanner 
          dataAdSlot="YOUR_AD_SLOT_ID_HERE" 
          className="mb-6"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ToolsGrid />
      </div>
      
      {/* Bottom banner ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <AdBanner 
          dataAdSlot="YOUR_SECOND_AD_SLOT_ID_HERE" 
          className="mt-6"
        />
      </div>
      
      <Footer />
    </>
  );
}
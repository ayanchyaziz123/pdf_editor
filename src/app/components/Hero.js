import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Powerful PDF Tools
          </h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">
            Edit, merge, split, compress, and more. All your PDF needs in one place.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/tools/edit" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium shadow-md mr-4"
            >
              Edit PDF
            </Link>
            <Link 
              href="/tools" 
              className="border border-white text-white hover:bg-blue-600 px-6 py-3 rounded-md font-medium"
            >
              View All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
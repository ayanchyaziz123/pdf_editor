import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PDF Toolkit</h3>
            <p className="text-gray-300">
              A comprehensive suite of tools for all your PDF needs.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/edit" className="text-gray-300 hover:text-white">
                  Edit PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/merge" className="text-gray-300 hover:text-white">
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link href="/tools/split" className="text-gray-300 hover:text-white">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/compress" className="text-gray-300 hover:text-white">
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PDF Toolkit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
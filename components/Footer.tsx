"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f8f5ef] py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 px-4 text-sm text-gray-600">
        <span className="font-medium">the flex.</span>

        <nav className="flex items-center gap-4">
          <a href="/properties" className="hover:text-gray-900">Public Reviews</a>
          <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-900">Terms</a>
        </nav>

        <span className="text-gray-500">© {new Date().getFullYear()} Flex Living</span>
      </div>
    </footer>
  );
}
import Link from "next/link";

export default function ProfileLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-[#EDD8B4]/30 h-fit">
          <nav className="space-y-2">
            <Link
              href="/profile"
              className="block px-4 py-3 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] font-medium"
            >
              Overview
            </Link>
            <Link
              href="/profile/orders"
              className="block px-4 py-3 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] font-medium"
            >
              My Orders
            </Link>
            <Link
              href="/profile/address"
              className="block px-4 py-3 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] font-medium"
            >
              Addresses
            </Link>
            <Link
              href="/profile/reviews"
              className="block px-4 py-3 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] font-medium"
            >
              My Reviews
            </Link>
            <form
              action="/api/auth/logout"
              method="POST"
              className="pt-4 mt-4 border-t border-[#EDD8B4]/30"
            >
              <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
                Sign Out
              </button>
            </form>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-[#EDD8B4]/30">
          {children}
        </main>
      </div>
    </div>
  );
}

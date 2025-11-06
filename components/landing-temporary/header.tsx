export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-playfair text-2xl font-bold tracking-tight">Kalnut</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm tracking-wide hover:text-gray-600 transition-all duration-500 ease-out"
          >
            FEATURES
          </a>
          <a
            href="#how-it-works"
            className="text-sm tracking-wide hover:text-gray-600 transition-all duration-500 ease-out"
          >
            HOW IT WORKS
          </a>
          <a href="#" className="text-sm tracking-wide hover:text-gray-600 transition-all duration-500 ease-out">
            ABOUT
          </a>
        </nav>
      </div>
    </header>
  )
}

import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  return (
    <div className="pb-20">
      <header className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-3">
        <div className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-2">
          <SearchIcon size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            disabled
          />
        </div>
      </header>

      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">Search functionality is UI-only</p>
      </div>
    </div>
  )
}


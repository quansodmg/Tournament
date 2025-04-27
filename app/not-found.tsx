import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <path d="M14 2v6h6"></path>
            <path d="M12 18v-6"></path>
            <path d="M9.5 15.5 12 18l2.5-2.5"></path>
          </svg>
          <h2 className="text-xl font-bold text-blue-600">Page Not Found</h2>
        </div>
        <p className="mb-4 text-gray-700">
          We couldn't find the page you were looking for. The page might have been moved, deleted, or never existed.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block">
            Return to home
          </Link>
          <Link href="/games" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded inline-block">
            Browse Games
          </Link>
        </div>
      </div>
    </div>
  )
}

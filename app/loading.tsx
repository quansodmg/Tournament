export default function Loading() {
  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <div className="border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

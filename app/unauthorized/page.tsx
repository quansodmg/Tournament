import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth">Sign in with a different account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

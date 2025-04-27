import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function VerifyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Check Your Email</CardTitle>
            </div>
            <CardDescription>
              We've sent you a verification email. Please check your inbox and click the verification link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              If you don't see the email, check your spam folder. The verification link will expire after 24 hours.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth" className="text-sm text-blue-600 hover:text-blue-800">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

import HomeClientWrapper from "./home-client-wrapper"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function Home() {
  console.log("Home page rendering")

  return (
    <main>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading home page...</p>
          </div>
        }
      >
        <HomeClientWrapper />
      </Suspense>
    </main>
  )
}

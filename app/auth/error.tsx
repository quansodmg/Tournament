"use client"

export default function AuthError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  // No hooks, no imports, just plain JavaScript
  // Determine error type
  let errorTitle = "Authentication Error"
  let errorDescription = "There was a problem with authentication."
  let isRedirectError = false

  if (error?.message) {
    const message = error.message.toLowerCase()

    // Check for specific error types
    if (message.includes("redirect") || message.includes("callback") || message.includes("url")) {
      errorTitle = "Authentication Issue"
      errorDescription = "We encountered an issue during the sign-in process. You'll be redirected to the home page."
      isRedirectError = true

      // Redirect after 2 seconds (reduced from 3)
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } else if (message.includes("email")) {
      errorTitle = "Email Error"
      errorDescription = "There was a problem with your email address."
    } else if (message.includes("password")) {
      errorTitle = "Password Error"
      errorDescription = "There was a problem with your password."
    } else if (message.includes("rate limit") || message.includes("too many")) {
      errorTitle = "Too Many Attempts"
      errorDescription = "You have made too many attempts. Please try again later."
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <div
        style={{
          border: "1px solid #fef3c7",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          backgroundColor: "#fffbeb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
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
            style={{ color: "#d97706" }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#d97706", margin: 0 }}>{errorTitle}</h2>
        </div>
        <p style={{ marginBottom: "1rem", color: "#374151" }}>{errorDescription}</p>
        <div
          style={{
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "0.375rem",
            border: "1px solid #fde68a",
            marginBottom: "1rem",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            overflow: "auto",
            maxHeight: "8rem",
          }}
        >
          {error?.message || "An unknown authentication error occurred"}
          {error?.digest && <div style={{ marginTop: "0.5rem", color: "#6b7280" }}>Error ID: {error.digest}</div>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!isRedirectError && (
            <button
              onClick={() => {
                window.location.href = "/auth"
              }}
              style={{
                backgroundColor: "#d97706",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          )}
          <a
            href="/"
            style={{
              backgroundColor: "white",
              color: "#d97706",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "1px solid #d97706",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Return to home
          </a>
        </div>
      </div>
    </div>
  )
}

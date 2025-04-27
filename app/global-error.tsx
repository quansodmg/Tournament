"use client"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              border: "1px solid #fee2e2",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              backgroundColor: "#fef2f2",
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
                style={{ color: "#dc2626" }}
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#dc2626", margin: 0 }}>Critical Error</h2>
            </div>
            <p style={{ marginBottom: "1rem", color: "#374151" }}>
              We apologize for the inconvenience. A critical error has occurred in the application.
            </p>
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px solid #fecaca",
                marginBottom: "1rem",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                overflow: "auto",
                maxHeight: "8rem",
              }}
            >
              {error?.message || "An unknown error occurred"}
              {error?.digest && <div style={{ marginTop: "0.5rem", color: "#6b7280" }}>Error ID: {error.digest}</div>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  window.location.reload()
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  backgroundColor: "white",
                  color: "#dc2626",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #dc2626",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Return to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

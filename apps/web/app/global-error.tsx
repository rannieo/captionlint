"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "#0b0f14",
          color: "#f9fafb",
          fontFamily: 'Inter, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #1f2937",
              borderRadius: "8px",
              background: "#111827",
              padding: "28px",
            }}
          >
            <title>Something went wrong | CaptionLint</title>
            <p
              style={{
                margin: "0 0 10px",
                color: "#22c55e",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              CaptionLint
            </p>
            <h1 style={{ margin: "0 0 12px", fontSize: "28px", lineHeight: 1.15 }}>
              Something went wrong.
            </h1>
            <p style={{ margin: "0 0 22px", color: "#9ca3af", lineHeight: 1.6 }}>
              The app hit an unexpected error. Retry the page, or refresh if the problem continues.
            </p>
            {error.digest ? (
              <p style={{ margin: "0 0 22px", color: "#6b7280", fontSize: "13px" }}>
                Error reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                minHeight: "40px",
                border: 0,
                borderRadius: "6px",
                background: "#22c55e",
                color: "#003915",
                font: "inherit",
                fontWeight: 700,
                padding: "0 16px",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

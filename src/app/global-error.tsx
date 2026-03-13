'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-8">{error.message || "A global application error occurred."}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-black text-white rounded-xl font-bold"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

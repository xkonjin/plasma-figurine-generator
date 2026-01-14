export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf9] to-[#e8f0ed]">
      <div className="w-full max-w-md px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#DCEFEA] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#162F29]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 mb-6">
            We sent a magic link to your email address. Click the link to sign
            in.
          </p>

          <div className="bg-[#f8faf9] rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">
              Didn&apos;t receive it?
            </p>
            <p>Check your spam folder or try signing in again.</p>
          </div>

          <a
            href="/login"
            className="inline-block mt-6 text-[#162F29] font-medium hover:underline"
          >
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}

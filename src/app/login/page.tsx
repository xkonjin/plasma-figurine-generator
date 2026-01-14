"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "InvalidLink") {
      setError("Invalid magic link. Please request a new one.");
    } else if (errorParam === "InvalidOrExpired") {
      setError("Magic link has expired. Please request a new one.");
    } else if (errorParam === "VerificationFailed") {
      setError("Verification failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate @plasma.to email
    if (!email.toLowerCase().endsWith("@plasma.to")) {
      setError("Only @plasma.to email addresses can access this app");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send magic link");
      } else {
        // Redirect to verify page
        window.location.href = "/verify";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf9] to-[#e8f0ed]">
      <div className="w-full max-w-md px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl plasma-green flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              P
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Plasma Figurine Generator
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in with your Plasma email to create your figurine
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@plasma.to"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#162F29] focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "plasma-green hover:opacity-90"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending magic link...
                </span>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Only @plasma.to team members can access this app
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf9] to-[#e8f0ed]">
        <div className="w-16 h-16 rounded-2xl plasma-green flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-pulse">
          P
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}

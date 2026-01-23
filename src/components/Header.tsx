"use client";

import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="py-8 mb-8">
      <div className="flex justify-between items-start">
        <div className="flex-1" />
        
        <div className="text-center flex-1">
          <div className="w-20 h-20 mx-auto mb-6 plasma-green rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-semibold plasma-green-text mb-3">
            Plasma Figurine Generator
          </h1>
          <p className="text-[#295B4F] text-lg max-w-xl mx-auto">
            Create your personalized isometric miniature figurine with your brand.
            Upload a photo, your logo, customize your pose, and generate!
          </p>
        </div>

        <div className="flex-1 flex justify-end">
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

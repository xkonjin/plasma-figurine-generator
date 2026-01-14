import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return NextResponse.redirect(new URL("/login?error=InvalidLink", request.url));
  }

  try {
    // Attempt to sign in with the credentials provider
    const result = await signIn("magic-link", {
      email,
      token,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.redirect(new URL("/login?error=InvalidOrExpired", request.url));
    }

    // Redirect to home page on success
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", request.url));
  }
}

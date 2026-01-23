import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { paymentMiddleware } from "./lib/payment-middleware";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/verify") ||
    req.nextUrl.pathname.startsWith("/api/auth");

  // Allow auth pages and API routes
  if (isAuthPage) {
    // Redirect logged-in users away from login page
    if (isLoggedIn && req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Apply payment middleware to /api/generate endpoint
  if (req.nextUrl.pathname === "/api/generate") {
    const paymentResponse = await paymentMiddleware(req);
    if (paymentResponse) {
      return paymentResponse;
    }
    // If payment middleware returns null, continue (plasma.to user or payment confirmed)
    return NextResponse.next();
  }

  // Allow anonymous access to home page
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and API routes (except auth)
    "/((?!_next/static|_next/image|favicon.ico|api/generate|api/gallery).*)",
  ],
};

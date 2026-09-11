import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;

  const protectedRoutes = [
    "/dashboard",
    "/upload",
    "/analytics",
    "/match",
    "/ats",
    "/candidates",
    "/jobs",
    "/pipeline",
    "/interviews",
    "/settings",
  ];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/analytics/:path*",
    "/match/:path*",
    "/ats/:path*",
    "/candidates/:path*",
    "/jobs/:path*",
    "/pipeline/:path*",
    "/interviews/:path*",
    "/settings/:path*",
  ],
};

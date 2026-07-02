import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPortalRoute = createRouteMatcher(["/portal", "/api/billing(.*)"]);

function requireBasicAdmin(request: NextRequest) {
  const username = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASSWORD;

  if (!username || !password) {
    return null;
  }

  const authorization = request.headers.get("authorization");
  const expected = `Basic ${btoa(`${username}:${password}`)}`;

  if (authorization === expected) {
    return null;
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="First Ring Admin"',
    },
  });
}

export const proxy = clerkMiddleware(async (auth, request: NextRequest) => {
  if (isAdminRoute(request)) {
    const adminResponse = requireBasicAdmin(request);

    if (adminResponse) {
      return adminResponse;
    }
  }

  if (isPortalRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/api/billing/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jay_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
);

/**
 * Gate the admin area. The public site needs no login; only /admin/** (aside
 * from the login page) requires a valid session. Verification happens at the
 * edge so unauthenticated users never reach admin server components.
 */
async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAdmin) return NextResponse.next();

  const authed = await isAuthenticated(req);

  if (isLoginPage) {
    // Already logged in? Skip the login page.
    if (authed) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

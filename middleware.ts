import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (!(await verifySession(req.cookies.get(COOKIE)?.value)))
    return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
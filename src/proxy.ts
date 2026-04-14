import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // Temporarily bypass Supabase to diagnose issue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
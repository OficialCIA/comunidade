import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // TODO: Re-add Supabase auth (updateSession) once the 404 root cause is resolved.
  // Temporarily bypassing Supabase to confirm routing/infrastructure works independently.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
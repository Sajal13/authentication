import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export default async function middleware(request: NextRequest) {
  const session = await getSession();

  // Check if the user is authenticated
  if (!session || !session.user) {
    // If not authenticated, redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If authenticated, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', "/dashboard"], // Adjust paths as needed
};
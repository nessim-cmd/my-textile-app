import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  console.log("Middleware running for:", request.url);

  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    console.log("Public route detected:", request.url);
    return NextResponse.next();
  }

  // Protect all non-public routes
  const { userId } = await auth.protect();
  console.log("User ID from auth.protect:", userId);

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/admin(.*)",
  ],
};
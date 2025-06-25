import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/about-us",
]);

const isPublicApiRoute = createRouteMatcher([
  "/home",
  "/api/main"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const pathname = currentUrl.pathname;
  const isApiRequest = pathname.startsWith("/api");
  if (!userId) {
    if (!isPublicRoute(req) && !(isApiRequest && isPublicApiRoute(req))) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

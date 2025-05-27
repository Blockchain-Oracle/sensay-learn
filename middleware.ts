import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@privy-io/server-auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("privy-token")?.value

  // Protected routes
  const protectedPaths = ["/dashboard", "/learn"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const claims = await verifyAuthToken(token, process.env.PRIVY_APP_SECRET!)

      // Add user info to headers for API routes
      const response = NextResponse.next()
      response.headers.set("x-user-id", claims.userId)
      response.headers.set("x-privy-user-id", claims.userId)
      return response
    } catch (error) {
      console.error("Token verification failed:", error)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/api/protected/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|$).*)",
  ],
}

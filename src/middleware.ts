import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/', '/sign-in', '/sign-up', '/auth/callback']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )

  // Redirect to sign-in if accessing protected route without auth
  if (!isPublicRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return Response.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

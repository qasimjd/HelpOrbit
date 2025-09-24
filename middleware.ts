import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Get session cookie to check authentication status
    // WARNING: This only checks for cookie existence, not validation!
    // Always validate sessions on server-side for security-critical operations
    const sessionCookie = getSessionCookie(request);
    const isAuthenticated = !!sessionCookie;
    
    // Define route patterns
    const isAuthRoute = pathname.startsWith('/login') || 
                       pathname.startsWith('/signup') || 
                       pathname.startsWith('/create-organization') ||
                       pathname.startsWith('/select-organization') ||
                       pathname.match(/^\/org\/[^\/]+\/(login|forgot-password)$/);
    
    const isOrganizationProtectedRoute = pathname.match(/^\/org\/[^\/]+\/(dashboard|members|settings|tickets)/);
    const isGeneralProtectedRoute = pathname.startsWith('/organizations');
    const isProtectedRoute = isOrganizationProtectedRoute || isGeneralProtectedRoute;
    
    const isPublicRoute = pathname === '/' ||
                         pathname.startsWith('/api/') ||
                         pathname.startsWith('/_next') ||
                         pathname.startsWith('/favicon.ico') ||
                         pathname.includes('.') ||
                         pathname.match(/^\/org\/[^\/]+$/); // Allow org landing pages
    
    // Skip middleware for API routes and static files
    if (pathname.startsWith('/api/') || 
        pathname.startsWith('/_next') || 
        pathname.includes('.')) {
        return NextResponse.next();
    }
    
    // Handle authentication logic
    if (isAuthenticated) {
        // If authenticated and trying to access auth pages, redirect to select organization
        if (isAuthRoute && !pathname.match(/^\/org\/[^\/]+\/(login|forgot-password)$/)) {
            return NextResponse.redirect(new URL('/select-organization', request.url));
        }
        
        // If trying to access root, redirect to select organization
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/select-organization', request.url));
        }
        
        // Allow authenticated users to access organization login/forgot-password 
        // (the pages themselves will handle redirection if user has access)
        if (pathname.match(/^\/org\/[^\/]+\/(login|forgot-password)$/)) {
            return NextResponse.next();
        }
    } else {
        // If not authenticated and trying to access protected routes
        if (isProtectedRoute) {
            // For organization-specific protected routes, redirect to that org's login
            if (isOrganizationProtectedRoute) {
                const orgSlugMatch = pathname.match(/^\/org\/([^\/]+)/);
                if (orgSlugMatch) {
                    const orgSlug = orgSlugMatch[1];
                    return NextResponse.redirect(new URL(`/org/${orgSlug}/login`, request.url));
                }
            }
            
            // For general protected routes, redirect to general login
            return NextResponse.redirect(new URL('/login', request.url));
        }
        
        // If trying to access root while not authenticated, redirect to login
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
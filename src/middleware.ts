import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('auth_logged_in')

    // Si el usuario intenta acceder a rutas protegidas sin la cookie de sesión
    // Se redirecciona al inicio.
    // Nota: La cookie 'auth_logged_in' es gestionada por AuthContext.tsx

    if (!authCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

// Configurar en qué rutas se ejecuta este middleware
export const config = {
    matcher: [
        '/perfil/:path*',
    ],
}

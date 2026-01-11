import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Dashboard rotalarını kontrol et
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Token'ı cookie'den al
        const token = request.cookies.get('token')?.value

        // Token yoksa login'e yönlendir
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        try {
            // Token'ı decode et (basit base64 decode - JWT için daha güvenli bir yöntem kullanılabilir)
            const payload = JSON.parse(
                Buffer.from(token.split('.')[1], 'base64').toString()
            )

            // Kullanıcı rolünü kontrol et
            if (payload.role !== 'admin') {
                // Admin değilse ana sayfaya yönlendir
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (error) {
            // Token decode edilemezse login'e yönlendir
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

// Middleware'in hangi rotalar için çalışacağını belirt
export const config = {
    matcher: '/dashboard/:path*',
}

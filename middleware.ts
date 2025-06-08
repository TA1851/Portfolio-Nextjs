import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // メール認証関連の一般的なパスパターンを検出してリダイレクト
  const verificationPaths = [
    '/email-verification',
    '/verify',
    '/confirm-email',
    '/email-confirm',
    '/account-verification',
    '/user/verify',
    '/auth/verify',
    '/v1/verify-email',
    '/email_verification',
    '/verify_email',
    '/confirm_email',
    '/account_verification',
    '/user_verify',
    '/auth_verify',
    '/verification/email',
  ];

  // APIパスは除外（APIエンドポイント自体がリダイレクト処理を行うため）
  const isApiPath = pathname.startsWith('/api/');

  // パスがメール認証関連でAPIパスでない場合、/verify-email にリダイレクト
  if (!isApiPath && verificationPaths.some(path => pathname.startsWith(path))) {
    const redirectUrl = new URL('/verify-email', request.url);
    redirectUrl.search = search; // クエリパラメータを保持
    
    console.log(`Middleware redirect: ${pathname}${search} -> /verify-email${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // その他のリクエストは通常通り処理
  return NextResponse.next();
}

export const config = {
  // ミドルウェアを適用するパスを指定
  matcher: [
    '/email-verification/:path*',
    '/verify/:path*',
    '/confirm-email/:path*',
    '/email-confirm/:path*',
    '/account-verification/:path*',
    '/user/verify/:path*',
    '/auth/verify/:path*',
  ],
};

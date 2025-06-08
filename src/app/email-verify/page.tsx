'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function EmailVerifyRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const redirectUrl = `/verify-email${queryString ? `?${queryString}` : ''}`;
    console.log('Redirecting from /email-verify to:', redirectUrl);
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">メール認証ページにリダイレクト中...</p>
      </div>
    </div>
  );
}

export default function EmailVerifyRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <EmailVerifyRedirectContent />
    </Suspense>
  );
}

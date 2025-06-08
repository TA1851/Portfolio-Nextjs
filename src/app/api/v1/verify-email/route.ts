import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    // Accept ヘッダーをチェックして、ブラウザからの直接アクセスかどうかを判定
    const acceptHeader = request.headers.get('accept') || '';
    const isDirectBrowserAccess = acceptHeader.includes('text/html');

    // ブラウザからの直接アクセスの場合、フロントエンドの検証ページにリダイレクト
    if (isDirectBrowserAccess) {
      const params = new URLSearchParams();
      if (token) params.append('token', token);
      if (email) params.append('email', email);
      if (code) params.append('code', code);
      
      const redirectUrl = `/verify-email?${params.toString()}`;
      console.log('Redirecting browser to frontend verification page:', redirectUrl);
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // APIリクエストの場合は通常の処理を続行
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
    
    // パラメータをバックエンドAPIに転送
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    if (email) params.append('email', email);
    if (code) params.append('code', code);

    const backendUrl = `${apiUrl}/verify-email?${params.toString()}`;
    
    console.log('Forwarding verification request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // CORS ヘッダーを設定
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // ステータスコードに応じた処理
    if (response.status === 400) {
      return NextResponse.json({
        detail: data.detail || 'リクエストが無効です。',
        error: 'INVALID_REQUEST'
      }, { status: 400, headers });
    }

    if (response.status === 404) {
      return NextResponse.json({
        detail: data.detail || 'トークンが見つかりません。',
        error: 'TOKEN_NOT_FOUND'
      }, { status: 404, headers });
    }

    if (response.status === 409) {
      return NextResponse.json({
        detail: 'このメールアドレスは既に認証済みです。',
        isAlreadyVerified: true
      }, { status: 409, headers });
    }

    if (!response.ok) {
      console.error('Backend API error:', response.status, data);
      return NextResponse.json({
        detail: data.detail || 'メール認証に失敗しました。',
        error: 'VERIFICATION_FAILED'
      }, { status: response.status, headers });
    }

    // 成功時
    return NextResponse.json({
      message: 'メール認証が完了しました。',
      success: true,
      ...data
    }, { status: 200, headers });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({
      detail: 'サーバーエラーが発生しました。',
      error: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

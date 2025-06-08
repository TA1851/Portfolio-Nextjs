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
    
    if (!token) {
      return NextResponse.json(
        { detail: 'トークンが必要です' },
        { status: 400 }
      );
    }

    // バックエンドAPIに転送
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
    const response = await fetch(
      `${apiUrl}/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    // エラーレスポンスの詳細ログ出力
    if (!response.ok) {
      console.log(`Backend API error: ${response.status} - ${JSON.stringify(data)}`);
      
      // HTTP 409 (Conflict) への特別な処理
      if (response.status === 409) {
        return NextResponse.json({
          detail: 'このメールアドレスは既に認証済みです。ログインページに進んでください。',
          isAlreadyVerified: true,
          originalMessage: data.detail || data.message
        }, {
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
      
      // HTTP 400 (Bad Request) - 無効なトークンなど
      if (response.status === 400) {
        return NextResponse.json({
          detail: data.detail || data.message || '無効なトークンまたはリクエストです。メール内のリンクを再度確認してください。',
          error: 'INVALID_TOKEN'
        }, {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
      
      // HTTP 404 (Not Found) - トークンが存在しない
      if (response.status === 404) {
        return NextResponse.json({
          detail: 'トークンが見つかりません。認証リンクの有効期限が切れている可能性があります。',
          error: 'TOKEN_NOT_FOUND'
        }, {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
    }
    
    // 成功時のレスポンスを標準化
    if (response.status >= 200 && response.status < 300) {
      console.log('Backend verification successful:', data);
      return NextResponse.json({
        success: true,
        message: data.message || data.detail || 'メールアドレスの確認が完了しました。仮パスワードを変更して登録を完了してください。',
        email: data.email,
        user_id: data.user_id,
        ...data
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

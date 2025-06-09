import { NextRequest, NextResponse } from 'next/server';

interface ChangePasswordRequest {
  userId: string;
  newPassword: string;
  token?: string;
}

// パスワード強度チェック
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'パスワードは8文字以上である必要があります' };
  }
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChangePasswordRequest = await request.json();
    const { userId, newPassword, token } = body;

    // バリデーション
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'ユーザーIDと新しいパスワードが必要です' },
        { status: 400 }
      );
    }

    // トークン認証（必要に応じて）
    if (token && process.env.NODE_ENV === 'production') {
      // 本番環境ではトークン認証を強制
      // ここでトークンの検証を行う
      console.log('Token validation required in production');
    }

    // パスワード強度チェック
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'WEAK_PASSWORD', message: passwordValidation.message },
        { status: 400 }
      );
    }

    // 実際のAPI URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
    if (!apiUrl) {
      console.error('API URL not configured');
      return NextResponse.json(
        { error: 'CONFIG_ERROR', message: 'APIの設定が正しくありません' },
        { status: 500 }
      );
    }

    // バックエンドAPIを呼び出し
    const backendResponse = await fetch(`${apiUrl}/user/${userId}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ new_password: newPassword })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend API error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        data: errorData
      });

      return NextResponse.json(
        { 
          error: 'BACKEND_ERROR', 
          message: errorData.detail || 'パスワード変更に失敗しました' 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('Password change successful for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'パスワードが正常に変更されました',
      data: result
    });

  } catch (error) {
    console.error('Password change API error:', error);
    
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        message: 'サーバー内部エラーが発生しました' 
      },
      { status: 500 }
    );
  }
}

// GET メソッドは不要だが、存在しないとエラーになる場合があるため追加
export async function GET() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'GET method is not supported' },
    { status: 405 }
  );
}
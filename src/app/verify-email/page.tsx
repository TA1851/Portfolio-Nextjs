'use client';

import { FC, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import axios from "axios";
import { saveLog } from "../../utils/logger";

interface VerificationResult {
  success: boolean;
  message: string;
  error?: string;
}

const VerifyEmailForm: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // URLパラメータからトークンまたは認証情報を取得
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  useEffect(() => {
    const verifyEmail = async () => {
      // デバッグ情報をセット
      const paramInfo = `URL Parameters: token=${token}, email=${email}, code=${code}`;
      console.log(paramInfo);
      setDebugInfo(paramInfo);
      
      // APIで必要なのはtokenのみ
      if (!token) {
        setVerificationStatus('error');
        setVerificationResult({
          success: false,
          message: 'メール認証トークンが見つかりません。メール内のリンクを再度確認してください。'
        });
        saveLog('error', 'メール認証: トークンが不足');
        return;
      }

      try {
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? '/api/proxy'
          : process.env.NEXT_PUBLIC_API_URL_V1 || 'http://localhost:8080/api/v1';
        
        console.log('API URL:', apiUrl);
        console.log('認証トークン:', token);
        setDebugInfo(prev => prev + `\nAPI URL: ${apiUrl}\nToken: ${token}`);
        saveLog('info', 'メール認証を開始');

        // GETリクエストでトークンをクエリパラメータとして送信
        const response = await axios.get(
          `${apiUrl}/verify-email?token=${encodeURIComponent(token)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('API応答:', response);
        console.log('応答ステータス:', response.status);
        console.log('応答データ:', response.data);
        setDebugInfo(prev => prev + `\nResponse status: ${response.status}\nResponse data: ${JSON.stringify(response.data)}`);

        // ステータス200-299の範囲なら成功とみなす
        if (response.status >= 200 && response.status < 300) {
          setVerificationStatus('success');
          setVerificationResult({
            success: true,
            message: response.data.message || response.data.detail || 'メール認証が完了しました。アカウントがアクティベートされました。'
          });
          saveLog('info', 'メール認証が成功しました');

          // 5秒後にパスワード変更ページにリダイレクト
          let timeLeft = 5;
          const timer = setInterval(() => {
            timeLeft -= 1;
            setCountdown(timeLeft);
            
            if (timeLeft <= 0) {
              clearInterval(timer);
              // メール認証成功後はパスワード変更ページにリダイレクト
              router.push(`/change-password?email=${encodeURIComponent(email || '')}&token=${encodeURIComponent(token || '')}`);
            }
          }, 1000);

          return () => clearInterval(timer);
        } else {
          throw new Error(response.data.message || response.data.detail || '認証に失敗しました');
        }

      } catch (error) {
        console.error('メール認証エラー:', error);
        setVerificationStatus('error');
        
        if (axios.isAxiosError(error) && error.response) {
          console.log('エラーレスポンス詳細:', error.response);
          setDebugInfo(prev => prev + `\nError status: ${error.response.status}\nError data: ${JSON.stringify(error.response.data)}`);
          
          const errorMessage = error.response.data.message || error.response.data.error || error.response.data.detail || '認証に失敗しました';
          setVerificationResult({
            success: false,
            message: errorMessage,
            error: `エラーコード: ${error.response.status}`
          });
          saveLog('error', `メール認証失敗: ${errorMessage}`);
        } else {
          console.log('ネットワークエラー詳細:', error);
          setDebugInfo(prev => prev + `\nNetwork error: ${error instanceof Error ? error.message : '不明なエラー'}`);
          
          setVerificationResult({
            success: false,
            message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
            error: error instanceof Error ? error.message : '不明なエラー'
          });
          saveLog('error', 'メール認証: ネットワークエラー');
        }
      }
    };

    verifyEmail();
  }, [token, email, code, router]);

  const handleResendVerification = async () => {
    if (!email) {
      alert('メールアドレスが不明です。新規登録からやり直してください。');
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/api/proxy'
        : process.env.NEXT_PUBLIC_API_URL_V1 || 'http://localhost:8080/api/v1';
      
      // 正しいクエリパラメータ形式でAPIを呼び出し
      await axios.post(`${apiUrl}/resend-verification?email=${encodeURIComponent(email)}`);
      alert('認証メールを再送信しました。メールボックスを確認してください。');
      saveLog('info', '認証メール再送信');
    } catch (error) {
      console.error('認証メール再送信エラー:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.detail || error.response.data.message || '再送信に失敗しました';
        alert(`認証メールの再送信に失敗しました: ${errorMessage}`);
      } else {
        alert('認証メールの再送信に失敗しました。しばらく後でもう一度お試しください。');
      }
      saveLog('error', '認証メール再送信失敗');
    }
  };

  return (
    <div className="min-h-screen bg-white py-6 sm:py-12 lg:py-24">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="text-center">
          
          {verificationStatus === 'loading' && (
            <div className="py-16">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                メール認証を確認中...
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                アカウントの認証を行っています。しばらくお待ちください。
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="py-16">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-4">
                認証完了！
              </h1>
              <p className="text-gray-700 mb-6 max-w-md mx-auto">
                {verificationResult?.message}
              </p>
              <div className="mb-8">
                <p className="text-sm text-gray-500">
                  {countdown}秒後にパスワード変更ページにリダイレクトします...
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 セキュリティのため、初回ログイン時にパスワードの変更をお願いしています
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href={`/change-password?email=${encodeURIComponent(email || '')}&token=${encodeURIComponent(token || '')}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  今すぐパスワード変更
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  ホームに戻る
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="py-16">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                認証に失敗しました
              </h1>
              <p className="text-gray-700 mb-2 max-w-md mx-auto">
                {verificationResult?.message}
              </p>
              {verificationResult?.error && (
                <p className="text-sm text-red-500 mb-6">
                  {verificationResult.error}
                </p>
              )}
              
              <div className="space-y-4 max-w-md mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">考えられる原因と解決方法:</h3>
                  <ul className="text-sm text-yellow-700 space-y-2 text-left">
                    <li>🔗 <strong>リンクの問題:</strong> メール内のリンクが完全にコピーされていない可能性があります</li>
                    <li>⏰ <strong>有効期限:</strong> 認証リンクの有効期限（通常24時間）が切れている可能性があります</li>
                    <li>✉️ <strong>メールアドレス:</strong> 登録時のメールアドレスが間違っている可能性があります</li>
                    <li>🔄 <strong>再送信:</strong> 下記のボタンから認証メールを再送信してください</li>
                    <li>🚫 <strong>既に認証済み:</strong> アカウントが既に認証済みの場合があります</li>
                  </ul>
                  
                  <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-xs text-yellow-600">
                      💡 <strong>開発者向け情報:</strong> エラーコード {verificationResult?.error} を確認して、
                      具体的な問題を特定してください。
                    </p>
                  </div>
                </div>
                
                <div className="space-x-4">
                  {email && (
                    <button
                      onClick={handleResendVerification}
                      className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      認証メール再送信
                    </button>
                  )}
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    新規登録をやり直す
                  </Link>
                </div>
                
                <div className="pt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    ホームに戻る
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* 開発環境でのデバッグ情報表示 */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-left">
              <h3 className="font-semibold text-gray-800 mb-2">デバッグ情報 (開発環境のみ):</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                {debugInfo}
              </pre>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

// ローディングコンポーネント
const LoadingFallback: FC = () => (
  <div className="bg-white min-h-screen py-6 sm:py-12 lg:py-24">
    <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">メール認証確認中...</h3>
        <p className="text-gray-600">メール認証を処理しています。しばらくお待ちください。</p>
      </div>
    </div>
  </div>
);

// メインページコンポーネント
const VerifyEmailPage: FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
};

export default VerifyEmailPage;

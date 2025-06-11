'use client';

import Link from "next/link";
import { FC, useState } from "react";
import axios from "axios";

interface SignupFormData {
  email: string;
}

interface ApiErrorResponse {
  detail: string;
}

interface ApiSuccessResponse {
  email: string;
  password: string | null;
  is_active: boolean | null;
  id?: number;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

const LoginComp: FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [errorType, setErrorType] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  // プロキシAPI経由でリクエストを送信
  const apiUrl = '/api/register';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType("");
    setIsLoading(true);

    // バリデーション
    if (!formData.email) {
      setError("メールアドレスを入力してください。");
      setIsLoading(false);
      return;
    }
    // 許可されたメールアドレスのチェック
    if (formData.email !== "taosaka1851@gmail.com") {
      setError("このメールアドレスでの新規登録は許可されていません。");
      setErrorType("restricted");
      setIsLoading(false);
      return;
    }
    try {
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
      const response = await axios.post(apiUrl, {
        username: formData.email.split('@')[0],
        email: formData.email,
        password: "temp_password_will_be_replaced",
        frontend_url: frontendUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒のタイムアウト
      });

      const userData = response.data as ApiSuccessResponse;
      // レスポンスの詳細を確認して適切にハンドリング
      if (userData.email) {
        // パスワードがnullの場合、既存ユーザーの可能性を確認
        if (userData.password === null && userData.is_active === null) {
          // 既存ユーザーの場合
          setError(
            `このメールアドレス（${userData.email}）は既に登録済みです。
            ログインページからアカウントにアクセスできます。`
          );
          setErrorType("conflict");
          return;
        }
        // 新規ユーザー作成成功の場合
        setRegisteredEmail(userData.email);
        setSuccess(true);
        setFormData({ email: "" });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorData = err.response.data as ApiErrorResponse;
          switch (err.response.status) {
            case 400:
              const conflictMessage = errorData.detail || "このメールアドレスは既に使用されています。";
              setErrorType("conflict");
              // 特定のメッセージパターンに基づいてユーザーフレンドリーなメッセージを表示
              if (
                conflictMessage.includes('確認済み')
                || conflictMessage.includes('verified')
                || conflictMessage.includes('既に登録済')
              ) {
                setError(
                  `このメールアドレス（${formData.email}）は既に登録・認証済みです。
                  ログインページからアカウントにアクセスできます。`
                );
              } else if (
                conflictMessage.includes('既に使用')
                || conflictMessage.includes('already exists')
              ) {
                setError(
                  `このメールアドレス（${formData.email}）は既に登録されています。
                  まだメール認証が完了していない場合は、メールをご確認ください。`
                );
              } else {
                setError(
                  `${conflictMessage} 別のメールアドレスをご使用いただくか、既存のアカウントでログインしてください。`
                );
              }
              break;
            case 500:
              const serverErrorMessage = errorData.detail
              || "サーバーエラーが発生しました。";
              // 500エラーでも既存ユーザーのメッセージが含まれている場合は、conflictとして扱う
              if (
                serverErrorMessage.includes('既に登録済')
                || serverErrorMessage.includes('already exists')
              ) {
                setErrorType("conflict");
                setError(
                  `このメールアドレス（${formData.email}）は既に登録済みです。
                  ログインページからアカウントにアクセスできます。`);
              } else {
                setErrorType("server");
                setError(serverErrorMessage);
              }
              break;
            default:
              setErrorType("unknown");
              setError(
                `エラー(${err.response.status}): ${errorData.detail
                  || "予期しないエラーが発生しました。"}`
                );
          }
        } else if (err.request) {
          setErrorType("network");
          setError(
            "サーバーに接続できませんでした。ネットワーク接続を確認してください。"
          );
        } else {
          setErrorType("config");
          setError("リクエストの設定エラーが発生しました。");
        }
      } else {
        setErrorType("unknown");
        setError("予期しないエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="
          bg-white min-h-screen py-6 sm:py-60 lg:py-12"
      >
        <h2
          className="
            mb-4 text-center text-2xl font-bold text-blue-500 md:mb-8 lg:text-3xl"
        >
          新規登録
        </h2>
        <form
          className="mx-auto max-w-lg rounded-lg border"
          onSubmit={handleSubmit}
        >
          <div
            className="flex flex-col gap-4 p-4 md:p-8"
          >
            {/* エラーメッセージ表示 */}
            {error && (
              <div
                className="
                  rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-sm"
              >
                <div className="mb-2">{error}</div>
                {/* 409エラー（メールアドレス重複）の場合は追加のアクション */}
                {errorType === "conflict" && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href="/login"
                        className="
                          inline-flex items-center justify-center px-4 py-2 bg-blue-500
                          text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                      >
                        ログインページへ
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setErrorType("");
                          setFormData({ email: "" });
                        }}
                        className="
                          inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700
                          text-sm rounded-md hover:bg-gray-200 transition-colors"
                      >
                        別のメールアドレスで登録
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* 成功メッセージ表示 */}
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      🎉 アカウント作成完了！
                    </h3>
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>{registeredEmail}</strong> にメール認証リンクを送信しました。
                      </p>
                      <p className="text-green-700">
                        📧 <strong>次のステップ：</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-green-700 ml-4">
                        <li>メールボックス（迷惑メールフォルダも含む）を確認してください</li>
                        <li>受信したメール内の「メール認証」リンクをクリックしてください</li>
                        <li>認証完了後、パスワードを設定してください</li>
                        <li>ログインしてサービスをご利用いただけます</li>
                      </ol>
                      <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                        <p className="text-xs text-green-600">
                          💡 <strong>ヒント：</strong> メールが届かない場合は、迷惑メールフォルダをご確認ください。
                          それでも見つからない場合は、再度新規登録をお試しください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email"
                className="
                  mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded border bg-gray-50 px-3 py-2
                  text-gray-800 outline-none ring-indigo-300
                  transition duration-100 focus:ring"
                placeholder="example@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="
                block rounded-lg bg-blue-600 px-8 py-3 text-center text-sm
                font-semibold text-white outline-none ring-gray-300
                transition duration-100 hover:bg-blue-500 focus-visible:ring
                active:bg-gray-600 md:text-base disabled:bg-gray-400 disabled:cursor-not-allowed
              ">
              {isLoading ? "登録中..." : "新規登録"}
            </button>
          </div>
          <p
            className="text-center mb-4"
          >
            <Link
              href="/login"
              className="text-gray-800 hover:text-blue-600 transition duration-100"
            >
              登録済みの方はこちら
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}
export default LoginComp;
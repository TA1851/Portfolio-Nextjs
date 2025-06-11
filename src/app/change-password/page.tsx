'use client';

import Link from "next/link";
import { FC, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import axios from "axios";

interface PasswordChangeFormData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiErrorResponse {
  detail: string;
}

interface ApiSuccessResponse {
  message: string;
  access_token?: string;
  token_type?: string;
}

// useSearchParamsを使用するコンポーネントを分離
const ChangePasswordForm: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<PasswordChangeFormData>({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // URLパラメータからユーザー情報を取得
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const userId = searchParams.get('user_id');

  // 環境変数からAPIのURLを取得
  const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo(
        `環境: ${process.env.NODE_ENV}\n
        API URL: ${apiUrl}\n
        Email: ${email}\n
        Token: ${token}\n
        User ID: ${userId}\n\n=== テスト情報 ===\n
        新しいユーザーでのテスト用パラメータ:\n
        - メールアドレス: ${email
          || '未設定'}\n- ユーザーID: ${userId
          || '未設定'}\n- 認証トークン: ${token
          || '未設定'}\n\n
          初期パスワードはメール認証完了時に送信されるメールに記載されています。`
        );
    }
    // URLパラメータからメールアドレスが取得された場合はフォームに設定
    if (email) {
      setFormData(prev => ({
        ...prev,
        email: email
      }));
    }
    // メールアドレスまたはトークンがない場合の警告を表示（リダイレクトは削除）
    if (!email && !token) {
      setError(
        "認証情報が不足しています。メール認証リンクから正しくアクセスしてください。"
      );
    }
  }, [apiUrl, email, token, userId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    // バリデーション
    if (!formData.email) {
      setError("メールアドレスを入力してください。");
      setIsLoading(false);
      return;
    }

    if (!formData.currentPassword
      || !formData.newPassword
      || !formData.confirmPassword
    ) {
      setError("すべてのフィールドを入力してください。");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("新しいパスワードと確認用パスワードが一致しません。");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("新しいパスワードは8文字以上で入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      console.log("=== パスワード変更リクエスト詳細 ===");
      console.log("パスワード変更データ:", {
        email: formData.email,
        username: formData.email,
        temp_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      const requestData = {
        email: formData.email,
        username: formData.email,
        temp_password: formData.currentPassword,
        new_password: formData.newPassword
      };
      const response = await axios.post(`${apiUrl}/change-password`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      const successData = response.data as ApiSuccessResponse;
      setSuccess(true);
      setFormData({
        email: formData.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      // アクセストークンがある場合は保存（必要に応じて）
      if (successData.access_token) {
        console.log("新しいアクセストークン:", successData.access_token);
      }
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error("詳細エラー情報:", err);

      if (axios.isAxiosError(err)) {
        console.error("Axiosエラー詳細:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        if (err.response) {
          const errorData = err.response.data as ApiErrorResponse;
          switch (err.response.status) {
            case 400:
              setError(
                `${errorData.detail || "入力内容に不備があります。"}
                メール認証完了時に送信されたメールに記載されている正しい初期パスワードを入力してください。`
              );
              break;
            case 401:
              setError(errorData.detail || "現在のパスワードが正しくありません。");
              break;
            case 404:
              setError(
                "ユーザーが見つかりません。 メール認証が完了していない可能性があります。新規登録からやり直してください。"
              );
              break;
            case 422:
              // バリデーションエラーの詳細を表示
              const validationDetails = err.response.data;
              console.error("422バリデーションエラー詳細:", validationDetails);
              if (
                validationDetails.detail && Array.isArray(validationDetails.detail
              )) {
                // 複数のバリデーションエラーがある場合
                const errorMessages = validationDetails.detail.map(
                  (validationErr: {loc?: string[]; msg: string}) =>
                  `${validationErr.loc ? validationErr.loc.join('.') : '不明'}: ${validationErr.msg}`
                ).join(', ');
                setError(`入力データ検証エラー: ${errorMessages}`);
              } else {
                setError(
                  `データ検証エラー: ${validationDetails.detail
                    || "入力されたデータに問題があります。"}`
                  );
              }
              setDebugInfo(
                prev => prev + `\n
                422エラーレスポンス詳細:\n
                ${JSON.stringify(validationDetails, null, 2)}`
              );
              break;
            case 500:
              setError(
                `サーバーエラーが発生しました: ${errorData.detail
                  || "時間をおいて再度お試しください。"}`
                );
              break;
            default:
              setError(
                `エラー(${err.response.status}): ${errorData.detail
                  || "予期しないエラーが発生しました。"}`
                );
          }
        } else if (err.request) {
          console.error("リクエストエラー:", err.request);
          setError(
            "サーバーに接続できませんでした。ネットワーク接続を確認してください。"
          );
          setDebugInfo(
            prev => prev + `\n
            リクエストエラー: ${JSON.stringify(err.request)}`
          );
        } else {
          console.error("設定エラー:", err.message);
          setError(
            "リクエストの設定エラーが発生しました。"
          );
          setDebugInfo(
            prev => prev + `\n設定エラー: ${err.message}`
          );
        }
      } else {
        setError("予期しないエラーが発生しました。");
      }
      console.error("パスワード変更エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="
        bg-white min-h-screen py-6 sm:py-12 lg:py-24"
        >
      <div
        className="
          mx-auto max-w-screen-2xl px-4 md:px-8"
          >
        <h2
          className="
            mb-4 text-center text-2xl font-bold text-blue-500 md:mb-8 lg:text-3xl"
            >
          パスワード設定
        </h2>
        <div
          className="mb-6 text-center"
          >
          <div
            className="
              inline-flex items-center justify-center
              w-12 h-12 bg-green-100 rounded-full mb-4"
          >
            <svg
              className="
                w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2
                0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              >
              </path>
            </svg>
          </div>
          <h3
            className="text-lg font-medium text-gray-900 mb-2"
          >
            メール認証完了！
          </h3>
          <p
            className="text-gray-600"
          >
            新しいパスワードを設定してください。
            初期パスワードはメール認証完了時に送信されるメールに記載されています。
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>🧪 開発者向けテスト情報:</strong><br />
                • 別ユーザーでテストする場合は、まず新規登録を完了してください<br />
                • メール認証を完了すると、初期パスワードがメールで送信されます<br />
                • 実際のメール送信機能が必要です
              </p>
            </div>
          )}
        </div>
        {(email || formData.email) && (
          <p className="text-center text-gray-600 mb-6">
            {formData.email || email} のパスワードを変更します
          </p>
        )}
        <form
          className="mx-auto max-w-lg rounded-lg border"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4 p-4 md:p-8">
            {/* エラーメッセージ表示 */}
            {error && (
              <div
                className="
                  rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-sm"
              >
                {error}
              </div>
            )}

            {/* 成功メッセージ表示 */}
            {success && (
              <div
                className="
                  rounded-lg bg-green-50 border border-green-200 p-4 text-green-800"
              >
                <div
                  className="flex items-start space-x-3"
                >
                  <div
                    className="flex-shrink-0 mt-0.5"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      >
                      </path>
                    </svg>
                  </div>
                  <div
                    className="flex-1"
                  >
                    <h3
                      className="text-sm font-medium text-green-800 mb-2"
                    >
                      🎉 パスワード変更完了！
                    </h3>
                    <p
                      className="text-sm"
                    >
                      パスワードが正常に変更されました。新しいパスワードでログインしてください。
                    </p>
                    <p
                      className="
                      text-sm text-green-600 mt-2"
                    >
                      3秒後にログインページにリダイレクトします...
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="
                  mb-2 inline-block text-sm text-gray-800 sm:text-base"
                >
                メールアドレス*
              </label>
              <input
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-blue-300 transition duration-100 focus:ring"
                placeholder="パスワードを変更するメールアドレスを入力してください"
              />
              <p className="mt-1 text-xs text-gray-500">
                📧 認証を完了したメールアドレスを入力してください
              </p>
            </div>

            {/* 初期パスワード */}
            <div>
              <label
                htmlFor="currentPassword"
                className="
                mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                初期パスワード（メールに記載）*
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-blue-300 transition duration-100 focus:ring"
                placeholder="メールに記載された初期パスワードを入力"
              />
              <p className="mt-1 text-xs text-gray-500">
                📧 メール認証完了通知に記載されている初期パスワードを入力してください
              </p>
            </div>

            {/* 新しいパスワード */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                新しいパスワード*
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                minLength={8}
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-blue-300 transition duration-100 focus:ring"
                placeholder="新しいパスワードを入力（8文字以上）"
              />
            </div>
            {/* 新しいパスワード確認 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="
                  mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                新しいパスワード（確認）*
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={8}
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-blue-300 transition duration-100 focus:ring"
                placeholder="新しいパスワードをもう一度入力"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="
                block rounded-lg bg-blue-500 px-8 py-3 text-center text-sm font-semibold
                text-white outline-none ring-blue-300 transition duration-100 hover:bg-blue-600
                focus:ring active:bg-blue-700 md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div
                  className="flex items-center justify-center"
                >
                  <div
                    className="
                      w-4 h-4 border-2 border-white border-t-transparent
                      border-solid rounded-full animate-spin mr-2"
                  >
                  </div>
                  変更中...
                </div>
              ) : (
                "パスワードを変更"
              )}
            </button>
          </div>

          <div
            className="flex items-center justify-center bg-gray-100 p-4"
          >
            <p
              className="text-center text-sm text-gray-500"
            >
              <Link
                href="/login"
                className="text-gray-800 hover:text-blue-600 transition duration-100"
              >
                ログインページに戻る
              </Link>
            </p>
          </div>
        </form>

        {/* 開発環境でのデバッグ情報表示 */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div
            className="
              mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-left max-w-lg mx-auto"
          >
            <h3
              className="font-semibold text-gray-800 mb-2"
            >
              デバッグ情報
            </h3>
            <pre
              className="
                text-sm text-gray-600 whitespace-pre-wrap"
            >
              {debugInfo}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
// ローディングコンポーネント
const LoadingFallback: FC = () => (
  <div
    className="bg-white min-h-screen py-6 sm:py-12 lg:py-24"
  >
    <div
      className="mx-auto max-w-screen-2xl px-4 md:px-8"
    >
      <div
        className="text-center"
      >
        <div
          className="
            inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4"
        >
          <div
            className="
              w-6 h-6 border-2 border-blue-500 border-t-transparent
              border-solid rounded-full animate-spin"
              >
              </div>
        </div>
        <h3
          className="
            text-lg font-medium text-gray-900 mb-2"
        >
          読み込み中...
        </h3>
        <p
          className="text-gray-600"
        >
          パスワード変更ページを準備中です。
        </p>
      </div>
    </div>
  </div>
);
// メインページコンポーネント
const ChangePasswordPage: FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChangePasswordForm />
    </Suspense>
  );
};
export default ChangePasswordPage;
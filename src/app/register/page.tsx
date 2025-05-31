'use client';

import Link from "next/link";
import { FC, useState, useEffect } from "react";
import axios from "axios";

interface SignupFormData {
  email: string;
}

interface ApiErrorResponse {
  detail: string;
}

interface ApiSuccessResponse {
  email: string;
  password: string;
  is_active: boolean;
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
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
  const apiUrl = process.env.NODE_ENV === 'development' 
    ? '/api/proxy' // Next.jsプロキシ経由でAPIを呼び出し
    : process.env.NEXT_PUBLIC_API_URL_V1 || 'http://localhost:8080/api/v1';

  // 開発環境でAPIの動作確認
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('環境:', process.env.NODE_ENV);
      console.log('API URL:', apiUrl);
      setDebugInfo(`環境: ${process.env.NODE_ENV}\nAPI URL: ${apiUrl}`);
    }
  }, [apiUrl]);

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
    setIsLoading(true);

    // フロントエンドでの簡単なバリデーション
    if (!formData.email) {
      setError("メールアドレスを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      console.log("送信データ:", {
        name: formData.email.split('@')[0], // メールアドレスの@マーク前をnameとして使用
        email: formData.email,
        password: "temp_password_will_be_replaced" // 一時的なパスワード
      });
      console.log("API URL:", `${apiUrl}/user`);

      const response = await axios.post(`${apiUrl}/user`, {
        name: formData.email.split('@')[0], // 一時的にnameフィールドを追加
        email: formData.email,
        password: "temp_password_will_be_replaced" // 一時的なパスワード（メール認証後に変更される）
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          // 200-299の範囲のステータスコードを成功として扱う
          return status >= 200 && status < 300;
        }
      });

      // 成功時の処理
      console.log("ユーザー作成成功:", response.data);
      console.log("レスポンスステータス:", response.status);

      // レスポンスの形式をチェック
      const userData = response.data as ApiSuccessResponse;
      if (userData.email) {
        setRegisteredEmail(userData.email);
        setSuccess(true);
        setFormData({ email: "" });
        // メール認証の案内メッセージを表示
        // ユーザーにメール確認を促す
      } else {
        console.warn("予期しないレスポンス形式:", userData);
        setError("登録は完了しましたが、レスポンス形式が予期されたものと異なります。");
      }
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
              setError(errorData.detail || "入力内容に不備があります。");
              break;
            case 409:
              setError(errorData.detail || "このメールアドレスは既に使用されています。");
              break;
            case 500:
              setError(`サーバーエラーが発生しました: ${errorData.detail || "時間をおいて再度お試しください。"}`);
              break;
            default:
              setError(`エラー(${err.response.status}): ${errorData.detail || "予期しないエラーが発生しました。"}`);
          }
        } else if (err.request) {
          console.error("リクエストエラー:", err.request);
          setError("サーバーに接続できませんでした。ネットワーク接続を確認してください。");
          setDebugInfo(`リクエストエラー: ${JSON.stringify(err.request)}`);
        } else {
          console.error("設定エラー:", err.message);
          setError("リクエストの設定エラーが発生しました。");
          setDebugInfo(`設定エラー: ${err.message}`);
        }
      } else {
        setError("予期しないエラーが発生しました。");
      }
      console.error("ユーザー作成エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="bg-white min-h-screenpy-6 sm:py-60 lg:py-12"
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
                {error}
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

        {/* 開発環境でのデバッグ情報表示 */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-left max-w-lg mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">デバッグ情報</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </>
  )
}
export default LoginComp;
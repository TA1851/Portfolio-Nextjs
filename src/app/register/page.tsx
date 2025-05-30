'use client';

import Link from "next/link";
import { FC, useState } from "react";
import axios from "axios";

interface SignupFormData {
  email: string;
  password: string;
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
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;

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
    if (!formData.email || !formData.password) {
      setError("すべてのフィールドを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      // console.log("送信データ:", {
      //   name: formData.email.split('@')[0], // メールアドレスの@マーク前をnameとして使用
      //   email: formData.email,
      //   password: formData.password
      // });
      // console.log("API URL:", `${apiUrl}/user`);

      const response = await axios.post(`${apiUrl}/user`, {
        name: formData.email.split('@')[0], // 一時的にnameフィールドを追加
        email: formData.email,
        password: formData.password
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
      // console.log("ユーザー作成成功:", response.data);
      // console.log("レスポンスステータス:", response.status);

      // レスポンスの形式をチェック
      const userData = response.data as ApiSuccessResponse;
      if (userData.email) {
        setSuccess(true);
        setFormData({ email: "", password: "" });
        // 必要に応じてリダイレクトやその他の処理を追加
        // router.push("/login");
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
        } else {
          console.error("設定エラー:", err.message);
          setError("リクエストの設定エラーが発生しました。");
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
              <div
                className="
                  rounded-lg bg-green-50 border border-green-200 p-3 text-green-800 text-sm"
              >
                アカウントが正常に作成されました！
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

            <div>
              <label htmlFor="password"
                className="
                  mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-indigo-300 transition duration-100 focus:ring"
                placeholder="パスワードを入力してください"
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
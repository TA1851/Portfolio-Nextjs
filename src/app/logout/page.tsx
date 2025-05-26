'use client';

import Link from "next/link";
import { FC, useEffect } from "react";


const LogoutPage: FC = () => {
  // ページロード時にローカルストレージをクリア（二重処理だが安全のため）
  useEffect(() => {
    localStorage.removeItem('authToken');
  }, []);

  return (
    <div className="
      flex flex-col
      items-center justify-center
      min-h-screen
      bg-gray-100">
        <div className="
          p-8 bg-white
          rounded-lg
          shadow-md
          max-w-md w-full
          text-center">
            <h1 className="
              text-2xl text-gray-800
              font-bold
              mb-6"
              >
                ご利用ありがとうございました、
                <br />
                ログアウトが完了しています。
            </h1>
          <Link
            href="/login"
            className="
              px-6 py-2 bg-blue-500
              text-white rounded
              hover:bg-blue-600
              transition-colors"
          >
            ログイン画面へ戻る
          </Link>
        </div>
    </div>
  );
};
export default LogoutPage;
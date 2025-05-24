'use client';

import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { saveLog } from "@/utils/logger";

const HeaderComp: FC = () => {
  const router = useRouter();

  // ログアウト処理関数
  const handleLogout = async () => {
    try {
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('authToken');
      console.log(`トークン：${token}`);
      if (!token) {
        console.error('トークンがありません');
        return;
      }
      // 環境変数からAPIエンドポイントを取得する
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('API URL:', apiUrl);

      const response = await fetch(
        `${apiUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // ログアウト成功
        localStorage.removeItem('authToken'); // トークンをローカルストレージから削除
        console.log('ログアウトしました');
        // saveLog('info', 'ログアウトしました');
        // ログイン画面にリダイレクト
        router.push('/logout');
      } else {
        console.error('ログアウトに失敗しました');
        // saveLog('error', 'ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました', error);
      // saveLog('error', 'ログアウト処理中にエラーが発生しました');
    }
  };

  return (
    <>
      <div className="
        bg-white lg:pb-12
      ">
        <div className="
          mx-auto max-w-screen-2xl
          px-4 md:px-8
        ">
          <header className="
              flex items-center
              justify-between
              py-4 md:py-8
            ">
            <a href="#"
            className="
              inline-flex items-center
              gap-2.5 text-2xl
              font-bold text-black
              md:text-3xl
              " aria-label="logo"
            >
              <svg
                width="95" height="94"
                viewBox="0 0 95 94"
                className="
                  h-auto w-6
                  text-indigo-500"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg
                ">
                <path d="M96 0V47L48 94H0V47L48 0H96Z" />
              </svg>
              会員専用ページ
            </a>

            <nav className="
              hidden
              gap-12 lg:flex
            ">
              {/* <Link
                href="/"
                className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
              >
                ホーム
              </Link> */}
              <Link
                href="/article_crud/create"
                className="
                  text-lg font-semibold
                  text-gray-600
                  transition duration-100
                  hover:text-indigo-500
                  active:text-indigo-700
                ">
                  記事を書く
              </Link>
              <Link
                href="/article_crud/update"
                className="
                  text-lg font-semibold
                  text-gray-600 transition
                  duration-100
                  hover:text-indigo-500
                  active:text-indigo-700
                ">
                  記事を編集する
              </Link>
              <Link
                href="/article_crud/delete"
                className="
                  text-lg font-semibold
                  text-gray-600
                  transition duration-100
                  hover:text-indigo-500
                  active:text-indigo-700
                ">
                  記事を削除する
              </Link>
            </nav>

            {/* 検索ボックス */}
            {/* <div className="relative">
              <input
                type="text"
                placeholder="検索"
                className="
                  w-full rounded-lg
                  border border-gray-300
                  px-10 py-3
                  text-sm text-gray-800
                  outline-none ring-indigo-300
                  transition duration-100
                  focus:ring"
              />
            </div>
            <button
              type="submit"
              className="
                text-black
                px-4 py-1
                bg-gray-400
                hover:bg-gray-300 rounded
              ">
                検索
            </button> */}
            {/* ログアウトボタン - Linkを使わずに直接ボタンでハンドリング */}
            <button
              type="button"
              className="
                text-black
                px-4 py-1
                bg-blue-500
                hover:bg-blue-400
                rounded"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </header>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">会員専用コンテンツ</h1>
        <p>ようこそ！ここにコンテンツを表示します。</p>
      </div>
    </>
  );
};
export default HeaderComp;
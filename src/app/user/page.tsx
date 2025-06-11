'use client';

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DemoBody from "./home/page";
import { saveLog } from "..//../utils/logger";

const HeaderComp: FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ユーザー情報を取得してテストユーザーかどうかを判定
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // JWTトークンからユーザー情報を取得する（簡易実装）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload); // デバッグ用
        console.log('Email from token:', payload.email); // デバッグ用
        setUserEmail(payload.email || null);
      } catch (error) {
        console.error('トークンの解析に失敗しました:', error);
        setUserEmail(null);
      }
    }
  }, []);

  // テストユーザーかどうかを判定（複数のパターンをチェック）
  const isTestUser = userEmail === "testuser@example.com" &&
                     (userEmail && userEmail.includes("test")); 
  console.log('Current userEmail:', userEmail); // デバッグ用
  console.log('Is test user:', isTestUser); // デバッグ用

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 退会処理関数
  const handleDeleteAccount = () => {
    console.log('退会ボタンがクリックされました'); // デバッグ用
    console.log('現在のユーザーメール:', userEmail); // デバッグ用
    console.log('テストユーザー判定:', isTestUser); // デバッグ用
    
    if (!userEmail) {
      alert("テストユーザーは退会できません。");
      return;
    }
    // 通常の退会処理（実際のリンク遷移）
    saveLog('info', `ユーザー(${userEmail})が退会処理を開始しました`);
    router.push('/delete-account');
  };

  // ログアウト処理関数
  const handleLogout = async () => {
    try {
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('authToken');
      // console.log(`トークン：${token}`);
      if (!token) {
        console.error('トークンがありません');
        return;
      }
      // 環境変数からAPIエンドポイントを取得する
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
      // console.log('API URL:', apiUrl);

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
        // console.log('ログアウトしました');
        saveLog('info', 'ログアウトしました');
        // ログイン画面にリダイレクト
        router.push('/logout');
      } else {
        console.error('ログアウトに失敗しました');
        saveLog('error', 'ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました', error);
      saveLog('error', 'ログアウト処理中にエラーが発生しました');
    }
  };

  return (
    <>
      <div
        className="bg-white lg:pb-12"
      >
        <div
          className="mx-auto max-w-screen-2xl px-4 md:px-8"
        >
          <header
            className="flex items-center justify-between py-4 md:py-8"
          >
            <a
              href="#"
              className="
                inline-flex items-center gap-2.5 text-2xl
              font-bold text-black md:text-3xl"
              aria-label="logo"
            >
              <svg
                width="95" height="94"
                viewBox="0 0 95 94"
                className="h-auto w-6 text-indigo-500"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M96 0V47L48 94H0V47L48 0H96Z" />
              </svg>
              会員専用ページ
            </a>
            {/* デスクトップナビゲーション */}
            <nav
              className="hidden gap-12 lg:flex"
            >
              <Link
                href="/article_crud/create"
                className="
                  text-lg font-semibold text-gray-600 transition duration-100
                  hover:text-indigo-500 active:text-indigo-700"
              >
                記事を書く
              </Link>
              <Link
                href="/article_crud/update"
                className="
                  text-lg font-semibold text-gray-600 transition duration-100
                  hover:text-indigo-500 active:text-indigo-700"
              >
                記事を編集する
              </Link>
              <Link
                href="/article_crud/delete"
                className="
                  text-lg font-semibold text-gray-600 transition duration-100
                  hover:text-indigo-500 active:text-indigo-700
                ">
                  記事を削除する
              </Link>
            </nav>

            <div
              className="flex items-center gap-4"
            >
              {/* 退会ボタン */}
              <button
                onClick={handleDeleteAccount}
                disabled={isTestUser}
                style={isTestUser ? { pointerEvents: 'none' } : {}}
                className={`
                  hidden lg:block px-4 py-1 rounded transition duration-100
                  ${isTestUser 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                    : 'bg-red-500 text-white hover:bg-red-400'
                  }
                `}
                title={isTestUser ? "テストユーザーは退会できません" : "退会する"}
              >
                {isTestUser ? '退会不可' : '退会'}
              </button>
              {/* ログアウトボタン */}
              <button
                type="button"
                className="
                  hidden lg:block text-black px-4 py-1
                  bg-blue-500 hover:bg-blue-400 rounded"
                onClick={handleLogout}
              >
                ログアウト
              </button>
              {/* ハンバーガーメニュー */}
              <button
                type="button"
                onClick={toggleMenu}
                className="
                  inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm
                  font-semibold text-black ring-indigo-300 hover:text-gray-600
                  focus-visible:ring active:text-gray-700 md:text-base lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z
                      M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z
                      M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </header>
          {/* モバイルメニュー */}
          {isMenuOpen && (
            <div
              className="lg:hidden py-4 px-2 bg-white border-t"
            >
              <div
                className="flex flex-col space-y-4"
              >
                <Link
                  href="/article_crud/create"
                  className="
                    block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  記事を書く
                </Link>
                <Link
                  href="/article_crud/update"
                  className="
                    block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  記事を編集する
                </Link>
                <Link
                  href="/article_crud/delete"
                  className="
                    block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  記事を削除する
                </Link>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isTestUser}
                  style={isTestUser ? { pointerEvents: 'none' } : {}}
                  className={`
                    block w-full text-left px-4 py-2 rounded transition duration-100
                    ${isTestUser 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-60' 
                      : 'text-red-600 hover:bg-red-100'
                    }
                  `}
                  title={isTestUser ? "テストユーザーは退会できません" : "退会する"}
                >
                  {isTestUser ? '退会不可（テストユーザー）' : '退会'}
                </button>
                <button
                  onClick={handleLogout}
                  className="
                    block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 rounded"
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
        <DemoBody />
      </div>
    </>
  );
};
export default HeaderComp;
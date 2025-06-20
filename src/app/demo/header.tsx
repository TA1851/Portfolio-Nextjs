'use client';

import { FC, useState } from "react";
import Link from "next/link";


const HeaderComp: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div
      className="
        bg-white
        lg:pb-12
      ">
        <div
          className="mx-auto max-w-screen-2xl px-4 md:px-8"
        >
          <header
            className="
            flex items-center justify-between py-4 md:py-8"
          >
            <div
            className="
              inline-flex items-center gap-2.5 text-2xl
              font-bold text-black md:text-3xl"
              aria-label="logo"
            >
              <svg
                width="95"
                height="94"
                viewBox="0 0 95 94"
                className="h-auto w-6 text-indigo-500"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M96 0V47L48 94H0V47L48 0H96Z" />
              </svg>
              Blog
            </div>

            <nav
              className="hidden gap-12 lg:flex"
            >
            </nav>
            <div
              className="
              -ml-8 hidden flex-col gap-2.5 sm:flex-row
              sm:justify-center lg:flex lg:justify-start"
            >
              <button
                onClick={toggleSidebar}
                className="
                inline-block rounded-lg px-4 py-3 text-center text-sm
                font-semibold text-gray-500 outline-none ring-indigo-300
                transition duration-100 hover:text-green-600 focus-visible:ring
                active:text-indigo-600 md:text-base"
              >
                デモ
              </button>

              <Link
                href="/login"
                className="
                inline-block rounded-lg px-4 py-3 text-center text-sm
                font-semibold text-gray-500 outline-none ring-indigo-300
                transition duration-100 hover:text-indigo-500 focus-visible:ring
                  active:text-indigo-600 md:text-base"
              >
                ログイン
              </Link>

              <Link
                href="/register"
                className="
                  inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center
                  text-sm font-semibold text-white outline-none ring-indigo-300
                  transition duration-100 hover:bg-indigo-600 focus-visible:ring
                  active:bg-indigo-700 md:text-base"
              >
                新規登録
              </Link>
            </div>
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2
                text-sm font-semibold text-blackring-indigo-300 hover:text-gray-600
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
                    M3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z
                    M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </header>
          {/* モバイルメニュー */}
          {isMenuOpen && (
            <div
              className="lg:hidden py-4 px-2 bg-white border-t"
            >
              <div
                className="flex flex-col space-y-4"
              >
                <button
                  onClick={toggleSidebar}
                  className="
                    block rounded-lg px-4 py-3 text-center text-sm
                    font-semibold text-gray-500 outline-none ring-indigo-300
                    transition duration-100 hover:text-indigo-500 focus-visible:ring
                    active:text-indigo-600 md:text-base"
                >
                  デモ
                </button>

                <Link
                  href="/login"
                  className="
                    block rounded-lg px-4 py-3 text-center text-sm
                    font-semibold text-gray-500 outline-none ring-indigo-300
                    transition duration-100 hover:text-indigo-500 focus-visible:ring
                    active:text-indigo-600 md:text-base"
                >
                  ログイン
                </Link>

                <button
                  onClick={toggleSidebar}
                  className="
                    block rounded-lg bg-indigo-500 px-8 py-3 text-center
                    text-sm font-semibold text-white outline-none ring-indigo-300
                    transition duration-100 hover:bg-indigo-600 focus-visible:ring
                    active:bg-indigo-700 md:text-base"
                >
                  新規登録
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* サイドバー */}
      {isSidebarOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
          {/* サイドバー本体 */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* サイドバーヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">デモメニュー</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* サイドバーコンテンツ */}
              <nav className="space-y-4">
                {/* 動作確認用アカウント情報 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-bold text-blue-800 mb-3">【動作確認用アカウント】</h3>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><span className="font-medium">メールアドレス：</span>testuser@example.com</p>
                    <p><span className="font-medium">パスワード：</span>testuser</p>
                  </div>
                </div>

                {/* 機能説明 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-bold text-green-800 mb-3">【機能】</h3>
                  <div className="text-xs text-green-700 space-y-1">
                    <p>・記事の作成</p>
                    <p>・記事の更新</p>
                    <p>・記事の削除</p>
                    <p>・記事の下書き（公開されます）</p>
                  </div>
                  {/* ログインはこちらから */}
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="
                        inline-block rounded-lg px-4 py-2 text-sm
                        font-semibold text-gray-800 hover:text-gray-500"
                    >
                      ログインはこちらから
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default HeaderComp;
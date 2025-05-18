import React from "react";
import Link from "next/link";
import { FC } from "react";


const LoginFail: FC = () => {
  return (
    <div className="
      bg-white min-h-screen
      py-6 sm:py-60 lg:py-12"
    >
      <div className="
        mx-auto max-w-screen-2xl
        px-4 md:px-8"
      >
        <div className="
          flex flex-col
          items-center
          justify-center gap-6"
        >
          <h1 className="
            text-3xl font-bold
            text-gray-800"
          >
            ログインに失敗しました
          </h1>
          <p className="
            text-lg text-gray-600
          ">
            メールアドレスまたはパスワードが正しくありません。
          </p>
          <Link
            href="/login"
            className="
              inline-block rounded-lg
              bg-indigo-500 px-8 py-3
              text-center text-sm
              font-semibold text-white
              outline-none ring-indigo-300
              transition duration-100
              hover:bg-indigo-600 focus-visible:ring
              active:bg-indigo-700
              md:text-base"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginFail;
'use client';

import Link from "next/link";
import { FC } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";

const LoginComp: FC = () => {
  const router = useRouter(); // useRouterを使用

  const onClickLogin = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    event.preventDefault(); // ページリロードを防ぐ

    console.log('ログインボタンがクリックされました。');

    // フォームの要素を取得
    const form = event.currentTarget.form;
    if (form) {
      const email = form.email.value;
      const password = form.password.value;

      // ログイン情報が空の場合
      if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください。');
        return;
      }

      try {
        // APIリクエスト
        const response = await axios.post('http://127.0.0.1:8000/api/v1/login', {
          email,
          password,
        });

        console.log('ログインに成功しました:', response.data);
        router.push('/demopage'); // ページ遷移
      } catch (error) {
        console.error('ログインに失敗しました:', error);
        router.push('/loginfail'); // ログイン失敗時の遷移
      }
    }
  };

  return (
    <>
      <div className="
        bg-white
        min-h-screen
        py-6 sm:py-60
        lg:py-12"
      >
        <h2 className="
          mb-4
          text-center
          text-2xl
          font-bold
          text-gray-800
          md:mb-8
          lg:text-3xl"
        >
          ログイン
        </h2>

        <form className="
          mx-auto
          max-w-lg
          rounded-lg
          border"
        >
          <div className="
            flex
            flex-col
            gap-4
            p-4
            md:p-8"
          >
            <div>
              <label htmlFor="email"
                className="
                  mb-2
                  inline-block
                  text-sm
                  text-gray-800
                  sm:text-base"
                >
                  Email
                </label>
              <input
                name="email"
                type="email"
                className="
                  w-full
                  rounded
                  border bg-gray-50
                  px-3 py-2
                  text-gray-800 outline-none
                  ring-indigo-300
                  transition duration-100 focus:ring"
              />
            </div>

            <div>
              <label htmlFor="password"
                className="
                  mb-2
                  inline-block
                  text-sm
                  text-gray-800
                  sm:text-base"
                >
                  Password
                </label>
              <input
                name="password"
                type="password"
                className="
                  w-full rounded border
                  bg-gray-50 px-3 py-2
                  text-gray-800
                  outline-none
                  ring-indigo-300
                  transition duration-100
                  focus:ring"
              />
            </div>

            <button className="
              block
              rounded-lg
              bg-gray-800
              px-8 py-3
              text-center text-sm
              font-semibold text-white
              outline-none
              ring-gray-300
              transition duration-100
              hover:bg-gray-700
              focus-visible:ring
              active:bg-gray-600
              md:text-base"
              onClick={onClickLogin}
            >
              ログイン
            </button>
          </div>
          <p className="text-center mb-4">
            <Link href="/register"
              className="
                text-gray-800
                hover:text-blue-600
                transition
                duration-100"
              >
                新規登録はこちら
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginComp;
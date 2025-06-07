'use client';

import Link from "next/link";
import { FC, useRef } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { saveLog } from "..//../utils/logger";


const LoginComp: FC = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const onClickLogin = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    event.preventDefault();

    // console.log('ログインボタンがクリックされました。');

    if (formRef.current) {
      const email = formRef.current.elements.namedItem('email') as HTMLInputElement;
      const password = formRef.current.elements.namedItem('password') as HTMLInputElement;
      const emailValue = email.value;
      const passwordValue = password.value;

      // ログイン情報が空の場合
      if (!emailValue || !passwordValue) {
        alert('メールアドレスもしくはパスワードが入力されていません。');
        return;
      }

      // メールアドレスの形式を検証
      if (!emailValue.includes('@') || !emailValue.endsWith('@gmail.com')) {
        alert('ログイン情報が不正です。正しいログイン情報を入力して下さい。');
        return;
      }

      // パスワードが入力されているか検証
      if (!passwordValue) {
        alert('ログイン情報が不正です。正しいログイン情報を入力して下さい。');
        return;
      }

      // FormDataを使用する
      try {
        const formData = new FormData();
        formData.append('username', emailValue);
        formData.append('password', passwordValue);

        // console.log('送信データ:', {username: emailValue, password: passwordValue});
        // 環境変数からAPIエンドポイントを取得する
        const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
        console.log('API URL:', apiUrl);

        const response = await axios.post(
          `${apiUrl}/login`,
          formData
        );

        localStorage.setItem('authToken', response.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        // console.log('ログインに成功しました:', response.data);

        router.push('/user'); // ページ遷移
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('ログインに失敗しました:', error.response.data);
          saveLog('error', 'ログインに失敗しました。');
        } else {
          console.error('ログインに失敗しました:', error);
          saveLog('error', 'ログインに失敗しました。');
        }

        router.push('/loginfail');
      }
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
          mb-4 text-center text-2xl font-bold text-gray-800 md:mb-8 lg:text-3xl"
        >
          ログイン
        </h2>
        <form
          ref={formRef}
          className="mx-auto max-w-lg rounded-lg border"
        >
          <div
            className="flex flex-col gap-4 p-4 md:p-8"
          >
            <div>
              <label htmlFor="email-field"
                className="mb-2 inline-block text-sm text-gray-800 sm:text-base"
                >
                  Email
                </label>
              <input
                id="email-field"
                name="email"
                type="email"
                className="
                w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                outline-none ring-indigo-300 transition duration-100 focus:ring"
              />
            </div>

            <div>
              <label htmlFor="password-field"
                className="mb-2 inline-block text-sm text-gray-800 sm:text-base"
                >
                  Password
                </label>
              <input
                id="password-field"
                name="password"
                type="password"
                className="
                w-full rounded border bg-gray-50 px-3 py-2
                text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
              />
            </div>

            <button
              className="
              block rounded-lg bg-gray-800 px-8 py-3 text-center text-sm font-semibold
              text-white outline-none ring-gray-300 transition duration-100 hover:bg-gray-700
              focus-visible:ring active:bg-gray-600 md:text-base"
              onClick={onClickLogin}
            >
              ログイン
            </button>
          </div>
          <p
            className="text-center mb-4"
          >
            <Link
              href="/register"
              className="text-gray-800 hover:text-blue-600 transition duration-100"
            >
              新規登録はこちら
            </Link>
          </p>
          <p
            className="text-center mb-4"
          >
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-700 transition duration-100"
            >
                ホームに戻る
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};
export default LoginComp;
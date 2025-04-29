'use client';

import Link from "next/link";
import { FC } from "react";
import axios from "axios";


const LoginComp: FC = () => {
  const onClickLogin = (
    event:
      React.MouseEvent<
        HTMLButtonElement,
        MouseEvent>
      ): void => {
    console.log('ログインボタンがクリックされました');
    // エンドポイントを指定する
    // const endpoint = 'https://example.com/api/login';

    // GETメソッド
    axios({
      method: 'get',
      url: '',
      responseType: 'stream'
    })
      // 成功した場合
      .then(function (response) {
        console.log('成功:', response.data);
      });
    event.preventDefault();

    // Get form values
    const form = event.currentTarget.form;
    if (form) {
      const email = form.email.value;
      const password = form.password.value;

      // Basic validation
      if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください。');
        return;
      }
      // In a real app, you would call an API here
      console.log('ログイン試行:', { email, password });
    }
  }

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
              <Link href="/">
                ログイン
              </Link>
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
  )
}

export default LoginComp;
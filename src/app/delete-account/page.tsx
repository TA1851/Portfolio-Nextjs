'use client';

import Link from "next/link";
import { FC, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";


const DeleteAccountComp: FC = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onClickDeleteAccount = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);

    if (formRef.current) {
      const email = formRef.current.elements.namedItem('email') as HTMLInputElement;
      const password = formRef.current.elements.namedItem('password') as HTMLInputElement;
      const confirmPassword = formRef.current.elements.namedItem('confirmPassword') as HTMLInputElement;
      const emailValue = email.value;
      const passwordValue = password.value;
      const confirmPasswordValue = confirmPassword.value;

      // 入力値の検証
      if (!emailValue || !passwordValue || !confirmPasswordValue) {
        alert('すべての項目を入力してください。');
        setIsLoading(false);
        return;
      }

      // メールアドレスの形式を検証
      if (!emailValue.includes('@')) {
        alert('正しいメールアドレスを入力してください。');
        setIsLoading(false);
        return;
      }

      // パスワード確認
      if (passwordValue !== confirmPasswordValue) {
        alert('パスワードが一致しません。');
        setIsLoading(false);
        return;
      }

      // 確認ダイアログ
      const isConfirmed = confirm('本当にアカウントを削除しますか？この操作は取り消せません。');
      if (!isConfirmed) {
        setIsLoading(false);
        return;
      }

      try {
        // 環境変数からAPIエンドポイントを取得する
        const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
        const token = localStorage.getItem('authToken');

        if (!token) {
          alert('ログインが必要です。');
          router.push('/login');
          return;
        }

        await axios.delete(
          `${apiUrl}/user/delete-account`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              email: emailValue,
              password: passwordValue,
              confirm_password: confirmPasswordValue
            }
          }
        );

        // 退会成功
        localStorage.removeItem('authToken');
        alert('アカウントの削除が完了しました。');
        router.push('/');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('退会処理に失敗しました:', error.response.data);
          alert('退会処理に失敗しました。入力内容をご確認ください。');
        } else {
          console.error('退会処理に失敗しました:', error);
          alert('退会処理中にエラーが発生しました。');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div
        className="bg-white min-h-screen py-6 sm:py-60 lg:py-12"
      >
        <h2
          className="
            mb-4 text-center text-2xl font-bold
            text-gray-600 md:mb-8 lg:text-3xl"
        >
          アカウント削除
        </h2>
        <div
          className="
            mx-auto max-w-lg mb-6 p-4 bg-red-50
            border border-red-200 rounded-lg"
          >
          <p
            className="text-red-700 text-sm"
          >
            <strong>注意:</strong>
            アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
          </p>
        </div>
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
                メールアドレス
              </label>
              <input
                id="email-field"
                name="email"
                type="email"
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-red-300 transition duration-100 focus:ring"
                placeholder="登録されているメールアドレスを入力"
              />
            </div>
            <div>
              <label htmlFor="password-field"
                className="mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                パスワード
              </label>
              <input
                id="password-field"
                name="password"
                type="password"
                className="
                w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                outline-none ring-red-300 transition duration-100 focus:ring"
                placeholder="現在のパスワードを入力"
              />
            </div>
            <div>
              <label htmlFor="confirm-password-field"
                className="mb-2 inline-block text-sm text-gray-800 sm:text-base"
              >
                パスワード確認
              </label>
              <input
                id="confirm-password-field"
                name="confirmPassword"
                type="password"
                className="
                  w-full rounded border bg-gray-50 px-3 py-2 text-gray-800
                  outline-none ring-red-300 transition duration-100 focus:ring"
                placeholder="パスワードを再入力"
              />
            </div>
            <button
              className="
                block rounded-lg bg-red-600 px-8 py-3 text-center text-sm
                font-semibold text-white outline-none ring-red-300 transition
                duration-100 hover:bg-red-300 focus-visible:ring
                active:bg-red-800 md:text-base disabled:opacity-50"
              onClick={onClickDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : 'アカウントを削除する'}
            </button>
          </div>
          <p className="text-center mb-4">
            <Link
              href="/user"
              className="text-gray-800 hover:text-blue-600 transition duration-100"
            >
              キャンセル
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};
export default DeleteAccountComp;
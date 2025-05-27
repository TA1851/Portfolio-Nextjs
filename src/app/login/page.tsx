// 'use client';

// import Link from "next/link";
// import { FC, useRef } from "react";
// import { useRouter } from 'next/navigation';
// import axios from "axios";
// import { saveLog } from "..//../utils/logger";


// const LoginComp: FC = () => {
//   const router = useRouter();
//   const formRef = useRef<HTMLFormElement>(null);

//   const onClickLogin = async (
//     event: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ): Promise<void> => {
//     event.preventDefault();

//     console.log('ログインボタンがクリックされました。');

//     if (formRef.current) {
//       const email = formRef.current.elements.namedItem('email') as HTMLInputElement;
//       const password = formRef.current.elements.namedItem('password') as HTMLInputElement;
//       const emailValue = email.value;
//       const passwordValue = password.value;

//       // ログイン情報が空の場合
//       if (!emailValue || !passwordValue) {
//         alert('メールアドレスとパスワードを入力してください。');
//         saveLog('error', 'メールアドレスとパスワードが空です。');
//         return;
//       }
//       // FormDataを使用する
//       try {
//         const formData = new FormData();
//         formData.append('username', emailValue);
//         formData.append('password', passwordValue);

//         console.log('送信データ:', {username: emailValue, password: passwordValue});
//         // 環境変数からAPIエンドポイントを取得する
//         const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
//         console.log('API URL:', apiUrl);

//         const response = await axios.post(
//           `${apiUrl}/login`,
//           formData
//         );

//         localStorage.setItem('authToken', response.data.access_token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
//         console.log('ログインに成功しました:', response.data);
//         saveLog('info', 'ログインに成功しました。');

//         router.push('/user'); // ページ遷移
//       } catch (error) {
//         if (axios.isAxiosError(error) && error.response) {
//           console.error('ログインに失敗しました:', error.response.data);
//           saveLog('error', 'ログインに失敗しました。');
//         } else {
//           console.error('ログインに失敗しました:', error);
//           saveLog('error', 'ログインに失敗しました。');
//         }

//         router.push('/loginfail');
//       }
//     }
//   };

//   return (
//     <>
//       <div className="
//         bg-white
//         min-h-screen
//         py-6 sm:py-60
//         lg:py-12"
//       >
//         <h2 className="
//           mb-4
//           text-center
//           text-2xl
//           font-bold
//           text-gray-800
//           md:mb-8
//           lg:text-3xl"
//         >
//           ログイン
//         </h2>

//         <form
//           ref={formRef}
//           className="
//           mx-auto
//           max-w-lg
//           rounded-lg
//           border"
//         >
//           <div className="
//             flex
//             flex-col
//             gap-4
//             p-4
//             md:p-8"
//           >
//             <div>
//               <label htmlFor="email-field"
//                 className="
//                   mb-2
//                   inline-block
//                   text-sm
//                   text-gray-800
//                   sm:text-base"
//                 >
//                   Email
//                 </label>
//               <input
//                 id="email-field"
//                 name="email"
//                 type="email"
//                 className="
//                   w-full
//                   rounded
//                   border bg-gray-50
//                   px-3 py-2
//                   text-gray-800 outline-none
//                   ring-indigo-300
//                   transition duration-100 focus:ring"
//               />
//             </div>

//             <div>
//               <label htmlFor="password-field"
//                 className="
//                   mb-2
//                   inline-block
//                   text-sm
//                   text-gray-800
//                   sm:text-base"
//                 >
//                   Password
//                 </label>
//               <input
//                 id="password-field"
//                 name="password"
//                 type="password"
//                 className="
//                   w-full rounded border
//                   bg-gray-50 px-3 py-2
//                   text-gray-800
//                   outline-none
//                   ring-indigo-300
//                   transition duration-100
//                   focus:ring"
//               />
//             </div>

//             <button className="
//               block
//               rounded-lg
//               bg-gray-800
//               px-8 py-3
//               text-center text-sm
//               font-semibold text-white
//               outline-none
//               ring-gray-300
//               transition duration-100
//               hover:bg-gray-700
//               focus-visible:ring
//               active:bg-gray-600
//               md:text-base"
//               onClick={onClickLogin}
//             >
//               ログイン
//             </button>
//             {/* <div className="flex justify-center">
//               <a href="/logs" className="text-sm text-gray-500 hover:text-blue-500">
//                 開発者向け: ログを表示
//               </a>
//             </div> */}
//           </div>
//           <p className="text-center mb-4">
//             <Link href="/register"
//               className="
//                 text-gray-800
//                 hover:text-blue-600
//                 transition
//                 duration-100"
//               >
//                 新規登録はこちら
//             </Link>
//           </p>
//         </form>
//       </div>
//     </>
//   );
// };
// export default LoginComp;

'use client';

import Link from "next/link";
import { FC, useState } from "react";
import axios from "axios";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

interface ApiErrorResponse {
  detail: string;
}

const LoginComp: FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("すべてのフィールドを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/user`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 成功時の処理
      console.log("ユーザー作成成功:", response.data);
      setSuccess(true);
      setFormData({ name: "", email: "", password: "" });
      
      // 必要に応じてリダイレクトやその他の処理を追加
      // router.push("/login");
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data as ApiErrorResponse;
        
        switch (err.response.status) {
          case 400:
            setError("入力内容に不備があります。");
            break;
          case 401:
            setError(errorData.detail || "このメールアドレスは既に使用されています。");
            break;
          case 409:
            setError(errorData.detail || "パスワードが不正です。");
            break;
          case 500:
            setError("サーバーエラーが発生しました。時間をおいて再度お試しください。");
            break;
          default:
            setError("予期しないエラーが発生しました。");
        }
      } else {
        setError("ネットワークエラーが発生しました。");
      }
      console.error("ユーザー作成エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="
        bg-white min-h-screen
        py-6 sm:py-60 lg:py-12
      ">
        <h2 className="
          mb-4 text-center
          text-2xl font-bold
          text-blue-500
          md:mb-8 lg:text-3xl
        ">
          新規登録
        </h2>
        <form 
          className="
            mx-auto max-w-lg
            rounded-lg border
          "
          onSubmit={handleSubmit}
        >
          <div className="
            flex flex-col gap-4 p-4
            md:p-8
          ">
            {/* エラーメッセージ表示 */}
            {error && (
              <div className="
                rounded-lg bg-red-50 
                border border-red-200 
                p-3 text-red-800 text-sm
              ">
                {error}
              </div>
            )}

            {/* 成功メッセージ表示 */}
            {success && (
              <div className="
                rounded-lg bg-green-50 
                border border-green-200 
                p-3 text-green-800 text-sm
              ">
                アカウントが正常に作成されました！
              </div>
            )}

            <div>
              <label htmlFor="name"
                className="
                  mb-2 inline-block text-sm text-gray-800
                  sm:text-base
                ">
                お名前
              </label>
              <input 
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded
                  border bg-gray-50
                  px-3 py-2
                  text-gray-800
                  outline-none ring-indigo-300
                  transition duration-100 focus:ring
                "
                placeholder="山田太郎"
              />
            </div>

            <div>
              <label htmlFor="email"
                className="
                  mb-2 inline-block text-sm text-gray-800
                  sm:text-base
                ">
                Email
              </label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded
                  border bg-gray-50
                  px-3 py-2
                  text-gray-800
                  outline-none ring-indigo-300
                  transition duration-100 focus:ring
                "
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label htmlFor="password"
                className="
                  mb-2 inline-block
                  text-sm text-gray-800
                  sm:text-base
                ">
                Password
              </label>
              <input 
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="
                  w-full rounded
                  border bg-gray-50
                  px-3 py-2
                  text-gray-800
                  outline-none ring-indigo-300
                  transition duration-100 focus:ring
                "
                placeholder="パスワードを入力してください"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                block rounded-lg
                bg-blue-600
                px-8 py-3
                text-center text-sm
                font-semibold text-white
                outline-none ring-gray-300
                transition duration-100
                hover:bg-blue-500 focus-visible:ring
                active:bg-gray-600 md:text-base
                disabled:bg-gray-400 disabled:cursor-not-allowed
              ">
              {isLoading ? "登録中..." : "新規登録"}
            </button>
          </div>
          <p className="
            text-center mb-4
          ">
            <Link href="/login" className="
              text-gray-800 hover:text-blue-600 transition duration-100
            ">
              登録済みの方はこちら
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default LoginComp;
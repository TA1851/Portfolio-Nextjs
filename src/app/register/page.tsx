import Link from "next/link";
import { FC } from "react";

const LoginComp: FC = () => {
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
        <form className="
          mx-auto max-w-lg
          rounded-lg border
        ">
          <div className="
            flex flex-col gap-4 p-4
            md:p-8
          ">
            <div>
              <label htmlFor="email"
              className="
                mb-2 inline-block text-sm text-gray-800
                sm:text-base
              ">
                Email
              </label>
              <input name="email"
              className="
                w-full rounded
                border bg-gray-50
                px-3 py-2
                text-gray-800
                outline-none ring-indigo-300
                transition duration-100 focus:ring
              "/>
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
              <input name="password"
              className="
                w-full rounded
                border bg-gray-50
                px-3 py-2
                text-gray-800
                outline-none ring-indigo-300
                transition duration-100 focus:ring
              "/>
            </div>
            <button
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
            ">
              <Link href="/login">
                新規登録
              </Link>
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
import { FC } from 'react';
import Link from 'next/link';


const Page1: FC = () => {
  const publishedDate = "2023年10月15日";
  return (
    <>
      <article className="
        max-w-2xl mx-auto
        px-4 py-8
        bg-gray-50
        rounded-lg shadow-md"
      >
      <header className="mb-6">
        <h1 className="
        text-black text-3xl
        font-bold mb-2"
        >
          ブログのSEO対策入門
        </h1>
      </header>
      <div className="prose">
        <h2
          className="
          text-black text-xl
          font-bold mb-2"
        >
          狙う検索語句を決める。
        </h2>
        <p className="
          text-black mb-4"
        >
          ブログの始め方やダイエット、食事、メニューなどタイトルや見出しににキーワードを入れる。<br />
          <br />
          例：「初心者でも簡単！ブログの始め方とSEO対策」
        </p>
        <h2
          className="
          text-black text-xl
          font-bold mb-2"
          >
          メタディスクリプション（記事の説明）を設定する。
        </h2>
        <p
          className="
            text-black
            mb-4"
          >
          メタディスクリプションは、検索結果に表示される要約文です。<br />
          読者がクリックしたくなるような魅力的な内容にしましょう。<br />
          <br />
          例）「このブログでは、初心者でも簡単にできるブログの始め方とSEO対策について詳しく解説します。」<br />
        </p>
        <div className="
        text-gray-500 text-sm
        text-right mr-3"
        >
          投稿日: {publishedDate}
        </div>
        {/* ホームに戻るボタン */}
      <div className="
        mt-8 text-center
      ">
        <Link href="/"
        className="
          inline-block
          px-4 py-2
          bg-gray-100
          text-blue-600
          rounded
          hover:bg-gray-200
          transition-colors
        ">
          ホームに戻る
        </Link>
      </div>
      </div>
      </article>
    </>
  )
}
export default Page1;
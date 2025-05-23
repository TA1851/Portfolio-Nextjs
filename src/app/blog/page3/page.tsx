import { FC } from 'react';
import Link from 'next/link';


const Page1: FC = () => {
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
          読まれるブログの書き方
        </h1>
      </header>
      <div className="prose">
        <p className="
        text-black mb-4"
        >
          読者を惹きつける記事の構成と文章テクニックについて解説します。
        </p>
        <h2 className="
          text-black text-xl
          font-bold mb-2"
        >
          読者ターゲットを明確にする
        </h2>
        <p className="
          text-black mb-4"
        >
          誰に向けた記事なのかを最初に決めましょう。<br />
          例）初心者向け、上級者向け、特定の年齢層や性別など。
        </p>
        <h2 className="
          text-black text-xl
          font-bold mb-2"
        >
          魅力的なタイトルをつける
        </h2>
        <p className="
          text-black mb-4"
        >
          読者の興味を引くタイトルを考えましょう。<br />
          例）「初心者でもできる！簡単なブログの書き方」など。
        </p>
        <h2 className="
          text-black text-xl
          font-bold mb-2"
        >
          構成を考える
        </h2>
        <p className="
          text-black mb-4"
        >
          読者が理解しやすいように、記事の構成を考えます。<br />
          例）<br />
          1. はじめに<br />
          2. 本文（見出しごとに分ける）<br />
          3. まとめ
        </p>
        <div className="
          text-gray-500 text-sm
          text-right mr-3"
        >
          投稿日: 2023年10月15日
        </div>
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
      </article>
    </>
  )
}

export default Page1;
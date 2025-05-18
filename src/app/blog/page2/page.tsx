import { FC } from 'react';

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
          ブログのSEO対策入門
        </h1>
      </header>
      <div className="prose">
        <p className="
          text-black mb-4"
        >
          検索エンジンからアクセスを増やすための基本テクニックを紹介します。<br />
          狙う検索語句を決める。（キーワード選定）<br />
          例：ブログの始め方やダイエット、食事、メニューなど
        </p>
        <h2 className="
          text-black text-xl
          font-bold mb-4"
        >
          タイトルや見出しににキーワードを入れる
        </h2>
        <p className="
        text-black mb-4"
        >
          例：「初心者でも簡単！ブログの始め方とSEO対策」
        </p>
        <h2 className="
          text-black text-xl
          font-bold mb-4"
        >
          メタディスクリプション（記事の説明）を設定する
        </h2>
        <p className="
          text-black mb-4"
        >
          検索結果に表示される要約文、120文字前後で、記事の内容と魅力を伝える。
        </p>
        <div className="
        text-gray-500 text-sm
        text-right mr-3"
        >
          投稿日: 2023年10月15日
        </div>
      </div>
      </article>
    </>
  )
}
export default Page1;
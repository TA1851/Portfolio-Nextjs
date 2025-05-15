import { FC } from 'react';

const Page1: FC = () => {
  return (
    <>
      <article className="max-w-2xl mx-auto px-4 py-8 bg-gray-50 rounded-lg shadow-md">
        <header className="mb-6">
          <h1 className="text-black text-3xl font-bold mb-2">シンプルなブログ記事のタイトル</h1>
          <div className="text-gray-500 text-sm">投稿日: 2023年10月15日</div>
        </header>
        <div className="prose">
          <p className="text-black mb-4">
            これはシンプルなブログ記事の例です。ここに記事の導入部分を書きます。読者の興味を引くような内容にすると良いでしょう。
          </p>
          <h2 className="text-xl font-semibold mt-6 mb-3">最初の見出し</h2>
          <p className="text-black mb-4">
            ここには記事の本文を書きます。段落を分けて読みやすくするのが重要です。テキストのみのシンプルな記事でも、適切に構造化することで読みやすさが向上します。
          </p>
          <h2 className="text-black text-xl font-semibold mt-6 mb-3">次の見出し</h2>
          <p className="text-black mb-4">
            記事の内容に応じて、複数の見出しを使って情報を整理します。これにより読者は必要な情報を素早く見つけることができます。
          </p>
          <p className="text-black mb-4">
            結論として、シンプルな記事でも構造化されたコンテンツは読者にとって価値があります。このような形式で情報を整理して提供しましょう。
          </p>
        </div>
      </article>
    </>
  )
}

export default Page1;
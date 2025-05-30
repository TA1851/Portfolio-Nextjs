import { FC } from 'react';
import Link from 'next/link';

const Page1: FC = () => {
  // 投稿日を動的に設定
  const publishedDate = "2023年10月15日";
  
  return (
    <>
      <article className="
        max-w-2xl mx-auto px-4 py-8
        bg-gray-50 rounded-lg shadow-md
      ">
        <header className="mb-6">
          <h1 className="
            text-black text-3xl
            font-bold mb-2
          ">
            ブログ始め方の基本ガイド
          </h1>
        </header>
        
        <div className="space-y-6">
          <section>
            <h2 className="
              text-black text-xl
              font-bold mb-4
            ">
              ブログを始める目的を明確にしよう
            </h2>
            <p className="text-black mb-4">
              まず、ブログを始める目的を明確にしましょう。情報発信、収入源の確保、趣味の共有など、目的によって運営方法が変わります。
              目的がはっきりすると、今後の方向性やデザイン、記事内容にも一貫性が出ます。
            </p>
          </section>
          
          <section>
            <h2 className="
              text-black text-xl
              font-bold mb-4
            ">
              ブログのテーマ・ジャンルを決めよう
            </h2>
            <p className="text-black mb-4">
              次に、ブログのテーマやジャンルを決めます。自分が興味を持っていることや得意なことを考えましょう。
              競合が少ないニッチなテーマを選ぶと、読者の関心を引きやすくなります。
              例）プログラミング、子育て、ダイエット、旅行、副業 など
              ただし、あまりにもマイナーなテーマだと読者が集まらない可能性もあるので、バランスを考えましょう。
            </p>
          </section>
          
          <div className="
            text-gray-500 text-sm
            text-right mr-3
          ">
            投稿日: {publishedDate}
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
            "
          >
            ホームに戻る
          </Link>
        </div>
      </article>
    </>
  )
}

export default Page1;
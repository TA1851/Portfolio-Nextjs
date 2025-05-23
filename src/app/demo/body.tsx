import { FC } from "react";
import Link from "next/link";


const BodyComp: FC = () => {
  const publishedDate_Page1 = "2023年10月15日";
  const publishedDate_Page2 = "2024年11月25日";
  const publishedDate_Page3 = "2025年3月5日";
  return (
    <>
      <div className="
        bg-white py-6
        sm:py-8 lg:py-12"
      >
        <div className="
          mx-auto max-w-screen-2xl
          px-4 md:px-8
        ">
            <div className="
              mb-10 md:mb-16
            ">
              <h2 className="
                mb-4 text-center text-2xl
                font-bold text-gray-800 md:mb-6
                lg:text-3xl
              ">
                ブログを始める
              </h2>
            </div>
            <div className="
              grid gap-4 sm:grid-cols-2
              md:gap-6 lg:grid-cols-3 xl:grid-cols-3
              xl:gap-8
            ">
              <div className="
                flex flex-col overflow-hidden
                rounded-lg border bg-white
              ">
                {/* <Link href="#" className="
                  group relative block h-48
                  overflow-hidden bg-gray-100
                ">
                </Link> */}
                <div className="
                  flex flex-1 flex-col
                  p-4 sm:p-6
                ">
                  <h3 className="
                    mb-2 text-lg font-semibold
                    text-gray-800
                  ">
                    <Link href="../blog/page1/" className="
                      transition duration-100
                      hover:text-indigo-500
                    ">
                      ブログ始め方の基本ガイド
                    </Link>
                  </h3>
                  <p className="
                    text-gray-500 mb-8
                  ">
                    ブログを始める際の準備から投稿までのステップを初心者にもわかりやすく解説します。
                  </p>
                  <div className="
                    mt-auto flex items-end
                    justify-between
                  ">
                    <span className="
                      text-sm text-gray-500
                    ">
                      {publishedDate_Page1}
                    </span>
                    <span
                    className="
                      rounded-lg bg-gray-100 px-2
                      py-1 text-sm text-gray-700
                    ">
                      初心者向け
                    </span>
                  </div>
                </div>
              </div>
              <div className="
                flex flex-col overflow-hidden
                rounded-lg border bg-white
              ">
                {/* <Link href="#"
                className="
                  group relative block h-48
                  overflow-hidden bg-gray-100
                ">
                </Link> */}
                <div
                className="
                  flex flex-1 flex-col
                  p-4 sm:p-6
                ">
                  <h3
                  className="
                    mb-2 text-lg font-semibold
                    text-gray-800
                  ">
                    <Link href="../blog/page2"
                    className="
                      transition duration-100
                      hover:text-indigo-500
                    ">
                      ブログのSEO対策入門
                    </Link>
                  </h3>
                  <p
                  className="
                    text-gray-500 mb-8
                  ">
                    検索エンジンからアクセスを増やすための基本テクニックを紹介します。
                  </p>
                  <div
                  className="
                    mt-auto flex items-end
                    justify-between
                  ">
                    <span
                    className="
                      text-sm text-gray-500
                    ">
                      {publishedDate_Page2}
                    </span>
                    <span
                    className="
                      rounded-lg bg-gray-100 px-2
                      py-1 text-sm text-gray-700
                    ">
                      SEO
                    </span>
                  </div>
                </div>
              </div>
              <div
              className="
                flex flex-col overflow-hidden
                rounded-lg border bg-white
              ">
                {/* <Link href="../blog/page2"
                className="
                  group relative block h-48
                  overflow-hidden bg-gray-100
                ">
                </Link> */}
                <div
                className="
                  flex flex-1 flex-col
                  p-4 sm:p-6
                ">
                  <h3
                  className="
                    mb-2 text-lg font-semibold
                    text-gray-800
                  ">
                    <Link href="../blog/page3"
                    className="
                      transition duration-100
                      hover:text-indigo-500
                    ">
                      読まれるブログの書き方
                    </Link>
                  </h3>
                  <p
                  className="
                    text-gray-500 mb-8
                  ">
                    読者を惹きつける記事の構成と文章テクニックについて解説します。
                  </p>
                  <div
                  className="
                    mt-auto flex items-end
                    justify-between
                  ">
                    <span
                    className="
                      text-sm text-gray-500
                    ">
                      {publishedDate_Page3}
                    </span>
                    <span
                    className="
                      rounded-lg bg-gray-100 px-2
                      py-1 text-sm text-gray-700
                    ">
                      ライティング
                    </span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </>
  );
};
export default BodyComp;
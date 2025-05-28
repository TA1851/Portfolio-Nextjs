import { FC, useState, useEffect } from "react";
import Link from "next/link";

// 記事の型定義
interface Article {
  article_id: number;
  title: string;
  body: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const BodyComp: FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 記事の取得
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
      const response = await fetch(`${API_URL}/public/articles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('取得した記事データ:', data);
      
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.warn('APIレスポンスが配列ではありません:', data);
        setArticles([]);
      }
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
      setError('記事の取得に失敗しました。しばらく後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);
  return (
    <>
      <div className="
        bg-white py-6
        sm:py-8 lg:py-12
      ">
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
            
            {/* ローディング表示 */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">記事を読み込み中...</p>
              </div>
            )}
            
            {/* エラー表示 */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={fetchArticles}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  再試行
                </button>
              </div>
            )}
            {/* 記事一覧表示 */}
            {!loading && !error && (
              <div className="
                grid gap-4 sm:grid-cols-2
                md:gap-6 lg:grid-cols-3 xl:grid-cols-3
                xl:gap-8
              ">
                {articles.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">まだ記事が投稿されていません。</p>
                  </div>
                ) : (
                  articles.map((article) => (
                    <div key={article.article_id} className="
                      flex flex-col overflow-hidden
                      rounded-lg border bg-white
                    ">
                      <div className="
                        flex flex-1 flex-col
                        p-4 sm:p-6
                      ">
                        <h3 className="
                          mb-2 text-lg font-semibold
                          text-gray-800
                        ">
                          <Link href={`/articles/${article.article_id}`} className="
                            transition duration-100
                            hover:text-indigo-500
                          ">
                            {article.title}
                          </Link>
                        </h3>
                        <p className="
                          text-gray-500 mb-8
                        ">
                          {article.body.length > 1000
                            ? `${article.body.substring(0, 1000)}...`
                            : article.body
                          }
                        </p>
                        <div className="
                          mt-auto flex items-end
                          justify-between
                        ">
                          <span className="
                            text-sm text-gray-500
                          ">
                            {formatDate(article.created_at)}
                          </span>
                          <span className="
                            rounded-lg bg-gray-100 px-2
                            py-1 text-sm text-gray-700
                          ">
                            記事ID: {article.article_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
};
export default BodyComp;
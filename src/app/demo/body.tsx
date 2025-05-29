"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { CircularProgress, Box, Typography } from '@mui/material';

// 記事の型定義
interface Article {
  article_id: number;
  title: string;
  body_html: string;
}

const BodyComp: FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(0);
  const articlesPerPage = 6;

  // HTMLタグを除去してプレーンテキストに変換する関数
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  // ページネーション計算
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // ページ変更時にトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 記事の取得
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      setProgress(0);
      
      // 初期化
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(10);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
      console.log('記事一覧 - 環境変数 API_URL:', API_URL);
      
      // API URL準備
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(25);
      
      const listUrl = `${API_URL}/public/articles`;
      console.log('記事一覧リクエスト URL:', listUrl);
      
      // リクエスト準備
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(40);
      
      const response = await fetch(listUrl);
      
      // レスポンス受信
      await new Promise(resolve => setTimeout(resolve, 250));
      setProgress(60);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // データ解析中
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(75);
      
      const data = await response.json();
      console.log('取得した記事データ:', data);
      
      // データ処理中
      await new Promise(resolve => setTimeout(resolve, 400));
      setProgress(90);
      
      if (Array.isArray(data)) {
        console.log('利用可能な記事ID一覧:', data.map(article => article.article_id));
        setArticles(data);
        // 記事データが更新されたら最初のページに戻る
        setCurrentPage(1);
      } else {
        console.warn('APIレスポンスが配列ではありません:', data);
        setArticles([]);
        setCurrentPage(1);
      }
      
      // 完了
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(100);
      
      // 完了後に少し待ってからローディングを終了
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
      setError('記事の取得に失敗しました。しばらく後でもう一度お試しください。');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // CircularProgressWithLabelコンポーネント
  const CircularProgressWithLabel = ({ value }: { value: number }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={value} size={60} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgressWithLabel value={progress} />
                  <Typography variant="body2" color="text.secondary">
                    記事を読み込み中...
                  </Typography>
                </Box>
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
              <>
                <div className="
                  grid gap-4 sm:grid-cols-2
                  md:gap-6 lg:grid-cols-3 xl:grid-cols-3
                  xl:gap-8
                ">
                  {currentArticles.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-600">まだ記事が投稿されていません。</p>
                    </div>
                  ) : (
                    currentArticles.map((article) => (
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
                            <Link href={`/demo/articles/${article.article_id}`} className="
                              transition duration-100
                              hover:text-indigo-500
                            ">
                              {article.title}
                            </Link>
                          </h3>
                          <p className="
                            text-gray-500 mb-8
                          ">
                            {/* HTMLをテキストとして表示するため、HTMLタグを除去 */}
                            {(() => {
                              const plainText = stripHtml(article.body_html);
                              return plainText.length > 30
                                ? `${plainText.substring(0, 30)}...`
                                : plainText;
                            })()}
                          </p>
                          <div className="
                            mt-auto flex items-end
                            justify-between
                          ">
                            <span className="
                              text-sm text-gray-500
                            ">
                              記事ID: {article.article_id}
                            </span>
                            <span className="
                              rounded-lg bg-gray-100 px-2
                              py-1 text-sm text-gray-700
                            ">
                              ブログ記事
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* 前のページボタン */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        前へ
                      </button>

                      {/* ページ番号ボタン */}
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      {/* 次のページボタン */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        次へ
                      </button>
                    </nav>
                  </div>
                )}

                {/* ページ情報 */}
                {/* {articles.length > 0 && (
                  <div className="mt-6 text-center text-sm text-gray-500">
                    {articles.length}件中 {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, articles.length)}件を表示
                    {totalPages > 1 && ` (${currentPage}/${totalPages}ページ)`}
                  </div>
                )} */}
              </>
            )}
        </div>
      </div>
    </>
  );
};
export default BodyComp;
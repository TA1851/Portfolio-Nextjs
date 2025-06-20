"use client";

import { FC, useState, useEffect, useCallback } from "react";
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
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    // セッションストレージから初回ロード状態を取得
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('articlesLoaded');
    }
    return true;
  });
  const articlesPerPage = 6; // 1ページあたりの記事数

  // HTMLタグを除去してプレーンテキストに変換する関数
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  // マークダウンをHTMLに変換してサニタイズする関数
  const createMarkdown = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  // ページネーション計算
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 記事の取得
  const fetchArticles = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError("");
      if (!isRetry) {
        setProgress(0);
      }
      // 初回ロード時のみプログレス表示の遅延処理を実行
      if (isInitialLoad && !isRetry) {
        // 初期化
        await new Promise(resolve => setTimeout(resolve, 20));
        setProgress(10);

        const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
        console.log('記事一覧 - 環境変数 API_URL:', API_URL);

        // API URL準備
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress(25);

        const listUrl = `${API_URL}/public/articles`;
        console.log('記事一覧リクエスト URL:', listUrl);

        // リクエスト準備
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(40);

        const response = await fetch(listUrl);

        // レスポンス受信
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress(60);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // データ解析中
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(75);

        const data = await response.json();
        console.log('取得した記事データ:', data);

        // データ処理中
        await new Promise(resolve => setTimeout(resolve, 250));
        setProgress(90);

        if (Array.isArray(data)) {
          console.log('利用可能な記事ID一覧:', data.map(article => article.article_id));
          setArticles(data);
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
        setIsInitialLoad(false);
        // セッションストレージに初回ロード完了を記録
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('articlesLoaded', 'true');
        }
      } else {
        // 再試行時は通常の処理
        const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
        const listUrl = `${API_URL}/public/articles`;
        const response = await fetch(listUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setArticles(data);
          setCurrentPage(1);
        } else {
          setArticles([]);
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
      setError('記事の取得に失敗しました。しばらく後でもう一度お試しください。');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

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
      <div
        className="bg-white py-6 sm:py-8 lg:py-12"
      >
        <div
          className="mx-auto max-w-screen-2xl px-4 md:px-8"
        >
            <div
              className="mb-10 md:mb-16"
            >
              <h2
                className="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl"
              >
                ブログを始める
              </h2>
            </div>
            {/* ローディング表示 */}
            {loading && (
              <div className="text-center py-8">
                {isInitialLoad ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgressWithLabel value={progress} />
                    <Typography variant="body2" color="text.secondary">
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                  </Typography>
                )}
              </div>
            )}
            {/* エラー表示 */}
            {error && (
              <div
                className="text-center py-8"
              >
                <p
                  className="text-red-500 mb-4"
                >
                  {error}
                </p>
                <button
                  onClick={() => fetchArticles(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  再試行
                </button>
              </div>
            )}
            {/* 記事一覧表示 */}
            {!loading && !error && (
              <>
                <div
                  className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-3 xl:gap-8"
                  >
                  {currentArticles.length === 0 ? (
                    <div
                      className="col-span-full text-center py-8"
                    >
                      <p
                        className="text-gray-600"
                      >
                        まだ記事が投稿されていません。
                      </p>
                    </div>
                  ) : (
                    currentArticles.map((article) => (
                      <div
                        key={article.article_id}
                        className="flex flex-col overflow-hidden rounded-lg border bg-white">
                        <div
                          className="flex flex-1 flex-col p-4 sm:p-6"
                        >
                          <h3
                            className="mb-2 text-lg font-semibold text-gray-800"
                          >
                            <Link
                              href={`/demo/articles/${article.article_id}`}
                              className="transition duration-100 hover:text-indigo-500"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <div
                            className="
                            text-gray-500 mb-8 prose prose-sm max-w-none
                            prose-headings:text-gray-800 prose-p:text-gray-500
                            prose-strong:text-gray-700 prose-em:text-gray-600
                            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5
                            prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                            prose-pre:bg-gray-900 prose-pre:text-gray-100
                            prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                            prose-blockquote:border-l-4 prose-blockquote:border-gray-300
                            prose-blockquote:pl-4 prose-blockquote:italic
                            prose-ul:list-disc prose-ol:list-decimal
                            prose-li:text-gray-600
                          ">
                            {/* HTMLをレンダリングするが、プレビュー用に短縮 */}
                            <div
                              dangerouslySetInnerHTML={createMarkdown(
                                (() => {
                                  const plainText = stripHtml(article.body_html);
                                  if (plainText.length > 100) {
                                    // HTMLコンテンツも短縮する場合の処理
                                    const truncatedHtml = article.body_html.length > 200
                                      ? article.body_html.substring(0, 200) + '...'
                                      : article.body_html;
                                    return truncatedHtml;
                                  }
                                  return article.body_html;
                                })()
                              )}
                            />
                          </div>
                          <div
                            className="mt-auto flex items-end justify-between"
                          >
                            <span
                              className="rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-700"
                            >
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
                  <div
                    className="mt-12 flex justify-center"
                  >
                    <nav
                      className="flex items-center space-x-2"
                    >
                      {/* 前のページボタン */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${ currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
                            className={
                              `px-3 py-2 rounded-md text-sm font-medium transition-colors
                              ${ currentPage === pageNumber ? 'bg-indigo-500 text-white'
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
                        className={
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${ currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        次へ
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </>
  );
};
export default BodyComp;
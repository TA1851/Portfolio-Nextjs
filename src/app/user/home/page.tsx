'use client';

import { FC, useEffect, useState } from "react";

// 記事データの型定義
interface Article {
  title: string;
  body: string;
  user_id: number;
  article_id: number;
}

// ページネーション用の状態定義
interface PaginationState {
  currentPage: number;
  articlesPerPage: number;
}

const DemoBody: FC = () => {
  // 状態管理
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ページネーション用の状態（1ページあたりの表示件数）
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    articlesPerPage: 9
  });

  // 初期データロード
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }

        // 全記事を取得するシンプルなAPI呼び出し
        const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
        const response = await fetch(
          `${apiUrl}/articles`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }

        // 初期データロード関数内で記事データを適切に処理
        const data = await response.json();
        console.log('取得した記事データ:', data);

        // データ取得後のデバッグを強化 (article_idに修正)
        if (Array.isArray(data)) {
          console.log('記事データの構造：', {
            totalCount: data.length,
            firstItem: data[0],
            ids: data.map(item => item.article_id),
            hasNullIds: data.some(item =>
              item.article_id === null || item.article_id === undefined)
          });
          // IDがnullや未定義の記事を特定 (article_idに修正)
          data.forEach((article, index) => {
            if (!article.article_id) {
              console.warn(`ID未設定の記事 [${index}]:`, article);
            }
          });
        }
        // nullのタイトルと本文を持つ記事をフィルタリングし、IDの型変換を行う
        const processedData = Array.isArray(data)
          ? data
              .filter(article => article.title !== null && article.body !== null) // NULLの記事をフィルタリング
              .map(article => {
                // IDの有無とタイプを詳細にチェック
                const hasId = 'article_id' in article && article.article_id !== null;
                console.log(
                  `記事「${article.title}」:
                  ID ${hasId ? article.article_id : 'なし'},
                  タイプ ${typeof article.article_id}`);
                return {
                  ...article,
                  // 明示的に存在チェック - 0や空文字も有効なIDとして処理
                  article_id: hasId ? Number(
                    article.article_id
                  ) : undefined
                };
              })
          : [];

        setArticles(processedData);
        setLoading(false);
      } catch (error) {
        console.error('記事取得エラー:', error);
        setError('記事の読み込みに失敗しました。');
        setLoading(false);
      }
    };
    fetchAllArticles();
  }, []); // 空の依存配列で初回マウント時のみ実行

  // 1ページに表示する記事数（ページネーション機能）
  const getCurrentPageArticles = () => {
    if (!articles.length) return [];
    const { currentPage, articlesPerPage } = pagination;
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    return articles.slice(indexOfFirstArticle, indexOfLastArticle);
  };

  // ページ変更ハンドラ
  const handlePageChange = (pageNumber: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  };

  // 明示的なナビゲーション関数
  const navigateToArticle = (
    articleId?: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!articleId) {
      console.warn('記事IDが存在しません');
      return;
    }
    try {
      console.log(`記事ID: ${articleId} の詳細ページへ遷移します`);
      const articlePath = `/articles/${articleId}`;
      console.log(`遷移先: ${articlePath}`);
      // router.pushの代わりにwindow.locationを使用
      window.location.href = articlePath;
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
    }
  };

  // レンダリング部分の追加
  return (
    <div className="
      container mx-auto
      px-4 py-8
    ">
      <h1 className="
      text-2xl
      font-bold mb-6
    ">
      記事一覧
    </h1>
      {loading ? (
        <div className="
          text-center
          py-10
        ">
          <p className="
            text-gray-600
          ">
            記事を読み込み中...
          </p>
        </div>
      ) : error ? (
        <div className="
          text-center py-10
        ">
          <p className="
            text-red-500
          ">
            {error}
          </p>
        </div>
      ) : (
        <>
          <div className="
          grid grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6 mb-8">
            {getCurrentPageArticles().map(
              (article, index) => (
              <div
                key={article.article_id || index}
                className="
                  bg-white rounded-lg
                  shadow-md overflow-hidden
                  hover:shadow-lg transition-shadow
                  duration-300 cursor-pointer
                  "
                onClick={(
                ) => article.article_id && navigateToArticle(
                  article.article_id
                )}
              >
                <div className="p-6">
                  <h2 className="
                    text-xl font-semibold
                    mb-2 text-gray-800
                    hover:text-blue-600
                  ">
                    {article.title}
                  </h2>
                  <p className="
                    text-gray-600 text-sm
                    line-clamp-3 whitespace-pre-line
                  ">
                    {article.body?.substring(0, 150)}...
                  </p>
                  <div className="
                    mt-4 flex
                    justify-between
                    items-center
                  ">
                    <span className="
                      text-sm text-gray-500
                    ">
                      投稿者ID: {article.user_id}
                    </span>
                    <button
                      className={
                        `inline-block ${!article.article_id ?
                          'cursor-not-allowed opacity-50' :
                          'hover:bg-blue-200'
                        } bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (article.article_id) {
                          navigateToArticle(article.article_id, e);
                        } else {
                          console.warn('記事IDが存在しません');
                        }
                      }}
                    >
                      続きを読む
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* ページネーションコントロール */}
          <div className="
            flex
            justify-center mt-8
          ">
            <ul className="flex">
              {Array.from(
                { length: Math.ceil(
                  articles.length / pagination.articlesPerPage
                ) }).map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      pagination.currentPage === index + 1
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
export default DemoBody;
'use client';

import { FC, useEffect, useState } from "react";
import Link from "next/link";


// 記事データの型定義
interface Article {
  title: string;
  body: string;
  user_id: number;
  id?: number; // バックエンドから返されなければフロントで生成する可能性を考慮
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
  const [clientSideRendered, setClientSideRendered] = useState(false);

  // ページネーション用の状態（1ページあたりの表示件数）
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    articlesPerPage: 9
  });

  // コンポーネントがマウントされたことを確認
  useEffect(() => {
    setClientSideRendered(true);
  }, []);

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
        const response = await fetch('http://127.0.0.1:8000/api/v1/articles', {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }
        const data = await response.json();
        console.log('取得した記事データ:', data);
        setArticles(Array.isArray(data) ? data : []);
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
    // 配列が空かどうかをチェックし、取得した値を使用して、現在のページに表示する記事の範囲を計算
    if (!articles.length) return [];
    // 現在のページ番号(currentPage)と1ページあたりの表示件数(articlesPerPage)をpagination状態から取得
    const { currentPage, articlesPerPage } = pagination;
    // 現在のページの最後の記事のインデックスを示します（ページ番号×表示件数）
    const indexOfLastArticle = currentPage * articlesPerPage;
    // 現在のページの最初の記事のインデックスを示します（最後の記事のインデックス - 表示件数）
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    // 最後に、articles.sliceメソッドを使用して、計算された範囲の記事だけを抽出して返します。
    // この方法により、バックエンドから取得したすべての記事から、現在のページに表示すべき部分だけを効率的に選択できます。
    return articles.slice(indexOfFirstArticle, indexOfLastArticle);
  };

  // ページ変更ハンドラ
  const handlePageChange = (pageNumber: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  };

  // クライアントサイドでのみ利用されるページネーション表示
  const paginationControls = () => {
    if (!clientSideRendered || articles.length === 0) return null;
    return (
      <div className="flex justify-center mt-8">
        <ul className="flex">
          {Array.from({ length: Math.ceil(articles.length / pagination.articlesPerPage) }).map((_, index) => (
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
    );
  };

  return (
    <div className="bg-gray-500 container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">記事を読み込み中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {clientSideRendered && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getCurrentPageArticles().map((article, index) => (
                <div key={article.id || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                      <Link href={`/articles/${article.id}`} className="hover:text-blue-600">
                        {article.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3">{article.body?.substring(0, 150)}...</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">投稿者ID: {article.user_id}</span>
                      <Link
                        href={article.id ? `/articles/${article.id}` : '#'}
                        className={`inline-block ${!article.id ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-200'} bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded`}
                        onClick={(e) => {
                          if (!article.id) {
                            e.preventDefault();
                            console.warn('記事IDが存在しません');
                          }
                        }}
                      >
                        続きを読む
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {paginationControls()}
        </>
      )}
    </div>
  );
};

export default DemoBody;

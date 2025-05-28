"use client";

import { FC, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Article {
  article_id: number;
  title: string;
  body_html: string;
}

const ArticleDetailPage: FC = () => {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
      const response = await fetch(`${API_URL}/public/articles/${params.id}`);
      
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
      setError('記事の取得に失敗しました。しばらく後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchArticle();
    }
  }, [params.id, fetchArticle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-center py-8">
            <p className="text-gray-600">記事を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 404エラーの場合
  if (notFound) {
    return (
      <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-center py-16">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-gray-300">404</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              記事が見つかりません
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              お探しの記事は削除されたか、URLが間違っている可能性があります。
            </p>
            <div className="space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ← ホームに戻る
              </Link>
              <button
                onClick={fetchArticle}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-center py-16">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-red-300">エラー</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              記事の読み込みに失敗しました
            </h2>
            <p className="text-red-500 mb-8 max-w-md mx-auto">{error}</p>
            <div className="space-x-4">
              <Link
                href="/demo"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ← ホームに戻る
              </Link>
              <button
                onClick={fetchArticle}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>
        
        <article className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article?.title}
            </h1>
            <div className="text-sm text-gray-500">
              記事ID: {article?.article_id}
            </div>
          </header>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article?.body_html || '' }}
          />
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

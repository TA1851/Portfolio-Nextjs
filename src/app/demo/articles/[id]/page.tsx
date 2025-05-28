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

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
      const response = await fetch(`${API_URL}/public/articles/${params.id}`);
      
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

  if (error) {
    return (
      <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              href="/demo"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">記事が見つかりませんでした。</p>
            <Link
              href="/demo"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ホームに戻る
            </Link>
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
            href="/demo"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>
        
        <article className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            <div className="text-sm text-gray-500">
              記事ID: {article.article_id}
            </div>
          </header>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

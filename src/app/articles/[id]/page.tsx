'use client';

import { FC, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

const ArticleDetailPage: FC = () => {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const articleId = params.id;
        if (!articleId) {
          setError('記事IDが見つかりません');
          setLoading(false);
          return;
        }

        // ローカルストレージからトークンを取得
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }

        // APIから記事詳細を取得
        const response = await fetch(`http://127.0.0.1:8000/api/v1/articles/${articleId}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('記事が見つかりません');
          } else {
            throw new Error(`APIエラー: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('APIから取得した記事データ:', data);
        setArticle(data);
      } catch (err) {
        console.error('記事詳細の取得に失敗しました', err);
        setError('記事の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent align-[-0.125em]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-4 text-gray-600">記事を読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <Link href="/demopage" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
              記事一覧に戻る
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{article.title}</h1>
            
            <div className="text-sm text-gray-500 mb-8">
              {article.created_at && (
                <p>投稿日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</p>
              )}
              <p className="text-gray-800">投稿者ID: {article.user_id}</p>
            </div>
            
            <div className="prose prose-lg max-w-none">
              {article.body ? (
                // 改行がある場合は分割して表示、ない場合はそのまま表示
                article.body.includes('\n') ? (
                  article.body.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))
                ) : (
                  <p className="mb-4 text-gray-800">{article.body}</p>
                )
              ) : (
                <p className="text-gray-500 italic">この記事には本文がありません。</p>
              )}
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <Link href="/demopage" className="text-indigo-600 hover:text-indigo-800">
                記事一覧に戻る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
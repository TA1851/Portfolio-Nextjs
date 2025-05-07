'use client';

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from 'next/navigation';

// 記事詳細の型定義
interface ArticleDetail {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

const ArticleDetailPage: FC = () => {
  const params = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 記事データの取得
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // 1. パラメータ取得をさらに詳細にデバッグ
        console.log('パラメータ全体:', params);
        console.log('params.id の値:', params.id, '型:', typeof params.id);

        // 2. ルートパラメータの取得方法を変更
        const { id } = params;
        console.log('分割代入で取得したID:', id, '型:', typeof id);

        // 3. 条件チェックを修正
        if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
          console.error('無効な記事ID:', id);
          setError('無効な記事IDです');
          setLoading(false);
          return;
        }

        const articleId = String(id);

        // 数値かどうか確認（APIが数値IDを期待している場合）
        if (isNaN(Number(articleId))) {
          console.error('数値ではない記事ID:', articleId);
          setError('無効な記事IDフォーマットです');
          setLoading(false);
          return;
        }

        // トークンの取得
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }

        // 記事データの取得
        console.log(`記事ID: ${articleId} の詳細を取得します`);
        const response = await fetch(`http://127.0.0.1:8000/api/v1/articles/${articleId}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });

        // エラーハンドリング
        if (!response.ok) {
          if (response.status === 404) {
            setError('記事が見つかりません');
          } else if (response.status === 422) {
            // エラーの詳細を取得
            const errorData = await response.text();
            console.error('APIエラー詳細:', errorData);
            setError('記事の取得に失敗しました（無効なID形式）');
          } else {
            throw new Error(`APIエラー: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        // 正常なレスポンスの処理
        const data = await response.json();
        console.log('取得した記事詳細:', data);
        setArticle(data);
        setLoading(false);
      } catch (err) {
        console.error('記事詳細の取得に失敗:', err);
        setError('記事詳細の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">記事を読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <Link href="/demopage" className="inline-block mt-4 text-indigo-600 hover:text-indigo-800">
              記事一覧に戻る
            </Link>
          </div>
        ) : article ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            
            <div className="mb-6 text-sm text-gray-500 flex justify-between">
              <span>投稿者ID: {article.user_id}</span>
              {article.created_at && (
                <span>投稿日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
              )}
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
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">記事情報が取得できませんでした</p>
            <Link href="/demopage" className="inline-block mt-4 text-indigo-600 hover:text-indigo-800">
              記事一覧に戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
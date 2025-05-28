'use client';

import { FC, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// 記事詳細の型定義
interface ArticleDetail {
  title: string;
  body: string;
  user_id: number;
  article_id: number;
}

// 記事詳細ページのコンポーネント
const ArticleDetailPage: FC = () => {
  const params = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('パラメータ:', params);
        const id = params.id;
        console.log('URLから取得したID:', id, '型:', typeof id);

        if (!id) {
          console.error('無効な記事ID:', id);
          setError('無効な記事IDです');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }

        console.log(`記事ID: ${id} の詳細を取得します`);
        // 環境変数からAPIのURLを取得
        const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
        const response = await fetch(
          `${apiUrl}/articles/${id}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('記事が見つかりません');
          } else if (response.status === 422) {
            const errorText = await response.text();
            console.error('APIエラー詳細:', errorText);
            setError('記事の取得に失敗しました（無効なID形式）');
          } else {
            throw new Error(`APIエラー: ${response.status}`);
          }
          setLoading(false);
          return;
        }

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
  }, [params]);

  return (
    <div className="
      bg-gray-100 min-h-screen
      py-8 px-4"
    >
    <div className="
      max-w-4xl mx-auto"
    >
      {loading ? (
        <div className="
          text-center py-10"
        >
          <p className="
            text-gray-600
          ">
            記事を読み込み中...
          </p>
        </div>
      ) : error ? (
        <div className="
          text-center py-10"
        >
          <p className="
          text-red-500"
          >
            {error}
          </p>
          <Link href="/demo"
          className="
            inline-block mt-4
            text-indigo-600
            hover:text-indigo-800"
          >
            記事一覧に戻る
          </Link>
        </div>
      ) : article ? (
        <div className="
          bg-white rounded-lg
          shadow-md p-6"
        >
        <h1 className="
          text-3xl
          font-bold mb-4"
        >
          {article.title}
        </h1>
        <div className="
          mb-6 text-sm
          text-gray-500"
        >
          <span>
            投稿者ID: {article.user_id}
          </span>
        </div>
        <div className="
          prose prose-lg
          max-w-none"
        >
        {article.body ? (
          <p className="
            mb-4 text-gray-800 whitespace-pre-line"
          >
            {article.body}
          </p>
        ) : (
          <p className="
            text-gray-500 italic"
          >
            この記事には本文がありません。
          </p>
        )}
        </div>
        <div className="
          mt-10 pt-6
          border-t
          border-gray-200"
        >
          <Link href="/user"
            className="
              text-indigo-600
              hover:text-indigo-800"
          >
            記事一覧に戻る
          </Link>
        </div>
      </div>
      ) : (
        <div className="
          text-center py-10"
        >
          <p className="
            text-gray-600
          ">
            記事情報が取得できませんでした
          </p>
          <Link
            href="/user"
            className="
              inline-block mt-4
              text-indigo-600
              hover:text-indigo-800"
          >
            記事一覧に戻る
          </Link>
        </div>
      )}
    </div>
  </div>
  );
};
export default ArticleDetailPage;
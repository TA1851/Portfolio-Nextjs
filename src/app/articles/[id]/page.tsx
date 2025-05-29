'use client';

import { FC, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";

// markedの設定
marked.setOptions({
  breaks: true, // 改行を<br>に変換
  gfm: true,    // GitHub Flavored Markdownを有効
});

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
          prose prose-lg prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mb-4
          prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-8
          prose-h3:text-xl prose-h3:font-bold prose-h3:mb-2 prose-h3:mt-6
          prose-h4:text-lg prose-h4:font-bold prose-h4:mb-2 prose-h4:mt-4
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
          prose-strong:font-bold prose-strong:text-gray-900
          prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline
          prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:!bg-gray-900 prose-pre:!text-gray-100 prose-pre:!p-4 prose-pre:!rounded-lg prose-pre:!overflow-x-auto prose-pre:!my-6
          prose-pre>code:!bg-transparent prose-pre>code:!text-gray-100 prose-pre>code:!p-0
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
          prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
          prose-li:text-gray-700 prose-li:mb-1
          prose-table:border-collapse prose-table:w-full
          prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-2 prose-th:text-left
          prose-td:border prose-td:border-gray-300 prose-td:p-2
          markdown-content article-content"
        >
        {article.body ? (
          <div 
            className="mb-4 article-content"
            dangerouslySetInnerHTML={{ 
              __html: (() => {
                const htmlContent = marked(article.body);
                console.log('Original markdown:', article.body);
                console.log('Converted HTML:', htmlContent);
                return htmlContent;
              })()
            }}
          />
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
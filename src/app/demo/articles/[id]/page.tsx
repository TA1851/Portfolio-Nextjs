"use client";

import { FC, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { marked } from "marked";

// markedの設定
marked.setOptions({
  breaks: true, // 改行を<br>に変換
  gfm: true,    // GitHub Flavored Markdownを有効
});

interface Article {
  article_id: number;
  title: string;
  body_html: string;
  body?: string; // マークダウン形式のボディも対応
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
      console.log('環境変数 API_URL:', API_URL);
      const url = `${API_URL}/public/articles/${params.id}`;
      console.log('記事詳細リクエスト URL:', url);
      console.log('記事ID:', params.id);
      console.log('paramsオブジェクト全体:', params);
      
      const response = await fetch(url);
      console.log('レスポンスステータス:', response.status);
      
      if (response.status === 404) {
        console.log('記事が見つかりません (404)');
        setNotFound(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('取得した記事詳細:', data);
      console.log('記事データの構造:');
      console.log('- title:', data.title);
      console.log('- body:', data.body);
      console.log('- body_html:', data.body_html);
      console.log('- body type:', typeof data.body);
      console.log('- body_html type:', typeof data.body_html);
      setArticle(data);
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
      setError('記事の取得に失敗しました。しばらく後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [params]);

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
            className="prose prose-lg prose-gray max-w-none
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
              prose-td:border prose-td:border-gray-300 prose-td:p-2"
          >
            {(() => {
              console.log('=== 記事のレンダリング判断 ===');
              console.log('article?.body:', article?.body);
              console.log('article?.body_html:', article?.body_html);
              console.log('bodyの型:', typeof article?.body);
              console.log('body_htmlの型:', typeof article?.body_html);
              console.log('bodyの長さ:', article?.body?.length);
              console.log('body_htmlの長さ:', article?.body_html?.length);
              
              // body_htmlの内容をチェック（先頭100文字）
              if (article?.body_html) {
                console.log('body_html先頭100文字:', article.body_html.substring(0, 100));
                console.log('body_htmlがコードタグで囲まれているか:', article.body_html.startsWith('<code>'));
                console.log('body_htmlがpreタグで囲まれているか:', article.body_html.includes('<pre>'));
              }
              
              // bodyフィールドが存在し、かつ有効な文字列の場合はマークダウンとして処理
              if (article?.body && typeof article.body === 'string' && article.body.trim().length > 0) {
                console.log('マークダウンとして処理します');
                const markdownResult = marked.parse ? marked.parse(article.body) : marked(article.body);
                const htmlContent = typeof markdownResult === 'string' ? markdownResult : String(markdownResult);
                console.log('変換後のHTML:', htmlContent);
                return (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlContent
                    }}
                  />
                );
              } 
              // body_htmlが存在する場合
              else if (article?.body_html && typeof article.body_html === 'string') {
                console.log('HTMLとして処理します');
                let content = article.body_html;
                
                // コンテンツの形式を分析
                const isWrappedInSingleCode = content.match(/^<code[^>]*>([\s\S]*)<\/code>$/) && !content.includes('</code><code>');
                const isWrappedInPre = content.match(/^<pre[^>]*>([\s\S]*)<\/pre>$/);
                
                if (isWrappedInSingleCode) {
                  console.log('単一のコードタグで全体が囲まれているため、内容を抽出してマークダウンとして処理します');
                  const innerContent = content.replace(/^<code[^>]*>/, '').replace(/<\/code>$/, '');
                  
                  try {
                    // markedは同期的に動作するように設定されているため、直接使用
                    const markdownResult = marked.parse ? marked.parse(innerContent) : marked(innerContent);
                    content = typeof markdownResult === 'string' ? markdownResult : String(markdownResult);
                    console.log('マークダウンとして再解析しました:', content.substring(0, 100));
                  } catch (error) {
                    console.log('マークダウン解析に失敗、プレーンテキストとして表示', error);
                    content = `<div style="white-space: pre-wrap; font-family: inherit;">${innerContent}</div>`;
                  }
                } else if (isWrappedInPre) {
                  console.log('preタグで囲まれています');
                  // preタグの場合はそのまま使用
                } else {
                  console.log('通常のHTMLとして処理します');
                }
                
                return (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                );
              } 
              // どちらも無効な場合
              else {
                console.log('有効なコンテンツが見つかりません');
                return (
                  <p className="text-gray-500 italic">
                    この記事には表示可能な内容がありません。
                  </p>
                );
              }
            })()}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

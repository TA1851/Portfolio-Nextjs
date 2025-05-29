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

// コンテンツ処理ヘルパー関数
const processArticleContent = (article: Article): string => {
  // bodyフィールドが存在し、かつ有効な文字列の場合はマークダウンとして処理
  if (article?.body && typeof article.body === 'string' && article.body.trim().length > 0) {
    const markdownResult = marked.parse ? marked.parse(article.body) : marked(article.body);
    return typeof markdownResult === 'string' ? markdownResult : String(markdownResult);
  } 
  
  // body_htmlが存在する場合
  if (article?.body_html && typeof article.body_html === 'string') {
    let content = article.body_html;
    
    // 1. まず<br />タグを改行文字に変換
    content = content.replace(/<br\s*\/?>/gi, '\n');
    
    // 2. コードブロック記法を含むp要素を検出して変換
    content = content.replace(/<p>```<\/p>/g, '\n```\n');
    content = content.replace(/<p>```([^<]*)<\/p>/g, '\n```$1\n```\n');
    
    // 3. マークダウンコンテンツがcodeタグ内に埋め込まれているかチェック
    const codeMatches = content.match(/<code[^>]*>([\s\S]*?)<\/code>/g);
    
    if (codeMatches && codeMatches.length > 0) {
      // 各codeタグの内容を抽出してマークダウンとして処理
      codeMatches.forEach(codeMatch => {
        const innerContent = codeMatch.replace(/<\/?code[^>]*>/g, '');
        
        // マークダウンパターンを検出（#, **, *, -, [, etc.）
        if (innerContent.includes('#') || innerContent.includes('**') || 
            innerContent.includes('*') || innerContent.includes('-') ||
            innerContent.includes('[') || innerContent.includes('```') ||
            innerContent.includes('\n')) {
          try {
            const markdownResult = marked.parse ? marked.parse(innerContent) : marked(innerContent);
            const processedContent = typeof markdownResult === 'string' ? markdownResult : String(markdownResult);
            content = content.replace(codeMatch, processedContent);
          } catch {
            // マークダウン処理に失敗した場合はプレーンテキストとして表示
            content = content.replace(codeMatch, `<div style="white-space: pre-wrap;">${innerContent}</div>`);
          }
        }
      });
    }
    
    // 4. p要素内に混在するコードブロック記法を検出・処理
    content = content.replace(/<p>([\s\S]*?)```([\s\S]*?)```([\s\S]*?)<\/p>/g, (match, before, codeContent, after) => {
      const beforeProcessed = before.trim() ? `<p>${before.trim()}</p>` : '';
      const afterProcessed = after.trim() ? `<p>${after.trim()}</p>` : '';
      const codeProcessed = `<pre><code>${codeContent}</code></pre>`;
      return beforeProcessed + codeProcessed + afterProcessed;
    });
    
    // 5. 残りの混在マークダウンパターンを処理
    // p要素内の複数行テキストでマークダウン記法が含まれている場合
    content = content.replace(/<p>([\s\S]*?)<\/p>/g, (match, innerText) => {
      // マークダウンパターンが含まれているかチェック
      if (innerText.includes('**') || innerText.includes('*') || 
          innerText.includes('#') || innerText.includes('-') || 
          innerText.includes('[') || innerText.includes('\n')) {
        try {
          const markdownResult = marked.parse ? marked.parse(innerText) : marked(innerText);
          return typeof markdownResult === 'string' ? markdownResult : String(markdownResult);
        } catch {
          return match; // 変換に失敗した場合は元のHTMLを返す
        }
      }
      return match; // マークダウンパターンがない場合は元のHTMLを返す
    });
    
    return content;
  }
  
  return '<p class="text-gray-500 italic">この記事には表示可能な内容がありません。</p>';
};

const ArticleDetailPage: FC = () => {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  // コンポーネントマウント時にdata属性を設定
  useEffect(() => {
    document.body.setAttribute('data-page', 'demo');
    
    // クリーンアップ関数でdata属性を削除
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;
      const url = `${API_URL}/public/articles/${params.id}`;
      
      const response = await fetch(url);
      
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 開発環境でのみログ出力
      if (process.env.NODE_ENV === 'development') {
        console.log('取得した記事詳細:', data);
        console.log('記事データの構造:');
        console.log('- title:', data.title);
        console.log('- body:', data.body);
        console.log('- body_html:', data.body_html);
        console.log('- body type:', typeof data.body);
        console.log('- body_html type:', typeof data.body_html);
      }
      
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
            className="prose prose-lg prose-gray max-w-none"
            dangerouslySetInnerHTML={{
              __html: article ? processArticleContent(article) : ''
            }}
          />
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

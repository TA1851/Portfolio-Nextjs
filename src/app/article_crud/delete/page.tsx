"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// 記事の型定義
interface Article {
  article_id: number;  // バックエンドのAPIに合わせて修正
  id?: number;         // 互換性のために残す
  title: string;
  body: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

const API_URL = "http://127.0.0.1:8000/api/v1/articles";

export default function DeleteArticlePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const authAxios = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    // タイムアウト設定
    timeout: 10000, 
    // CORS関連の設定
    withCredentials: false,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  // 認証状態を確認する関数
  const checkAuthentication = async () => {
    const storedToken = localStorage.getItem("authToken");
    
    // トークン存在チェック
    if (!storedToken) {
      console.warn("認証トークンがありません。ログイン画面にリダイレクトします。");
      router.push("/login");
      return false;
    }
    
    // トークンの有効性を簡易チェック
    if (storedToken === 'undefined' || storedToken === 'null') {
      console.warn("不正なトークン形式です。ログイン画面にリダイレクトします。");
      localStorage.removeItem("authToken");
      router.push("/login");
      return false;
    }
    
    setToken(storedToken);
    return true;
  };

  // リクエストインターセプターの設定
  const setupInterceptors = (storedToken: string) => {
    // リクエストインターセプター
    const requestInterceptor = authAxios.interceptors.request.use(
      (config) => {
        // リクエスト直前に最新のトークンを使用
        const currentToken = localStorage.getItem("authToken") || storedToken;
        
        if (currentToken) {
          console.log("リクエスト送信: トークンあり");
          config.headers["Authorization"] = `Bearer ${currentToken.trim()}`;
        } else {
          console.warn("リクエスト送信: トークンなし");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  
    // レスポンスインターセプター
    const responseInterceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // オリジナルリクエストの参照を保存
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log("401エラー検出: トークンリフレッシュを試行");
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            console.log("トークンリフレッシュ成功");
            
            // 新しいトークンでリクエストを再試行
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return authAxios(originalRequest);
          } catch (refreshError) {
            console.error("リフレッシュ失敗:", refreshError);
            
            // ログイン画面へリダイレクト
            router.push("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  
    return { requestInterceptor, responseInterceptor };
  };

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    const initPage = async () => {
      const storedToken = localStorage.getItem("authToken");
      
      // トークン存在チェック
      if (!storedToken) {
        console.warn("認証トークンがありません。ログイン画面にリダイレクトします。");
        router.push("/login");
        return;
      }
      
      setToken(storedToken);
      
      // インターセプターを設定
      const interceptors = setupInterceptors(storedToken);
      
      try {
        // 記事データ取得
        await fetchArticles();
      } catch (error) {
        console.error("初期化中にエラーが発生しました:", error);
      }
      
      // クリーンアップ関数
      return () => {
        authAxios.interceptors.request.eject(interceptors.requestInterceptor);
        authAxios.interceptors.response.eject(interceptors.responseInterceptor);
      };
    };
    
    initPage();
  }, []); // 空の依存配列

  // トークンリフレッシュ関数 - FastAPI仕様に合わせて修正
  const refreshToken = async () => {
    try {
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      // リフレッシュAPIの形式に合わせて修正
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/refresh",
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        }
      );

      // 応答からアクセストークンを取得
      const newToken = response.data.access_token;
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error("トークンのリフレッシュに失敗しました:", error);
      router.push("/login");
      throw error;
    }
  };

  // 記事の取得
  const fetchArticles = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("記事データ取得開始");
      
      // 認証トークンの状態を確認
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) {
        console.error("認証トークンがありません");
        throw new Error("認証情報がありません。再度ログインしてください。");
      }
      
      // 明示的にトークンをヘッダーに設定（インターセプターとは別に）
      const response = await authAxios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${currentToken.trim()}`
        }
      });
      
      console.log("記事データ取得成功:", response.status);
      
      if (Array.isArray(response.data)) {
        console.log(`${response.data.length}件の記事を取得しました`);
        setArticles(response.data);
      } else {
        console.warn("APIレスポンスが配列ではありません:", response.data);
        setArticles([]);
      }
      
      setError("");
    } catch (error: any) {
      console.error("記事の取得中にエラーが発生しました:", error);
      
      // エラーメッセージを詳細化
      if (error.response?.status === 401) {
        setError("認証が無効です。再度ログインしてください。");
        // 1秒後にログイン画面へリダイレクト
        setTimeout(() => router.push("/login"), 1000);
      } else {
        setError(`記事の取得に失敗しました: ${error.message || "不明なエラー"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 記事リスト更新用のヘルパー関数
  const updateArticlesList = (deletedId: number) => {
    setArticles(articles.filter(article => {
      const currentId = article.article_id ?? article.id;
      return currentId !== deletedId;
    }));
    
    alert("記事が正常に削除されました");
  };

  // 記事の削除 - APIドキュメントに基づいた正確な実装
  const handleDelete = async (articleId: number) => {
    if (!articleId) {
      console.error("削除対象の記事IDが不正です:", articleId);
      setError("削除対象の記事IDが不正です。");
      return;
    }

    if (!confirm("この記事を削除してもよろしいですか？")) {
      return;
    }
    
    try {
      console.log(`記事ID ${articleId} の削除を開始します`);
      
      // APIドキュメントに従った正しいURL形式:
      // DELETEメソッドで/api/v1/articlesにアクセスし、クエリパラメータとしてarticle_idを指定
      const deleteUrl = `${API_URL}?article_id=${articleId}`;
      console.log("正しい削除URL:", deleteUrl);
      
      const response = await authAxios.delete(deleteUrl);
      console.log("削除成功:", response.status, response.data);
      
      updateArticlesList(articleId);
    } catch (error: any) {
      console.error("記事の削除中にエラーが発生しました:", error);
      
      if (error.response) {
        console.error("エラーステータス:", error.response.status);
        console.error("エラーデータ:", error.response.data);
        
        // 特定のエラーケースに対する処理
        if (error.response.status === 404) {
          setError("削除対象の記事が見つかりません。すでに削除された可能性があります。");
        } else if (error.response.status === 403) {
          setError("この記事を削除する権限がありません。");
        } else {
          setError(`記事の削除に失敗しました (${error.response.status}): ${error.response.data?.detail || ''}`);
        }
      } else {
        setError("記事の削除に失敗しました。ネットワーク接続を確認してください。");
      }
    }
  };

  // クライアント側でのリロードを行うボタン
  const handleRetry = () => {
    // 再試行前に認証チェック
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      alert("認証情報がありません。ログイン画面に移動します。");
      router.push("/login");
      return;
    }
    
    setError("");
    fetchArticles();
  };

  if (loading) {
    return <div className="p-4">記事を読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={handleRetry}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">記事の削除</h1>
      
      {articles.length === 0 ? (
        <p>記事が見つかりません。</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => {
            // article_idとidの両方を考慮して確実にIDを取得
            const articleId = article.article_id ?? article.id;
            
            // IDが存在しない場合はスキップ
            if (!articleId) {
              console.warn("IDのない記事:", article);
              return null;
            }
            
            return (
              <li key={articleId} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{article.title}</h2>
                    <p className="text-gray-600">
                      {article.body ? article.body.substring(0, 100) + "..." : "本文なし"}
                    </p>
                    <small className="text-gray-500">
                      記事ID: {articleId} | 投稿者ID: {article.user_id}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDelete(articleId)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
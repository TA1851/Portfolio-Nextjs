"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import * as React from 'react';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// 記事の型定義
interface Article {
  article_id: number;
  id?: number;
  title: string;
  body: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// 環境変数からAPI_URLを取得
const API_URL = process.env.NEXT_PUBLIC_API_URL_V1;

export default function DeleteArticlePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const router = useRouter();

  // authAxiosインスタンスを作成
  const authAxios = React.useMemo(() => axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: false,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }), []);

  // 認証状態を確認する関数
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem("authToken");

    if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
      console.warn("認証トークンがありません。ログイン画面にリダイレクトします。");
      localStorage.removeItem("authToken");
      router.push("/login");
      return false;
    }

    return true;
  }, [router]);

  // トークンリフレッシュ関数
  const refreshToken = useCallback(async (): Promise<string> => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      throw new Error("認証トークンが見つかりません");
    }

    const response = await authAxios.post(
      '/refresh',
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken.trim()}`
        }
      }
    );

    const newToken = response.data.access_token;
    localStorage.setItem("authToken", newToken);
    return newToken;
  }, [authAxios]);

  // 記事の取得
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) {
        console.error("認証トークンがありません");
        throw new Error("認証情報がありません。再度ログインしてください。");
      }

      const response = await authAxios.get('/articles');

      if (Array.isArray(response.data)) {
        setArticles(response.data);
      } else {
        console.warn("APIレスポンスが配列ではありません:", response.data);
        setArticles([]);
      }

      setError("");
    } catch (error: unknown) {
      console.error("記事の取得中にエラーが発生しました:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError("認証が無効です。再度ログインしてください。");
        setTimeout(() => router.push("/login"), 1000);
      } else {
        const errorMessage = axios.isAxiosError(error) ? error.message :
        error instanceof Error ? error.message : "不明なエラー";
        setError(`記事の取得に失敗しました: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [authAxios, router]);

  // インターセプターの設定
  useEffect(() => {
    const requestInterceptor = authAxios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("authToken");
        if (currentToken) {
          config.headers["Authorization"] = `Bearer ${currentToken.trim()}`;
        } else {
          console.warn("リクエスト送信: トークンなし");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshToken();
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return authAxios(originalRequest);
          } catch (refreshError) {
            console.error("リフレッシュ失敗:", refreshError);
            router.push("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authAxios.interceptors.request.eject(requestInterceptor);
      authAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [authAxios, refreshToken, router]);

  // 初期化
  useEffect(() => {
    const initPage = async () => {
      const isAuthenticated = await checkAuthentication();
      if (isAuthenticated) {
        await fetchArticles();
      }
    };

    initPage();
  }, [checkAuthentication, fetchArticles]);

  // サーバーヘルスチェック
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await authAxios.get('/api/health', { 
          timeout: 5000,
          validateStatus: () => true 
        });
        
        if (response.status === 200) {
          console.log("API健全性確認: 正常", response.status);
        } else {
          console.info("API健全性確認: 応答あり", response.status);
        }
      } catch {
        console.info("API健全性確認: 接続できません - アプリは引き続き動作します");
      }
    };
    
    const timer = setTimeout(checkApiHealth, 1000);
    return () => clearTimeout(timer);
  }, [authAxios]);

  // 記事リスト更新用のヘルパー関数
  const updateArticlesList = useCallback((deletedId: number) => {
    setArticles(prevArticles => prevArticles.filter(article => {
      const currentId = article.article_id ?? article.id;
      return currentId !== deletedId;
    }));
  }, []);

  // 記事の削除
  const handleDelete = useCallback(async (articleId: number) => {
    if (!articleId) {
      console.error("削除対象の記事IDが不正です:", articleId);
      setError("削除対象の記事IDが不正です。");
      return;
    }

    setLoading(true);
    
    let retryCount = 0;
    const maxRetries = 2;

    const attemptDelete = async (): Promise<AxiosResponse> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("インターネット接続がありません。ネットワーク接続を確認してください。");
      }

      console.log(`記事ID ${articleId} の削除を開始します (試行: ${retryCount + 1}/${maxRetries + 1})`);
      
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) {
        throw new Error("認証情報がありません。再度ログインしてください。");
      }

      try {
        return await authAxios({
          method: 'DELETE',
          url: `/articles?article_id=${articleId}`,
          timeout: 15000,
          validateStatus: function (status) {
            // 200, 204, 404を成功として扱う（削除操作として妥当）
            return status === 200 || status === 204 || status === 404;
          },
        });
      } catch (error: unknown) {
        if ((axios.isAxiosError(error) && !error.response) || 
            (error instanceof Error && error.message.includes('ECONNABORTED'))) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`ネットワークエラー、${retryCount}回目のリトライを試みます...`);
            const delay = retryCount * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptDelete();
          }
        }
        throw error;
      }
    };

    try {
      const response = await attemptDelete();
      console.log("削除成功:", response.status, response.data);

      updateArticlesList(articleId);
      alert("記事が正常に削除されました");
      
    } catch (error: unknown) {
      console.error("記事の削除中にエラーが発生しました:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError("リクエストがタイムアウトしました。後でもう一度お試しください。");
        } else if (!error.response) {
          setError("ネットワークエラー: サーバーに接続できません。インターネット接続を確認してください。");
        } else if (error.response.status === 404) {
          setError("削除対象の記事が見つかりません。すでに削除された可能性があります。");
        } else if (error.response.status === 403) {
          setError("この記事を削除する権限がありません。");
        } else if (error.response.status === 401) {
          setError("認証が無効です。再度ログインしてください。");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(
            `記事の削除に失敗しました (${error.response.status}): 
            ${error.response.data?.detail || JSON.stringify(error.response.data) || '不明なエラー'}`
          );
        }
      } else if (error instanceof Error) {
        setError(`エラー: ${error.message || "不明なエラー"}`);
      } else {
        setError(`不明なエラー: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [authAxios, router, updateArticlesList]);

  const handleRetry = useCallback(() => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      alert("認証情報がありません。ログイン画面に移動します。");
      router.push("/login");
      return;
    }

    setError("");
    fetchArticles();
  }, [router, fetchArticles]);

  const handleClickOpen = useCallback((articleId: number) => {
    setCurrentArticleId(articleId);
    setOpenDialog(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (currentArticleId !== null) {
      await handleDelete(currentArticleId);
      setOpenDialog(false);
    }
  }, [currentArticleId, handleDelete]);

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">記事の削除</h1>
      </div>
      {articles.length === 0 ? (
        <div className="text-center py-8">
          <p>記事が見つかりません。</p>
          <button
            onClick={() => router.push('/user')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            会員専用ページに戻る
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {articles.map((article) => {
              const articleId = article.article_id ?? article.id;
              if (!articleId) {
                console.warn("IDのない記事:", article);
                return null;
              }
              return (
                <li key={articleId} className="border p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {article.title || "無題"}
                      </h2>
                      <p className="text-gray-600">
                        {article.body ? article.body.substring(0, 100) + "..." : "本文なし"}
                      </p>
                      <small className="text-gray-500">
                        記事ID: {articleId} | 投稿者ID: {article.user_id}
                      </small>
                    </div>
                    <div className="ml-3">
                      <IconButton
                        aria-label="delete"
                        color="primary"
                        onClick={() => handleClickOpen(articleId)}
                        sx={{
                          width: { xs: '34px', sm: '40px' },
                          height: { xs: '34px', sm: '40px' },
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: theme => theme.palette.error.main,
                            transition: 'color 0.2s ease-in-out',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-center mt-8">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push('/user')}
              sx={{
                width: '170px',
                height: '40px',
                fontSize: '0.85rem',
                padding: '6px 12px',
                borderWidth: '2px',
              }}
            >
              会員専用ページに戻る
            </Button>
          </div>
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"記事の削除確認"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この記事を本当に削除してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s',
              },
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "削除中..." : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
'use client';

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";

// 記事データの型定義
interface Article {
  title: string;
  body: string;
  user_id: number;
  id?: number; // バックエンドから返されなければフロントで生成する可能性を考慮
}

const DemoBody: FC = () => {
  // 状態管理
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articlesPerPage] = useState<number>(5); // 1ページあたりの表示件数
  const [totalPages, setTotalPages] = useState<number>(1); // 総ページ数

  // useRefを活用した補助的な参照
  const isMountedRef = useRef<boolean>(true);           // コンポーネントのマウント状態を追跡
  const abortControllerRef = useRef<AbortController | null>(null); // APIリクエストの制御用
  const cachedArticlesRef = useRef<Article[]>([]);      // 記事データのキャッシュ
  const lastFetchTimeRef = useRef<number>(0);           // 最後のデータ取得時刻

  // 初期データロード
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }
        
        // 初期データロード（簡略化したバージョン）
        const response = await fetch(`http://127.0.0.1:8000/api/v1/articles?page=1&limit=${articlesPerPage}`, {
          headers: { 'Authorization': `Bearer ${token.trim()}` }
        });
        
        if (!response.ok) {
          throw new Error(`初期ロードエラー: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('初期ロードエラー:', error);
        setError('データの初期ロードに失敗しました。');
        setLoading(false);
      }
    };
    
    initialLoad();
  }, []); // 空の依存配列で初回マウント時のみ実行

  // コンポーネントマウント時に記事を取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // 重複リクエスト防止: 前回のリクエストをキャンセル
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // 新しいAbortControllerを作成
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // キャッシュ戦略: 30秒以内に取得したデータがあれば再利用
        const now = Date.now();
        if (cachedArticlesRef.current.length > 0 && now - lastFetchTimeRef.current < 30000) {
          console.log('キャッシュされた記事データを使用します');
          setArticles(cachedArticlesRef.current);
          setLoading(false);
          return;
        }

        // ローカルストレージからトークンを取得
        const token = localStorage.getItem('authToken');
        console.log('認証トークン:', token); // デバッグ用
        
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }

        // APIリクエストの前にログを追加
        console.log('APIリクエスト開始:', new Date().toISOString());

        // タイムアウト処理の追加
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('APIリクエストがタイムアウトしました')), 10000)
        );

        try {
          console.time('API処理');
          // Promise.raceでタイムアウトを実装
          const response = await Promise.race([
            fetch(`http://127.0.0.1:8000/api/v1/articles?page=${currentPage}&limit=${articlesPerPage}`, {
              headers: {
                'Authorization': `Bearer ${token.trim()}`
              },
              signal
            }),
            timeoutPromise
          ]) as Response;
          console.timeLog('API処理', 'レスポンス取得');

          // レスポンスの詳細を確認
          console.log('API応答ステータス:', response.status);
          console.log('API応答ヘッダー:', Object.fromEntries(response.headers.entries()));

          // レスポンスボディも確認
          const data = await response.json();
          console.log('API応答データ構造:', JSON.stringify(data));
          console.timeEnd('API処理');
          console.log('API応答データ:', data);
          
          if (response.status === 401) {
            // 401エラーの場合は認証切れとしてトークンを削除
            localStorage.removeItem('authToken');
            setError('認証の有効期限が切れました。再度ログインしてください。');
            setLoading(false);
            return;
          }
          
          if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
          }

          // APIから取得したデータを処理
          // コンポーネントがマウントされていることを確認してから状態を更新
          if (isMountedRef.current) {
            // APIレスポンスが配列形式の場合
            if (Array.isArray(data)) {
              // データをキャッシュと状態の両方に保存
              cachedArticlesRef.current = data;
              lastFetchTimeRef.current = Date.now();
              
              // ページネーションの計算
              setArticles(data);
              setTotalPages(Math.ceil(data.length / articlesPerPage));
            } 
            // APIレスポンスがオブジェクト形式で、itemsプロパティがある場合
            else if (data && typeof data === 'object' && 'items' in data) {
              setArticles(data.items);
              setTotalPages(data.total_pages || Math.ceil(data.items.length / articlesPerPage));
            }
            // 予期しないデータ形式の場合
            else {
              setArticles([]);
              setError('予期しないデータ形式を受信しました');
            }
            setLoading(false);
          }
        } catch (err) {
          // AbortError（リクエストのキャンセル）は正常な動作なのでエラーとして扱わない
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('リクエストがキャンセルされました');
            return;
          }
          
          // エラーの詳細を出力
          console.error('記事の取得に失敗しました', err);
          
          // エラーオブジェクトの詳細な情報を確認
          if (err instanceof Error) {
            console.error('エラー名:', err.name);
            console.error('エラーメッセージ:', err.message);
            console.error('スタックトレース:', err.stack);
          }
          
          if (isMountedRef.current) {
            setError(`記事の取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
            setLoading(false);
          }
        }
      } catch (err) {
        // AbortError（リクエストのキャンセル）は正常な動作なのでエラーとして扱わない
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('リクエストがキャンセルされました');
          return;
        }
        
        // エラーの詳細を出力
        console.error('記事の取得に失敗しました', err);
        
        // エラーオブジェクトの詳細な情報を確認
        if (err instanceof Error) {
          console.error('エラー名:', err.name);
          console.error('エラーメッセージ:', err.message);
          console.error('スタックトレース:', err.stack);
        }
        
        if (isMountedRef.current) {
          setError(`記事の取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
          setLoading(false);
        }
      }
    };

    fetchArticles();

    // クリーンアップ関数
    return () => {
      isMountedRef.current = false; // コンポーネントのアンマウント状態を記録
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // リクエストをキャンセル
      }
    };
  }, [currentPage, articlesPerPage]);

  // ページ番号クリック時の処理
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-100 min-h-screen mx-auto max-w-screen-3xl py-8 px-4">
      <h1 className="mt-1 py-5 text-3xl font-bold text-center text-gray-800">記事一覧</h1>
      
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
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
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link href={`/articles/${article.id}`}>
              <div className="p-6 cursor-pointer">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 hover:text-blue-600">
                  {article.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {article.body?.substring(0, 150) || '内容がありません'}...
                </p>
                <div className="mt-4 text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    続きを読む
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {articles.length === 0 && !loading && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600">記事がありません。</p>
        </div>
      )}
      
      {/* ページネーションコントロール */}
      {articles.length > 0 && (
        <div className="flex justify-center mt-8">
          <ul className="flex">
            {Array.from({ length: totalPages }).map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DemoBody;
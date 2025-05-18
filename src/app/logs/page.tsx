'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
  data?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      const savedLogs = JSON.parse(
        localStorage.getItem('appLogs') || '[]');
      setLogs(savedLogs);
    } catch (error) {
      console.error('ログの読み込みに失敗しました:', error);
    }
  }, []);

  const downloadLogs = () => {
    try {
      const content = JSON.stringify(logs, null, 2);
      const blob = new Blob(
        [content], { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ログのダウンロードに失敗しました:', error);
    }
  };
  const clearLogs = () => {
    try {
      localStorage.removeItem('appLogs');
      setLogs([]);
    } catch (error) {
      console.error('ログのクリアに失敗しました:', error);
    }
  };
  return (
    <div className="
      p-4
    ">
      <div className="
        flex items-center
        justify-between mb-6
      ">
        <h1 className="
          text-2xl font-bold
        ">
          アプリケーションログ
        </h1>
        <Link href="/"
        className="
          text-blue-600
          hover:underline
        ">
          ホームに戻る
        </Link>
      </div>
      <div className="
        flex gap-4 mb-6
      ">
        <button
          onClick={downloadLogs} 
          className="
            bg-blue-600 text-white
            px-4 py-2
            rounded
            hover:bg-blue-700"
        >
          ログをダウンロード
        </button>
        <button 
          onClick={clearLogs} 
          className="
          bg-red-600 text-white
          px-4 py-2 rounded
          hover:bg-red-700"
        >
          ログをクリア
        </button>
      </div>
      <div className="
        border rounded
        p-4 bg-gray-50
        mb-6
      ">
        {logs.length === 0 ? (
          <p className="
            text-gray-500 italic
          ">
            ログはありません
          </p>
        ) : (
          <div className="
            space-y-2
          ">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`p-3 rounded ${
                  log.type === 'error' 
                    ? 'bg-red-50 border-l-4 border-red-500' 
                    : log.type === 'warn'
                    ? 'bg-yellow-50 border-l-4 border-yellow-500'
                    : 'bg-white border'
                }`}
              >
                <div className="
                  text-xs text-gray-500
                  mb-1
                ">
                  {new Date(log.timestamp).toLocaleString('ja-JP')}
                </div>
                <div className={`font-medium ${
                  log.type === 'error' ? 'text-red-700' : 
                  log.type === 'warn' ? 'text-yellow-700' : 'text-gray-900'
                }`}>
                  {log.message}
                </div>
                {log.data && (
                  <pre className="
                    mt-2 text-xs
                    overflow-auto bg-gray-100
                    p-2 rounded max-h-32
                  ">
                    {log.data}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
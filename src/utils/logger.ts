interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error';
  message: string;
  data?: string;
}

/**
 * アプリケーションログをローカルストレージに保存する
 * @param type ログの種類（info/warn/error）
 * @param message ログメッセージ
 * @param data 追加データ（オプション）
 */
export function saveLog(type: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  // 元のconsoleメソッドも呼び出す
  if (type === 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
  } else if (type === 'warn') {
    console.warn(`[${type.toUpperCase()}] ${message}`, data || '');
  } else {
    console.error(`[${type.toUpperCase()}] ${message}`, data || '');
  }
  
  // クライアントサイドの場合のみローカルストレージを使用
  if (typeof window !== 'undefined') {
    try {
      // ローカルストレージからログを読み込む
      const logs: LogEntry[] = JSON.parse(localStorage.getItem('appLogs') || '[]');
      
      // 新しいログエントリを追加
      logs.push({
        timestamp: new Date().toISOString(),
        type,
        message,
        data: data ? JSON.stringify(data) : undefined
      });
      
      // 最新の100件だけ保持する（必要に応じて調整）
      if (logs.length > 100) {
        logs.shift();
      }
      
      // ローカルストレージに保存
      localStorage.setItem('appLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('ログの保存に失敗しました:', error);
    }
  }
}
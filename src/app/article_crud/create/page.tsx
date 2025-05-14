'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

// カスタムスタイリングされたMUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

// フォームデータの型定義 - 必要なプロパティのみに簡素化
interface PostFormData {
  title: string;
  content: string;
  publishStatus: 'draft' | 'published';
}

// エラーの型定義 - 必要なプロパティのみに簡素化
interface FormErrors {
  title?: string;
  content?: string;
}

// 初期データの型定義 - 必要なプロパティのみに簡素化
interface PostData {
  id?: string;
  title?: string;
  content?: string;
  body?: string; // APIからのレスポンスでbodyとして返ってくる可能性を考慮
  publishStatus?: 'draft' | 'published';
}

// コンポーネントのpropsの型定義
interface PostFormProps {
  initialData?: PostData | null;
}

const PostForm: React.FC<PostFormProps> = ({ initialData = null }) => {
  // フォームの状態管理 - initialDataの存在チェック後に値を取得
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    // APIから返されるデータがbodyとしてくる場合の対応
    content: initialData?.content || initialData?.body || '',
    publishStatus: initialData?.publishStatus || 'draft',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();
  
  // 入力フィールドの変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // エラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // フォーム送信時のバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    if (!formData.content.trim()) {
      newErrors.content = '記事の内容を入力してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // トークンのリフレッシュを試みる
  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken) return null;
      
      // リフレッシュAPI呼び出し（APIの仕様に合わせて調整）
      const refreshResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken.trim()}`
        }
      });
      
      if (!refreshResponse.ok) {
        console.error('トークンリフレッシュ失敗:', refreshResponse.status);
        return null;
      }
      
      const refreshData = await refreshResponse.json();
      const newToken = refreshData.access_token;
      
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        console.log('トークンを更新しました');
        return newToken;
      }
      
      return null;
    } catch (error) {
      console.error('リフレッシュエラー:', error);
      return null;
    }
  };

  // 認証エラー時の処理を追加
  const handleAuthError = () => {
    localStorage.removeItem('authToken');
    alert('認証情報が無効になりました。再度ログインしてください。');
    router.push('/login');
  };

  // 記事の保存または公開ハンドラー
  const handleSubmit = async (action: 'draft' | 'publish') => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // トークン取得と検証を強化
      let cleanToken = ''; // cleanTokenをより広いスコープで宣言
      
      // ユーザーIDを追加（FastAPIのデフォルト実装では通常必要）
      const postData = {
        title: formData.title,
        body: formData.content,
        user_id: 6, // テストで成功したuser_idを指定
        publish_status: action === 'publish' ? 'published' : 'draft',
      };
      
      console.log('送信データ:', postData);
      
      try {
        // トークン取得とログ出力
        const token = localStorage.getItem('authToken');
        console.log('Token in storage:', token); // トークン全体を出力（開発環境のみ）
        
        // トークンの存在確認
        if (!token) {
          console.error('トークンがありません');
          alert('ログインが必要です。ログイン画面に移動します。');
          router.push('/login');
          return;
        }
      
        // JWT判定（簡易的な確認）
        const isJWT = token.split('.').length === 3;
        console.log('トークン形式:', isJWT ? 'JWT形式' : '通常文字列');
        
        // トークンをクリーン化（不要な空白削除）
        cleanToken = token.trim();
        
        // トークンの正当性を確認
        if (cleanToken === 'undefined' || cleanToken === 'null' || cleanToken === '') {
          console.error('無効なトークン:', cleanToken);
          localStorage.removeItem('authToken');
          alert('認証情報が無効です。再度ログインしてください。');
          router.push('/login');
          return;
        }
        
        // APIリクエスト送信
        const response = await fetch('http://127.0.0.1:8000/api/v1/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          },
          body: JSON.stringify(postData)
        });
        
        console.log('レスポンスステータス:', response.status); // デバッグログ追加
        
        // 401エラー発生時に一度リフレッシュを試す
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            // 新しいトークンで再試行
            const retryResponse = await fetch('http://127.0.0.1:8000/api/v1/articles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify(postData)
            });
            
            if (retryResponse.ok) {
              alert('記事を正常に保存しました');
              router.push('/user');
              return;
            }
          }
          handleAuthError();
          return; // 処理を中断
        }
        
        // レスポンスのテキストを取得（JSONでもそうでなくても）
        const responseText = await response.text();
        console.log('レスポンスボディ:', responseText); // デバッグログ追加
        
        if (!response.ok) {
          // レスポンスボディをJSONとして解析しようとする
          let errorData = null;
          try {
            errorData = responseText ? JSON.parse(responseText) : null;
          } catch (e) {
            console.error('JSONパースエラー:', e);
            errorData = responseText; // JSONではない場合はテキストのまま
          }
          
          console.error('APIエラー:', response.status, errorData);
          throw new Error(`記事の保存に失敗しました (${response.status}): ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`);
        }
        
        // 正常なレスポンスをJSONとしてパース
        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.warn('成功レスポンスのJSONパースエラー:', e);
          result = { message: '記事が作成されましたが、レスポンスの解析に失敗しました' };
        }
        
        console.log('作成成功:', result);
        
        // 成功したら記事一覧ページに戻る
        alert('記事を正常に保存しました');
        router.push('/user');
      } catch (error) {
        console.error('Error during API call:', error);
        alert('API呼び出し中にエラーが発生しました：' + (error instanceof Error ? error.message : String(error)));
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      alert(`記事の保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledPaper elevation={0} className="max-w-4xl mx-auto">
      <Typography variant="h5" component="h1" className="mb-6 font-bold text-gray-800">
        {initialData?.id ? '記事を編集' : '新しい記事を作成'}
      </Typography>
      <Box className="space-y-6">
        {/* タイトル */}
        <TextField
          fullWidth
          label="タイトル"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          placeholder="記事のタイトルを入力"
          variant="outlined"
          className="mb-4"
        />
        {/* 記事本文 */}
        <TextField
          fullWidth
          label="記事本文"
          name="content"
          value={formData.content}
          onChange={handleChange}
          error={!!errors.content}
          helperText={errors.content}
          placeholder="記事の本文を入力してください"
          variant="outlined"
          multiline
          rows={12}
          className="mb-4"
        />
        {/* アクションボタン */}
        <Box className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              variant="outlined"
              color="error"
              onClick={() => router.push('/user')} // デモページに戻る
              disabled={saving}
            >
              キャンセル
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSubmit('draft')}
              disabled={saving}
            >
              下書き保存
            </Button>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PublishIcon />}
            onClick={() => handleSubmit('publish')}
            disabled={saving}
          >
            {saving ? '処理中...' : '公開する'}
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
};

// エクスポートするページコンポーネント
const CreatePostPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PostForm />
    </div>
  );
};

export default CreatePostPage;
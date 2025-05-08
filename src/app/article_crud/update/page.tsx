'use client';

import React, { useState, ChangeEvent } from 'react';
import { 
  TextField, 
  Button, 
  Box,
  Typography,
  Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import CancelIcon from '@mui/icons-material/Cancel'; // キャンセルアイコンをインポート
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

// カスタムスタイリングされたMUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

// フォームデータの型定義（簡素化）
interface PostFormData {
  title: string;
  content: string;
  publishStatus: 'draft' | 'published';
}

// エラーの型定義（簡素化）
interface FormErrors {
  title?: string;
  content?: string;
}

// 初期データの型定義（簡素化）
interface PostData {
  id?: string;
  title?: string;
  content?: string;
  publishStatus?: 'draft' | 'published';
}

// コンポーネントのpropsの型定義
interface PostFormProps {
  initialData?: PostData | null;
}

const PostForm: React.FC<PostFormProps> = ({ initialData = null }) => {
  // フォームの状態管理（簡素化）
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
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
  
  // キャンセルハンドラー
  const handleCancel = () => {
    if (formData.title.trim() || formData.content.trim()) {
      // 入力内容がある場合は確認ダイアログを表示
      const confirmCancel = window.confirm('編集内容が保存されていません。キャンセルしますか？');
      if (confirmCancel) {
        router.push('/demopage');
      }
    } else {
      // 入力内容がない場合は直接戻る
      router.push('/demopage');
    }
  };
  
  // フォーム送信時のバリデーション（簡素化）
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
  
  // 記事の保存または公開ハンドラー（簡素化）
  const handleSubmit = async (action: 'draft' | 'publish') => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const statusToSet = action === 'publish' ? 'published' : 'draft';
      
      // APIリクエストデータを準備（簡素化）
      const postData = {
        title: formData.title,
        body: formData.content,  // APIの期待する形式に合わせて名前を変更
        user_id: 1,  // または適切なユーザーID
        status: statusToSet
      };
      
      // APIエンドポイント（新規作成または更新）
      const url = initialData?.id 
        ? `http://127.0.0.1:8000/api/v1/articles/${initialData.id}` 
        : 'http://127.0.0.1:8000/api/v1/articles';
      
      const method = initialData?.id ? 'PUT' : 'POST';

      // トークン取得
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('認証情報がありません。再度ログインしてください。');
        router.push('/login');
        return;
      }
      
      // 実際のAPI呼び出し
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API エラーレスポンス:', errorText);
        throw new Error(`記事の保存に失敗しました (${response.status})`);
      }
      
      const result = await response.json();
      console.log('API 成功レスポンス:', result);
      
      // 成功したら一覧ページに戻る
      alert('記事を正常に保存しました');
      router.push('/demopage');
      
    } catch (error) {
      console.error('投稿エラー:', error);
      alert(`記事の保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <StyledPaper>
      <Box className="mb-4">
        <Typography variant="h6">
          記事の{initialData ? '編集' : '作成'}
        </Typography>
      </Box>

      <Box component="form" noValidate autoComplete="off">
        <TextField
          label="タイトル"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
          margin="normal"
        />
        <TextField
          label="内容"
          name="content"
          value={formData.content}
          onChange={handleChange}
          error={!!errors.content}
          helperText={errors.content}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            下書き保存
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PublishIcon />}
            onClick={() => handleSubmit('publish')}
            disabled={saving}
          >
            公開
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={saving}
          >
            キャンセル
          </Button>
        </Box>
        
        {/* 下部にだけ会員専用ページに戻るボタンを残す */}
        <Box mt={3} textAlign="center" className="border-t pt-4">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/demopage')}
            className="mx-auto"
          >
            会員専用ページに戻る
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default PostForm;
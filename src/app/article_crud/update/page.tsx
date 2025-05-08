'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  TextField, 
  Button, 
  Box,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

// カスタムスタイリングされたMUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

// 記事データの型定義
interface Article {
  article_id: number;
  title: string;
  body: string;
  user_id: number;
}

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
  articleId?: string;
}

// コンポーネントのpropsの型定義
interface PostFormProps {
  initialData?: Article | null;
}

// 記事更新ページのメインコンポーネント
const UpdateArticlePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | ''>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('認証情報がありません。再度ログインしてください。');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/v1/articles', {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('記事取得エラー:', error);
        setError('記事の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
  // 記事選択時のハンドラー
  const handleArticleSelect = (articleId: number) => {
    const selected = articles.find(article => article.article_id === articleId) || null;
    setSelectedArticleId(articleId);
    setSelectedArticle(selected);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        記事を編集する
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
          <Typography>{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/demopage')} 
            className="mt-4"
          >
            会員専用ページに戻る
          </Button>
        </Box>
      ) : (
        <>
          {articles.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="h6" gutterBottom>
                編集可能な記事がありません
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push('/demopage')} 
                className="mt-4"
              >
                会員専用ページに戻る
              </Button>
            </Box>
          ) : (
            <>
              <StyledPaper className="mb-6">
                <Box p={2}>
                  <FormControl fullWidth>
                    <Select
                      value={selectedArticleId}
                      onChange={(e) => handleArticleSelect(e.target.value as number)}
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="" disabled>記事を選択してください</MenuItem>
                      {articles.map((article) => (
                        <MenuItem key={article.article_id} value={article.article_id}>
                          {article.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </StyledPaper>
              
              {selectedArticle && <PostForm initialData={selectedArticle} />}
            </>
          )}
        </>
      )}
    </div>
  );
};

const PostForm: React.FC<PostFormProps> = ({ initialData = null }) => {
  // フォームの状態管理（簡素化）
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.body || '',  // bodyフィールドを使用
    publishStatus: 'published',  // デフォルトは公開
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();
  
  // 初期データが変更されたらフォームデータを更新
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.body || '',
        publishStatus: 'published',
      });
    }
  }, [initialData]);
  
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
  
  // フォーム送信時のバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '記事の内容を入力してください';
    }
    
    if (!initialData?.article_id) {
      newErrors.articleId = '編集する記事が選択されていません';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 記事の保存または公開ハンドラー
  const handleSubmit = async (action: 'draft' | 'publish') => {
    if (!validateForm()) return;
    if (!initialData?.article_id) {
      alert('編集する記事が選択されていません');
      return;
    }
    
    setSaving(true);
    
    try {
      const statusToSet = action === 'publish' ? 'published' : 'draft';
      
      // APIリクエストデータを準備
      const postData = {
        title: formData.title,
        body: formData.content,
        user_id: initialData.user_id,
        status: statusToSet
      };
      
      // トークン取得
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('認証情報がありません。再度ログインしてください。');
        router.push('/login');
        return;
      }
      
      // APIエンドポイント（クエリパラメータでarticle_idを指定）
      const url = `http://127.0.0.1:8000/api/v1/articles?article_id=${initialData.article_id}`;
      
      // 実際のAPI呼び出し
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API エラーレスポンス:', errorText);
        throw new Error(`記事の更新に失敗しました (${response.status})`);
      }
      
      const result = await response.json();
      console.log('API 成功レスポンス:', result);
      
      // 成功したら一覧ページに戻る
      alert('記事を正常に更新しました');
      router.push('/demopage');
      
    } catch (error) {
      console.error('更新エラー:', error);
      alert(`記事の更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <StyledPaper>
      <Box className="mb-4">
        <Typography variant="h6">
          記事の編集
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
          rows={8}
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

export default UpdateArticlePage;
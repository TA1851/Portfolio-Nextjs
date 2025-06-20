'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';


// MUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

// フォームデータの型定義
interface PostFormData {
  title: string;
  content: string;
  publishStatus: 'draft' | 'published';
}

// エラーの型定義
interface FormErrors {
  title?: string;
  content?: string;
}

// 初期データの型定義
interface PostData {
  id?: string;
  title?: string;
  content?: string;
  body?: string;
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
  const [open, setOpen] = useState<boolean>(false); // ダイアログのオープン状態
  
  // 成功・エラーメッセージの状態管理
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState<boolean>(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState<boolean>(false);
  
  const router = useRouter();

  // 入力フィールドの変更ハンドラー
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  // トークンのリフレッシュ
  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken) return null;

      // 環境変数からAPIエンドポイントを取得する
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
      const refreshResponse = await fetch(
        `${apiUrl}/refresh`, {
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
      let cleanToken = '';

      // ユーザーIDを追加
      const postData = {
        title: formData.title,
        body: formData.content,
        user_id: 6,
        publish_status: action === 'publish' ? 'published' : 'draft',
      };
      try {
        // トークン取得とログ出力
        const token = localStorage.getItem('authToken');
        // トークンの存在確認
        if (!token) {
          alert('ログインが必要です。ログイン画面に移動します。');
          router.push('/login');
          return;
        }
        // トークンをクリーン化
        cleanToken = token.trim();

        // トークンの正当性を確認
        if (
          cleanToken === 'undefined' || cleanToken === 'null' || cleanToken === '') {
          localStorage.removeItem('authToken');
          alert('認証情報が無効です。再度ログインしてください。');
          router.push('/login');
          return;
        }
        // 環境変数からAPIエンドポイントを取得する
        const apiUrl = process.env.NEXT_PUBLIC_API_URL_V1;
        const response = await fetch(
          `${apiUrl}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          },
          body: JSON.stringify(postData)
        });
        // 401エラー発生時に一度リフレッシュを試す
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            // 新しいトークンで再試行
            const retryResponse = await fetch(
              `${apiUrl}/articles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify(postData)
            });

            if (retryResponse.ok) {
              router.push('/user');
              return;
            }
          }
          handleAuthError();
          return;
        }

        // レスポンスのテキストを取得
        const responseText = await response.text();
        if (!response.ok) {
          let errorData = null;
          try {
            errorData = responseText ? JSON.parse(responseText) : null;
          } catch (e) {
            console.error('JSONパースエラー:', e);
            errorData = responseText;
          }
          console.error('APIエラー:', response.status, errorData);
          throw new Error(
            `記事の保存に失敗しました(${response.status}):
            ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`);
        }
        // 成功したら記事一覧ページに戻る
        setSuccessMessage(`記事「${formData.title}」を${action === 'publish' ? '公開' : '下書き保存'}しました`);
        setShowSuccessSnackbar(true);

        // フォームをクリア
        setFormData({
          title: '',
          content: '',
          publishStatus: 'draft',
        });
      } catch (error) {
        console.error('Error during API call:', error);
        setErrorMessage(
          'API呼び出し中にエラーが発生しました：'
          + (error instanceof Error ? error.message : String(error))
        );
        setShowErrorSnackbar(true);
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      setErrorMessage(
        `記事の保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
      setShowErrorSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  // ダイアログを閉じるハンドラー
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <StyledPaper elevation={0}
    className="
      max-w-4xl mx-auto
    ">
      <Typography variant="h5" component="h1"
      className="
        mb-6 font-bold
        text-gray-800
      ">
        {initialData?.id ? '記事を編集' : '新しい記事を作成'}
      </Typography>
      <Box
      className="
        space-y-6
      ">
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
          placeholder="記事の本文をMarkdown形式で入力してください"
          variant="outlined"
          multiline
          rows={12}
          className="mb-4"
        />
        {/* アクションボタン */}
        <Box
          mt={2}
          display="flex"
          justifyContent={{ xs: 'center', sm: 'space-between', lg: 'flex-end' }} // 1400px以上で右寄せ
          flexDirection={{ xs: 'column', sm: 'row' }} // モバイルでは縦並び、デスクトップでは横並び
          gap={{xs:2, sm:2, md:2, lg:2}} // ボタン間のスペース
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            sx={{
              width: { xs: '100%', sm: 'auto' }, // レスポンシブ対応：モバイルでは幅いっぱい
              height: { xs: '48px', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            下書き保存
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PublishIcon />}
            onClick={() => setOpen(true)}
            disabled={saving}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              height: { xs: '48px', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            公開する
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
            onClick={() => router.push('/user')}
            disabled={saving}
            sx={{
              color: 'red',
              borderColor: 'red',
              width: { xs: '100%', sm: 'auto' },
              height: { xs: '48px', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            キャンセル
          </Button>
        </Box>
        <Box mt={3} textAlign="center" className="border-t pt-4">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/user')}
            className="mx-auto"
          >
            会員専用ページに戻る
          </Button>
        </Box>
      </Box>
      {/* 確認ダイアログ */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            width: { xs: '90%', sm: '450px' }
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          記事の公開確認
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            &ldquo;{formData.title}&rdquo; を公開しますか？
            <br />
            公開すると、すべてのユーザーが閲覧できるようになります。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={() => {
              handleSubmit('publish');
              handleClose();
            }}
            color="secondary"
            variant="contained"
            autoFocus
            sx={{
              '&:hover': {
                backgroundColor: 'secondary.dark',
                boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)',
              },
            }}
          >
            公開する
          </Button>
        </DialogActions>
      </Dialog>

      {/* 成功メッセージ */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* エラーメッセージ */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={8000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowErrorSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};
const CreatePostPage: React.FC = () => {
  return (
    <div className="
      container mx-auto
      px-4 py-8
    ">
      <PostForm />
    </div>
  );
};
export default CreatePostPage;
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

// Material UIコンポーネント
import {
  TextField, Button, Box, Typography, Paper, CircularProgress,
  MenuItem, Popper, Grow, MenuList, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

// Material UIアイコン
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Cancel as CancelIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';


// カスタムスタイリングされたMUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
}));

// 記事データの型定義
interface Article {
  article_id: number;
  title: string;
  body: string;
  user_id: number;
}

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
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
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
        // 環境変数を使用してAPIエンドポイントを取得
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(
          `${apiUrl}/articles`, {
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
    const selected = articles.find(
      article => article.article_id === articleId
      ) || null;
      setSelectedArticleId(articleId);
      setSelectedArticle(selected);
  };
  // ドロップダウンの開閉を処理する
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // メニューアイテムがクリックされたときの処理
  const handleMenuItemClick = (articleId: number) => {
    handleArticleSelect(articleId);
    setOpen(false);
  };

  // クリックアウェイ処理
  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(
      event.target as HTMLElement
    )) {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="
      container mx-auto
      px-4 py-8
      bg-white
    ">
      <Box display="flex" justifyContent="space-between" alignItems="center" className="mb-6">
        <Typography
          variant="h4" component="h1"
          className="text-center"
        >
          記事を編集する
        </Typography>
        {/* ホームに戻るボタンをヘッダー右側に追加 */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push('/user')}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '4px 8px', sm: '6px 12px' }
          }}
        >
          戻る
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center p-4">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box className="p-2 bg-red-100 text-red-800 rounded">
          <Typography>
            {error}
          </Typography>
          <Box mt={3} display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/user')}
            >
              会員専用ページに戻る
            </Button>
            {/* エラー時のホームに戻るボタン */}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push('/')}
            >
              ホームに戻る
            </Button>
          </Box>
        </Box>
        ) : (
          <>
            {articles.length === 0 ? (
              <Box
                className="
                  p-4 text-center
                ">
                <Typography
                  variant="h6" gutterBottom
                >
                  編集可能な記事がありません
                </Typography>
                <Box mt={3} display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/user')}
                  >
                    会員専用ページに戻る
                  </Button>
                  {/* 記事がない場合のホームに戻るボタン */}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/')}
                  >
                    ホームに戻る
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <StyledPaper
                className="
                  mb-6
                  ">
                  <Box
                  className="
                    p-2
                  ">
                    <div>
                      {/* ButtonGroupの代わりに単一のButtonコンポーネントを使用 */}
                      <Button
                        variant="contained"
                        ref={anchorRef} 
                        aria-label="select article"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="menu"
                        onClick={handleToggle}
                        sx={{ 
                          backgroundColor: '#1976d2', 
                          color: 'white',
                          width: { xs: '100%', sm: '100%', md: 'auto' }, // モバイルで幅いっぱいに
                          padding: { xs: '10px', sm: '8px 16px' }, // パディングも調整
                          textAlign: 'left',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, // 画面サイズに応じてフォントサイズ調整
                          whiteSpace: 'normal', // テキストを折り返し
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          height: 'auto', // 高さを自動調整
                          minHeight: '40px',
                          display: 'flex',
                          justifyContent: 'space-between', // テキストとアイコンを両端に配置
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: '#1565c0', // ホバー時の色
                          }
                        }}
                        endIcon={<ArrowDropDownIcon />} // 右端にアイコンを配置
                      >
                        {selectedArticle?.title || '記事を選択してください'}
                      </Button>
                      <Popper
                        sx={{
                          zIndex: 1,
                          width: { 
                            xs: 'calc(100% - 32px)', // モバイルでは画面幅いっぱい(パディング分を引く)
                            sm: 'calc(100% - 64px)', 
                            md: '500px',
                            lg: '500px'
                          },
                          maxHeight: '60vh', // 高さ制限を追加
                          overflowY: 'auto'  // スクロール可能に
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                        placement="bottom-start" // 下部に表示
                      >
                        {({ TransitionProps, placement }) => (
                          <Grow
                            {...TransitionProps}
                            style={{
                              transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                              maxHeight: '50vh', // 高さ制限を追加
                              overflowY: 'auto'  // スクロール可能に
                            }}
                          >
                            <Paper sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                              <ClickAwayListener onClickAway={handleClose}>
                                <MenuList 
                                  id="split-button-menu" 
                                  autoFocusItem
                                >
                                  {articles.map((article) => (
                                    <MenuItem
                                      key={article.article_id}
                                      selected={article.article_id === selectedArticleId}
                                      onClick={() => handleMenuItemClick(article.article_id)}
                                      sx={{
                                        whiteSpace: 'normal', // テキストを折り返し
                                        wordBreak: 'break-word',
                                        padding: '8px 16px',
                                        minHeight: '40px'
                                      }}
                                    >
                                      {article.title}
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    </div>
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

const PostForm: React.FC<PostFormProps> = (
  { initialData = null }
  ) => {
  // フォームの状態管理
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.body || '',
    publishStatus: 'published',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<{ action: 'draft' | 'publish' | null }>({ action: null });
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
  const handleChange = (
    e: ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement
    >) => {
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

  // モーダルを開く
  const handleOpenDialog = (action: 'draft' | 'publish') => {
    setOpenDialog({ action });
  };

  // モーダルを閉じる
  const handleCloseDialog = () => {
    setOpenDialog({ action: null });
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
  const handleSubmit = async (
    action: 'draft' | 'publish'
  ) => {
  if (!validateForm()) return;
  if (!initialData?.article_id) {
    alert('編集する記事が選択されていません');
    return;
  }
    setSaving(true);
    try {
      const statusToSet = action ===
      'publish' ? 'published' : 'draft';
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
      // 環境変数を使用してAPIエンドポイントを取得
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url =
      `${apiUrl}/articles?article_id=${initialData.article_id}`;
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
      // alert('記事を正常に更新しました');
      router.push('/user');
    } catch (error) {
      console.error('更新エラー:', error);
      alert(
        `記事の更新に失敗しました:
        ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    } finally {
      setSaving(false);
      handleCloseDialog();
    }
  };

  return (
    <StyledPaper>
      <Box className="mb-4">
        <Typography variant="h6">
          記事の編集
        </Typography>
      </Box>
        <Box
          component="form"
          noValidate autoComplete="off"
        >
        <TextField
          label="タイトル"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
          margin="normal"
          slotProps={{
            inputLabel: {
              style: { color: 'black' },
            },
            input: {
              style: { color: 'GrayText' },
            },
            formHelperText: {
              style: { color: '#ff9494' },
            },
          }}
        />
        <TextField
          label="本文"
          name="content"
          value={formData.content}
          onChange={handleChange}
          error={!!errors.content}
          helperText={errors.content}
          fullWidth
          multiline
          rows={8}
          margin="normal"
          slotProps={{
            inputLabel: {
              style: { color: 'black' },
            },
            input: {
              style: { color: 'GrayText' },
            },
            formHelperText: {
              style: { color: '#ff9494' },
            },
          }}
        />
        <Box
          mt={2}
          display="flex"
          justifyContent={{ xs: 'center', sm: 'space-between', lg: 'flex-end' }} // 1400px以上で右寄せ
          flexDirection={{ xs: 'column', sm: 'row' }} // モバイルでは縦並び
          gap={{ xs: 2, sm: 2, md:2, lg:2 }} // モバイルではボタン間にスペースを追加
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleOpenDialog('draft')}
            disabled={saving}
            sx={{
              width: { xs: '100%', sm: 'auto' }, // モバイルでは幅いっぱい
              height: { xs: '48px', sm: 'auto' }, // モバイルでは高さを固定
              fontSize: { xs: '0.875rem', sm: '1rem' }, // フォントサイズ調整
            }}
          >
            下書き保存
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PublishIcon />}
            onClick={() => handleOpenDialog('publish')}
            disabled={saving}
            sx={{
              width: { xs: '100%', sm: 'auto' }, // モバイルでは幅いっぱい
              height: { xs: '48px', sm: 'auto' }, // モバイルでは高さを固定
              fontSize: { xs: '0.875rem', sm: '1rem' }, // フォントサイズ調整
            }}
          >
            公開
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
              width: { xs: '100%', sm: 'auto' }, // モバイルでは幅いっぱい
              height: { xs: '48px', sm: 'auto' }, // モバイルでは高さを固定
              fontSize: { xs: '0.875rem', sm: '1rem' }, // フォントサイズ調整
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

      {/* 確認モーダル */}
      <Dialog open={!!openDialog.action} onClose={handleCloseDialog}>
        <DialogTitle>
          {openDialog.action === 'publish' ? '記事を公開しますか？' : '下書きを保存しますか？'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {openDialog.action === 'publish'
              ? 'この記事を公開すると、すべてのユーザーが閲覧可能になります。'
              : 'この記事を下書きとして保存します。'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            キャンセル
          </Button>
          <Button
            onClick={() => handleSubmit(openDialog.action!)}
            color="primary"
            variant="contained"
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};
export default UpdateArticlePage;
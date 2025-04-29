'use client';

// components/PostForm.tsx
import React, { useState, ChangeEvent } from 'react';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Chip,
  OutlinedInput,
  Typography,
  FormHelperText,
  IconButton,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

// カスタムスタイリングされたMUIコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// 利用可能なカテゴリのリスト（実際のプロジェクトではAPIから取得することもあります）
const categories = [
  'テクノロジー',
  'プログラミング',
  'デザイン',
  'ビジネス',
  'マーケティング',
  'ライフスタイル',
  'その他'
];

// 画像データの型定義
interface FeaturedImage {
  file?: File;
  preview: string;
}

// フォームデータの型定義
interface PostFormData {
  title: string;
  content: string;
  summary: string;
  categories: string[];
  featuredImage: FeaturedImage | null;
  publishStatus: 'draft' | 'published';
}

// エラーの型定義
interface FormErrors {
  title?: string;
  content?: string;
  summary?: string;
  categories?: string;
}

// 初期データの型定義
interface PostData extends Omit<PostFormData, 'featuredImage'> {
  id?: string;
  featuredImage?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// コンポーネントのpropsの型定義
interface PostFormProps {
  initialData?: PostData | null;
}

const PostForm: React.FC<PostFormProps> = ({ initialData = null }) => {
  // フォームの状態管理
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    summary: initialData?.summary || '',
    categories: initialData?.categories || [],
    featuredImage: initialData?.featuredImage ? { preview: initialData.featuredImage } : null,
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
  
  // カテゴリの選択ハンドラー
  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      categories: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  // 画像アップロードハンドラー
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          featuredImage: {
            file,
            preview: reader.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 画像削除ハンドラー
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      featuredImage: null
    });
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
    
    if (!formData.summary.trim()) {
      newErrors.summary = '記事の要約を入力してください';
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = '少なくとも1つのカテゴリを選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 記事の保存または公開ハンドラー
  const handleSubmit = async (action: 'draft' | 'publish') => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const statusToSet = action === 'publish' ? 'published' : 'draft';
      
      // APIリクエストデータを準備
      const postData = {
        ...formData,
        publishStatus: statusToSet,
        publishedAt: statusToSet === 'published' ? new Date().toISOString() : null
      };
      
      // 画像ファイルがある場合、フォームデータとして送信
      let data: globalThis.FormData | Record<string, unknown>;
      if (formData.featuredImage?.file) {
        const formDataObj = new FormData();
        
        // JSONデータをappendする
        formDataObj.append('postData', JSON.stringify({
          title: postData.title,
          content: postData.content,
          summary: postData.summary,
          categories: postData.categories,
          publishStatus: postData.publishStatus,
          publishedAt: postData.publishedAt
        }));
        
        // 画像ファイルをappendする
        formDataObj.append('featuredImage', formData.featuredImage.file);
        
        data = formDataObj;
      } else {
        data = postData;
      }
      
      // APIエンドポイント（新規作成または更新）
      const url = initialData?.id 
        ? `/api/posts/${initialData.id}` 
        : '/api/posts';
      
      const method = initialData?.id ? 'PUT' : 'POST';
      
      // 実際のAPI呼び出し
      // 注: このコードは実際のAPIの仕様に合わせて調整する必要があります
      const response = await fetch(url, {
        method,
        headers: formData.featuredImage?.file ? {} : {
          'Content-Type': 'application/json',
        },
        body: formData.featuredImage?.file ? data as globalThis.FormData : JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('記事の保存に失敗しました');
      }
      
      const result = await response.json();
      
      // 成功したら一覧ページに戻る
      if (action === 'publish') {
        router.push('/admin/posts');
      } else {
        // 下書き保存成功の場合
        router.push(`/admin/posts/edit/${result.id}`);
      }
      
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('記事の保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <StyledPaper elevation={0} className="max-w-4xl mx-auto">
      <Typography variant="h5" component="h1" className="mb-6 font-bold text-gray-800">
        {initialData ? '記事を削除' : '記事を削除する'}
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
        
        {/* カテゴリ選択 */}
        <FormControl fullWidth error={!!errors.categories}>
          <InputLabel id="categories-label">カテゴリ</InputLabel>
          <Select
            labelId="categories-label"
            id="categories"
            multiple
            name="categories"
            value={formData.categories}
            onChange={handleCategoryChange}
            input={<OutlinedInput label="カテゴリ" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {categories.map((category) => (
              <MenuItem
                key={category}
                value={category}
              >
                {category}
              </MenuItem>
            ))}
          </Select>
          {errors.categories && <FormHelperText>{errors.categories}</FormHelperText>}
        </FormControl>
        
        {/* 要約 */}
        <TextField
          fullWidth
          label="要約"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          error={!!errors.summary}
          helperText={errors.summary}
          placeholder="記事の要約を入力（160文字以内）"
          variant="outlined"
          multiline
          rows={2}
          inputProps={{ maxLength: 160 }}
          className="mb-4"
        />
        
        {/* アイキャッチ画像アップロード */}
        <Box className="border border-dashed border-gray-300 rounded-md p-4">
          <Typography variant="body2" className="mb-2 text-gray-600">
            アイキャッチ画像
          </Typography>
          {formData.featuredImage ? (
            <Box className="relative">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image 
                  src={formData.featuredImage.preview} 
                  alt="プレビュー" 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
              <IconButton 
                className="absolute top-2 right-2 bg-white"
                onClick={handleRemoveImage}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box 
              className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <ImageIcon className="text-gray-400 mb-2" />
              <Typography variant="body2" className="text-gray-500">
                クリックして画像をアップロード
              </Typography>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Box>
          )}
        </Box>
        
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
        <Box className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            下書き保存
          </Button>
          
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

export default PostForm;
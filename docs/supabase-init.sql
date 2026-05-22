-- ========================================
-- 拾光札记 - Supabase 数据库初始化脚本
-- ========================================
-- 运行此脚本前，请确保：
-- 1. 在 Supabase 项目中创建了数据库
-- 2. 启用了 Email 认证
-- 3. 配置了 Row Level Security (RLS)
-- ========================================

-- ========================================
-- 1. 创建 profiles 表（用户资料）
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nickname TEXT DEFAULT '用户',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 自动创建 profile（当用户注册时）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：当 auth.users 表有新用户时自动创建 profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 2. 创建 books 表（书籍）
-- ========================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  cover_path TEXT,
  status TEXT DEFAULT 'want_to_read' CHECK (status IN ('want_to_read', 'reading', 'read', 'shelved')),
  type TEXT DEFAULT 'book' CHECK (type IN ('book', 'class')),
  progress INTEGER DEFAULT 0,
  rating INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能管理自己的书籍
CREATE POLICY "Users can view own books" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON public.books
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);

-- ========================================
-- 3. 创建 notes 表（笔记）
-- ========================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能管理自己的笔记
CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_book_id ON public.notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- ========================================
-- 4. 创建 collections 表（收藏夹）
-- ========================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  book_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- ========================================
-- 5. 创建 deleted_books 表（已删除书籍）
-- ========================================
CREATE TABLE IF NOT EXISTS public.deleted_books (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  cover_path TEXT,
  status TEXT,
  type TEXT,
  progress INTEGER,
  rating INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.deleted_books ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own deleted books" ON public.deleted_books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deleted books" ON public.deleted_books
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_deleted_books_user_id ON public.deleted_books(user_id);

-- ========================================
-- 6. 创建 deleted_notes 表（已删除笔记）
-- ========================================
CREATE TABLE IF NOT EXISTS public.deleted_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.deleted_notes ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own deleted notes" ON public.deleted_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deleted notes" ON public.deleted_notes
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_deleted_notes_user_id ON public.deleted_notes(user_id);

-- ========================================
-- 7. 创建 reading_plans 表（阅读计划）
-- ========================================
CREATE TABLE IF NOT EXISTS public.reading_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_books TEXT[],
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own reading plans" ON public.reading_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading plans" ON public.reading_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading plans" ON public.reading_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading plans" ON public.reading_plans
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON public.reading_plans(user_id);

-- ========================================
-- 8. 创建 card_appearances 表（卡片外观）
-- ========================================
CREATE TABLE IF NOT EXISTS public.card_appearances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_key TEXT NOT NULL,
  theme_color TEXT,
  background_image_url TEXT,
  scope TEXT DEFAULT 'user' CHECK (scope IN ('user', 'inspirations')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_key, scope)
);

-- 启用 RLS
ALTER TABLE public.card_appearances ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own card appearances" ON public.card_appearances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card appearances" ON public.card_appearances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card appearances" ON public.card_appearances
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_card_appearances_user_id ON public.card_appearances(user_id);

-- ========================================
-- 9. 配置存储桶（Storage Buckets）
-- ========================================
-- 在 Supabase Dashboard -> Storage 中创建以下存储桶：
-- 
-- 1. book-covers (书籍封面)
--    - Public: true
--    - Allowed MIME types: image/png, image/jpeg, image/gif, image/webp
-- 
-- 2. avatars (用户头像)
--    - Public: true
--    - Allowed MIME types: image/png, image/jpeg, image/gif, image/webp
-- 
-- 3. attachments (附件)
--    - Public: false
--    - Allowed MIME types: application/pdf, image/*

-- ========================================
-- 10. 启用匿名登录（可选）
-- ========================================
-- 在 Supabase Dashboard -> Authentication -> Settings 中：
-- 1. 启用 "Allow anonymous sign-ins"
-- 2. 配置 JWT secret（如果需要）

-- ========================================
-- 11. 验证配置
-- ========================================
-- 运行以下命令验证表是否创建成功：
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 预期输出应包含：
-- - profiles
-- - books
-- - notes
-- - collections
-- - deleted_books
-- - deleted_notes
-- - reading_plans
-- - card_appearances

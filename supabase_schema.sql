-- SUPABASE SCHEMA FOR PAGEANT TABULATION SYSTEM

-- 1. Profiles (extending auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'judge')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Candidates
CREATE TABLE public.candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_number INTEGER NOT NULL,
  candidate_name TEXT NOT NULL,
  country_name TEXT,
  image_url TEXT,
  is_top14 BOOLEAN DEFAULT FALSE,
  is_top5 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  stage_type TEXT CHECK (stage_type IN ('main', 'top14', 'top5')),
  is_active BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Category Criteria
CREATE TABLE public.category_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  criterion_name TEXT NOT NULL,
  weight_value INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- 5. Scores
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  criterion_id UUID REFERENCES public.category_criteria(id) ON DELETE CASCADE,
  score_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(judge_id, candidate_id, category_id, criterion_id)
);

-- 6. Category Submissions
CREATE TABLE public.category_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  UNIQUE(judge_id, category_id)
);

-- 7. App Settings
CREATE TABLE public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB
);

-- RLS POLICIES

-- Profiles: Users can read all profiles, but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Candidates: Viewable by everyone, editable by admin
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates are viewable by everyone." ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admins can manage candidates." ON public.candidates ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: Viewable by everyone, editable by admin
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Criteria: Viewable by everyone, editable by admin
ALTER TABLE public.category_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Criteria are viewable by everyone." ON public.category_criteria FOR SELECT USING (true);
CREATE POLICY "Admins can manage criteria." ON public.category_criteria ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Scores: Judges can manage their own scores, Admins can view all
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Judges can manage their own scores." ON public.scores ALL USING (
  auth.uid() = judge_id
);
CREATE POLICY "Admins can view all scores." ON public.scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions: Judges can manage their own, Admins can view all
ALTER TABLE public.category_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Judges can manage their own submissions." ON public.category_submissions ALL USING (
  auth.uid() = judge_id
);
CREATE POLICY "Admins can view all submissions." ON public.category_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Real-time setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.category_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

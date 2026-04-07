-- Create the new scores table for individual criterion scores
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  criterion_id UUID REFERENCES public.category_criteria(id) ON DELETE CASCADE NOT NULL,
  score_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to ensure one score per judge/candidate/category/criterion combination
ALTER TABLE public.scores ADD CONSTRAINT scores_unique_judge_candidate_category UNIQUE (judge_id, candidate_id, category_id, criterion_id);

-- Create index for better performance
CREATE INDEX idx_scores_judge_category ON public.scores (judge_id, category_id);
CREATE INDEX idx_scores_candidate ON public.scores (candidate_id);

-- RLS Policies for scores table
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Judges can view and manage their own scores
CREATE POLICY "Judges can view all scores in their categories" ON public.scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'judge')
);

CREATE POLICY "Judges can insert their own scores" ON public.scores FOR INSERT WITH CHECK (
  auth.uid() = judge_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'judge')
);

CREATE POLICY "Judges can update their own scores" ON public.scores FOR UPDATE USING (
  auth.uid() = judge_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'judge')
);

-- Admins can manage all scores
CREATE POLICY "Admins can manage all scores" ON public.scores ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
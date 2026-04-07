-- SEED DATA FOR PAGEANT TABULATION SYSTEM

-- 1. Categories and Criteria
-- Best in Talent
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('talent', 'Best in Talent', 'main') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Performance', 50, 1 FROM public.categories WHERE category_key = 'talent'
UNION ALL
SELECT id, 'Execution', 30, 2 FROM public.categories WHERE category_key = 'talent'
UNION ALL
SELECT id, 'Overall Impact', 20, 3 FROM public.categories WHERE category_key = 'talent'
ON CONFLICT DO NOTHING;

-- Parade of Festival Costume
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('costume', 'Parade of Festival Costume', 'main') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Design & Creativity', 40, 1 FROM public.categories WHERE category_key = 'costume'
UNION ALL
SELECT id, 'Poise & Bearing', 40, 2 FROM public.categories WHERE category_key = 'costume'
UNION ALL
SELECT id, 'Overall Impact', 20, 3 FROM public.categories WHERE category_key = 'costume'
ON CONFLICT DO NOTHING;

-- Production Number
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('production', 'Production Number', 'main') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Stage Presence', 50, 1 FROM public.categories WHERE category_key = 'production'
UNION ALL
SELECT id, 'Mastery', 30, 2 FROM public.categories WHERE category_key = 'production'
UNION ALL
SELECT id, 'Overall Impact', 20, 3 FROM public.categories WHERE category_key = 'production'
ON CONFLICT DO NOTHING;

-- Best in Swimsuit
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('swimsuit', 'Best in Swimsuit', 'main') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Beauty of Face', 30, 1 FROM public.categories WHERE category_key = 'swimsuit'
UNION ALL
SELECT id, 'Figure & Fitness', 40, 2 FROM public.categories WHERE category_key = 'swimsuit'
UNION ALL
SELECT id, 'Poise & Confidence', 30, 3 FROM public.categories WHERE category_key = 'swimsuit'
ON CONFLICT DO NOTHING;

-- Best in Long Gown
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('long-gown', 'Best in Long Gown', 'main') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Beauty of Face', 30, 1 FROM public.categories WHERE category_key = 'long-gown'
UNION ALL
SELECT id, 'Gown Design & Fit', 40, 2 FROM public.categories WHERE category_key = 'long-gown'
UNION ALL
SELECT id, 'Elegance & Poise', 30, 3 FROM public.categories WHERE category_key = 'long-gown'
ON CONFLICT DO NOTHING;

-- Question and Answer (Top 14)
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('qa-top14', 'Question and Answer (Top 14)', 'top14') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Intelligence & Wit', 50, 1 FROM public.categories WHERE category_key = 'qa-top14'
UNION ALL
SELECT id, 'Delivery & Confidence', 30, 2 FROM public.categories WHERE category_key = 'qa-top14'
UNION ALL
SELECT id, 'Overall Impact', 20, 3 FROM public.categories WHERE category_key = 'qa-top14'
ON CONFLICT DO NOTHING;

-- Best in Long Gown (Top 5)
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('long-gown-top5', 'Best in Long Gown (Top 5)', 'top5') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Elegance & Poise', 50, 1 FROM public.categories WHERE category_key = 'long-gown-top5'
UNION ALL
SELECT id, 'Gown Design', 30, 2 FROM public.categories WHERE category_key = 'long-gown-top5'
UNION ALL
SELECT id, 'Overall Impact', 20, 3 FROM public.categories WHERE category_key = 'long-gown-top5'
ON CONFLICT DO NOTHING;

-- Question and Answer (Top 5)
INSERT INTO public.categories (category_key, category_name, stage_type) 
VALUES ('qa-top5', 'Question and Answer (Top 5)', 'top5') ON CONFLICT (category_key) DO NOTHING;

INSERT INTO public.category_criteria (category_id, criterion_name, weight_value, display_order)
SELECT id, 'Intelligence & Wit', 60, 1 FROM public.categories WHERE category_key = 'qa-top5'
UNION ALL
SELECT id, 'Delivery & Poise', 40, 2 FROM public.categories WHERE category_key = 'qa-top5'
ON CONFLICT DO NOTHING;

-- 2. Sample Candidates
INSERT INTO public.candidates (candidate_number, candidate_name, country_name, is_top14, is_top5)
VALUES 
(1, 'Maria Santos', 'Philippines', TRUE, TRUE),
(2, 'Jane Doe', 'USA', TRUE, TRUE),
(3, 'Yuki Tanaka', 'Japan', TRUE, TRUE),
(4, 'Sofia Rodriguez', 'Mexico', TRUE, TRUE),
(5, 'Amina Bello', 'Nigeria', TRUE, TRUE),
(6, 'Elena Ivanova', 'Russia', TRUE, FALSE),
(7, 'Isabella Rossi', 'Italy', TRUE, FALSE),
(8, 'Chloe Dubois', 'France', TRUE, FALSE),
(9, 'Ananya Sharma', 'India', TRUE, FALSE),
(10, 'Linh Nguyen', 'Vietnam', TRUE, FALSE),
(11, 'Beatriz Silva', 'Brazil', TRUE, FALSE),
(12, 'Fatima Al-Sayed', 'Egypt', TRUE, FALSE),
(13, 'Grace O''Malley', 'Ireland', TRUE, FALSE),
(14, 'Kiara Mbeki', 'South Africa', TRUE, FALSE),
(15, 'Olivia Wilson', 'Australia', FALSE, FALSE)
ON CONFLICT DO NOTHING;

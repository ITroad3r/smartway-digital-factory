-- Add SEO fields to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS seo_title_fr text,
  ADD COLUMN IF NOT EXISTS seo_description_en text,
  ADD COLUMN IF NOT EXISTS seo_description_fr text,
  ADD COLUMN IF NOT EXISTS seo_keywords text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS og_title_en text,
  ADD COLUMN IF NOT EXISTS og_title_fr text,
  ADD COLUMN IF NOT EXISTS og_description_en text,
  ADD COLUMN IF NOT EXISTS og_description_fr text,
  ADD COLUMN IF NOT EXISTS twitter_card text DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS h1_en text,
  ADD COLUMN IF NOT EXISTS h1_fr text,
  ADD COLUMN IF NOT EXISTS h2_en text,
  ADD COLUMN IF NOT EXISTS h2_fr text,
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS meta_robots text DEFAULT 'index,follow',
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer,
  ADD COLUMN IF NOT EXISTS structured_data_type text DEFAULT 'Article';

-- Add site-wide SEO defaults
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS default_seo_title_en text,
  ADD COLUMN IF NOT EXISTS default_seo_title_fr text,
  ADD COLUMN IF NOT EXISTS default_seo_description_en text,
  ADD COLUMN IF NOT EXISTS default_seo_description_fr text,
  ADD COLUMN IF NOT EXISTS default_og_image text,
  ADD COLUMN IF NOT EXISTS site_name text DEFAULT 'Smartway',
  ADD COLUMN IF NOT EXISTS twitter_handle text,
  ADD COLUMN IF NOT EXISTS organization_name text DEFAULT 'Smartway',
  ADD COLUMN IF NOT EXISTS organization_logo text;
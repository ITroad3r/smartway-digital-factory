ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug_fr text;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_fr_key ON public.blog_posts (slug_fr) WHERE slug_fr IS NOT NULL;
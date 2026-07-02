
-- INDUSTRIES
CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  title_en TEXT NOT NULL,
  title_fr TEXT,
  tagline_en TEXT,
  tagline_fr TEXT,
  description_en TEXT,
  description_fr TEXT,
  challenges_en JSONB DEFAULT '[]'::jsonb,
  challenges_fr JSONB DEFAULT '[]'::jsonb,
  solutions_en JSONB DEFAULT '[]'::jsonb,
  solutions_fr JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  seo_title_en TEXT, seo_title_fr TEXT,
  seo_description_en TEXT, seo_description_fr TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.industries TO anon, authenticated;
GRANT ALL ON public.industries TO authenticated;
GRANT ALL ON public.industries TO service_role;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read industries" ON public.industries FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage industries" ON public.industries FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_industries_updated BEFORE UPDATE ON public.industries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CASE STUDIES
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  client_name TEXT,
  industry TEXT,
  services TEXT[],
  title_en TEXT NOT NULL, title_fr TEXT,
  summary_en TEXT, summary_fr TEXT,
  challenge_en TEXT, challenge_fr TEXT,
  solution_en TEXT, solution_fr TEXT,
  results_en JSONB DEFAULT '[]'::jsonb, results_fr JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT, gallery TEXT[],
  seo_title_en TEXT, seo_title_fr TEXT,
  seo_description_en TEXT, seo_description_fr TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_studies TO anon, authenticated;
GRANT ALL ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read case_studies" ON public.case_studies FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage case_studies" ON public.case_studies FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_case_studies_updated BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RESOURCES (guides, whitepapers, ebooks, videos)
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  resource_type TEXT NOT NULL DEFAULT 'guide',
  category TEXT,
  title_en TEXT NOT NULL, title_fr TEXT,
  description_en TEXT, description_fr TEXT,
  cover_image TEXT,
  download_url TEXT,
  external_url TEXT,
  cta_label_en TEXT, cta_label_fr TEXT,
  seo_title_en TEXT, seo_title_fr TEXT,
  seo_description_en TEXT, seo_description_fr TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon, authenticated;
GRANT ALL ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_resources_updated BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAQS
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  page_scope TEXT DEFAULT 'general',
  question_en TEXT NOT NULL, question_fr TEXT,
  answer_en TEXT NOT NULL, answer_fr TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage faqs" ON public.faqs FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LEGAL PAGES (Privacy, Terms, Cookies, etc.)
CREATE TABLE public.legal_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title_en TEXT NOT NULL, title_fr TEXT,
  content_en TEXT, content_fr TEXT,
  effective_date DATE,
  seo_title_en TEXT, seo_title_fr TEXT,
  seo_description_en TEXT, seo_description_fr TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT ALL ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read legal_pages" ON public.legal_pages FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage legal_pages" ON public.legal_pages FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_legal_pages_updated BEFORE UPDATE ON public.legal_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

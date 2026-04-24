CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP POLICY IF EXISTS "Anyone can submit" ON public.contact_submissions;
CREATE POLICY "Anyone can submit valid contact" ON public.contact_submissions
  FOR INSERT WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 200
    AND email LIKE '%_@_%'
    AND char_length(message) BETWEEN 1 AND 5000
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (
    char_length(email) BETWEEN 3 AND 200
    AND email LIKE '%_@_%'
  );
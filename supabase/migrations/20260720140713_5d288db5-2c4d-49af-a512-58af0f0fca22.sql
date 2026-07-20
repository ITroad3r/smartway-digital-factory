
CREATE TABLE public.smartway_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  service_interest TEXT NOT NULL,
  qualifying_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  company_size TEXT,
  region TEXT,
  industry TEXT,
  preferred_followup TEXT NOT NULL DEFAULT 'phone_call',
  status TEXT NOT NULL DEFAULT 'awaiting_sales_call',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  next_follow_up_at TIMESTAMPTZ,
  requires_human_followup BOOLEAN NOT NULL DEFAULT false,
  source_url TEXT,
  locale TEXT NOT NULL DEFAULT 'fr',
  free_text TEXT,
  notes TEXT,
  ip_hash TEXT,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT smartway_leads_status_chk CHECK (status IN ('awaiting_sales_call','assigned','call_attempted','contacted','qualified','proposal_sent','won','lost','archived')),
  CONSTRAINT smartway_leads_priority_chk CHECK (priority IN ('low','normal','high'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.smartway_leads TO authenticated;
GRANT ALL ON public.smartway_leads TO service_role;
ALTER TABLE public.smartway_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers and admins full access to leads"
  ON public.smartway_leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_manager'));

CREATE POLICY "Sales agents view unassigned or own leads"
  ON public.smartway_leads FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'sales_agent')
    AND (assigned_to IS NULL OR assigned_to = auth.uid())
  );

CREATE POLICY "Sales agents update own or claim unassigned"
  ON public.smartway_leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'sales_agent') AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  WITH CHECK (public.has_role(auth.uid(),'sales_agent') AND assigned_to = auth.uid());

CREATE INDEX idx_leads_status ON public.smartway_leads(status);
CREATE INDEX idx_leads_assigned ON public.smartway_leads(assigned_to);
CREATE INDEX idx_leads_created ON public.smartway_leads(created_at DESC);

CREATE TRIGGER trg_smartway_leads_updated_at
  BEFORE UPDATE ON public.smartway_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.smartway_leads(id) ON DELETE CASCADE,
  actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities readable if lead readable"
  ON public.lead_activities FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.smartway_leads l WHERE l.id = lead_id));

CREATE POLICY "Activities insert by actor on accessible lead"
  ON public.lead_activities FOR INSERT TO authenticated
  WITH CHECK (
    actor = auth.uid()
    AND EXISTS (SELECT 1 FROM public.smartway_leads l WHERE l.id = lead_id)
  );

CREATE INDEX idx_activities_lead ON public.lead_activities(lead_id, created_at DESC);

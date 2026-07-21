
-- Make company optional
ALTER TABLE public.smartway_leads ALTER COLUMN company DROP NOT NULL;

-- Add request_type column
ALTER TABLE public.smartway_leads
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'service_enquiry';

ALTER TABLE public.smartway_leads DROP CONSTRAINT IF EXISTS smartway_leads_request_type_chk;
ALTER TABLE public.smartway_leads
  ADD CONSTRAINT smartway_leads_request_type_chk
  CHECK (request_type IN ('service_enquiry','support_request'));

-- Expand status to include awaiting_support
ALTER TABLE public.smartway_leads DROP CONSTRAINT IF EXISTS smartway_leads_status_chk;
ALTER TABLE public.smartway_leads
  ADD CONSTRAINT smartway_leads_status_chk
  CHECK (status IN (
    'awaiting_sales_call','awaiting_support','assigned','call_attempted','contacted',
    'qualified','proposal_sent','won','lost','archived'
  ));

-- Remove policies that reference non-existent roles (sales_agent / sales_manager),
-- keep clean admin-only access.
DROP POLICY IF EXISTS "Managers and admins full access to leads" ON public.smartway_leads;
DROP POLICY IF EXISTS "Sales agents view unassigned or own leads" ON public.smartway_leads;
DROP POLICY IF EXISTS "Sales agents update own or claim unassigned" ON public.smartway_leads;

CREATE POLICY "Admins full access to leads"
  ON public.smartway_leads
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure activities readable/insertable by admins
DROP POLICY IF EXISTS "Activities readable if lead readable" ON public.lead_activities;
DROP POLICY IF EXISTS "Activities insert by actor on accessible lead" ON public.lead_activities;

CREATE POLICY "Admins read activities"
  ON public.lead_activities
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert activities"
  ON public.lead_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND actor = auth.uid());

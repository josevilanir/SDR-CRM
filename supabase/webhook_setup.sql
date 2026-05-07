-- =============================================================================
-- Database Webhook Setup for Lead Automation
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Replace the two placeholder values below before running.
-- =============================================================================

-- Step 1: Enable pg_net extension (required for HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Create the trigger function
-- IMPORTANT: Replace <YOUR_SUPABASE_URL> and <YOUR_SERVICE_ROLE_KEY> below.
-- Find them in: Dashboard → Settings → API
CREATE OR REPLACE FUNCTION public.trigger_lead_automation()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Only fire when status actually changes (or on INSERT)
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    payload := jsonb_build_object(
      'type',       TG_OP,
      'record',     row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    );

    PERFORM net.http_post(
      url     := '<YOUR_SUPABASE_URL>/functions/v1/handle-lead-automation',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
      ),
      body    := payload::text
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Step 3: Attach the trigger to the leads table
DROP TRIGGER IF EXISTS on_lead_status_change ON public.leads;
CREATE TRIGGER on_lead_status_change
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trigger_lead_automation();

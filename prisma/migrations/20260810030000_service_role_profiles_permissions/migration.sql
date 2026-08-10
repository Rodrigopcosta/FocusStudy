-- The backend uses Supabase service_role for subscription updates.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

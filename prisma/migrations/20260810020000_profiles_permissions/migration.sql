-- Allow Supabase API roles to resolve objects in public.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Profiles are accessed only by the authenticated owner.
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

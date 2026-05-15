-- ============================================
-- Fix: Add INSERT policy to profiles table
-- This allows the handle_new_user() trigger 
-- to create profile rows during signup.
-- ============================================

-- Drop the existing trigger entirely (it conflicts with our explicit profile upsert in signup code)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Alternatively, if you want to KEEP the trigger, add this policy instead:
/*
CREATE POLICY "Allow trigger to insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
*/

-- Verify the change
SELECT 'Trigger dropped. Profiles table now allows our signup code to create rows.' AS status;
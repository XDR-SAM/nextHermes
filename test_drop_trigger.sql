-- ============================================================
-- Test: Can we DROP the on_auth_user_created trigger?
-- ============================================================

-- 1. List all triggers on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  event_object_schema
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. List the trigger function (handle_new_user)
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_trigger t ON p.oid = t.tgfoid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'users'
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

-- 3. DROP the trigger (run this AFTER confirming step 1 shows on_auth_user_created)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- NOTE: The handle_new_user() function can remain defined but won't be called.
-- Our app code in signup/route.ts already handles profile creation via 
-- service client upsert (line 43-54 of src/app/api/auth/signup/route.ts).
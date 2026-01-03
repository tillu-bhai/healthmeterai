
-- Step 1: Drop ALL policies on community_messages first
DROP POLICY IF EXISTS "Members can view community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.community_messages;

-- Step 2: Drop existing RLS policies on communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Admins can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Admins can delete their communities" ON public.communities;
DROP POLICY IF EXISTS "Users can view public or member communities" ON public.communities;

-- Step 3: Drop existing RLS policies on community_members
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.community_members;
DROP POLICY IF EXISTS "Anyone can view public community members" ON public.community_members;
DROP POLICY IF EXISTS "Users can join public communities as member" ON public.community_members;
DROP POLICY IF EXISTS "Community creators can add themselves as admin" ON public.community_members;

-- Step 4: Now alter columns from uuid to text
ALTER TABLE public.communities ALTER COLUMN created_by TYPE text USING created_by::text;
ALTER TABLE public.community_members ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.community_messages ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 5: Create permissive RLS policies for communities
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Anyone can create communities" ON public.communities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update communities" ON public.communities FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete communities" ON public.communities FOR DELETE USING (true);

-- Step 6: Create permissive RLS policies for community_members
CREATE POLICY "Anyone can view members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join communities" ON public.community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can leave communities" ON public.community_members FOR DELETE USING (true);
CREATE POLICY "Anyone can update membership" ON public.community_members FOR UPDATE USING (true);

-- Step 7: Create permissive RLS policies for community_messages
CREATE POLICY "Anyone can view messages" ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON public.community_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete messages" ON public.community_messages FOR DELETE USING (true);

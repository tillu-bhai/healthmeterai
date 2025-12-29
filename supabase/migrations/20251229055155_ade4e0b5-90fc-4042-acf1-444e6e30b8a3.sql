-- Fix 1: Replace overly permissive communities SELECT policy
-- This ensures private communities are only visible to their members
DROP POLICY IF EXISTS "Anyone can view all communities" ON public.communities;

CREATE POLICY "Users can view public or member communities" 
ON public.communities 
FOR SELECT 
TO public
USING (
  is_public = true 
  OR auth.uid() = created_by
  OR EXISTS (
    SELECT 1 FROM public.community_members 
    WHERE community_members.community_id = communities.id 
    AND community_members.user_id = auth.uid()
  )
);

-- Fix 2: Update community_members INSERT policy to prevent role escalation
-- Users can only join with 'member' role (admins are assigned via trigger or creator logic)
DROP POLICY IF EXISTS "Users can join public communities" ON public.community_members;

CREATE POLICY "Users can join public communities as member" 
ON public.community_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'member'
  AND (
    EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.is_public = true)
    OR EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.created_by = auth.uid())
  )
);

-- Create a separate policy for community creators to assign themselves as admin
CREATE POLICY "Community creators can add themselves as admin" 
ON public.community_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin'
  AND EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.created_by = auth.uid())
);
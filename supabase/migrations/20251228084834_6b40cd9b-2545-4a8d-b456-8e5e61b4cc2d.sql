-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;

-- Create a security definer function to check if user is member of a community
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_members
    WHERE user_id = _user_id
      AND community_id = _community_id
  )
$$;

-- Create a security definer function to check if community is public
CREATE OR REPLACE FUNCTION public.is_public_community(_community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities
    WHERE id = _community_id
      AND is_public = true
  )
$$;

-- New policy: Users can always view their own membership rows
CREATE POLICY "Users can view own memberships"
ON public.community_members
FOR SELECT
USING (user_id = auth.uid());

-- New policy: Users can view members of public communities
CREATE POLICY "Anyone can view public community members"
ON public.community_members
FOR SELECT
USING (public.is_public_community(community_id));
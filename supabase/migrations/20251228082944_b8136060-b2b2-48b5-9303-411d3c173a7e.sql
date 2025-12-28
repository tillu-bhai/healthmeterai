-- Add message_type and media_url columns to community_messages
ALTER TABLE public.community_messages 
ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Update RLS policy for communities to allow everyone to view all communities
DROP POLICY IF EXISTS "Anyone can view public communities" ON public.communities;

CREATE POLICY "Anyone can view all communities" 
ON public.communities 
FOR SELECT 
TO public
USING (true);

-- Enable realtime for communities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.communities;

-- Create storage policies for community message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-attachments', 'community-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to community-attachments
CREATE POLICY "Authenticated users can upload community attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-attachments');

-- Allow anyone to view community attachments
CREATE POLICY "Anyone can view community attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-attachments');

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete own community attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
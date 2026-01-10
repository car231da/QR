-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Allow public read access to uploaded files
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow anyone to upload files (no auth required for this app)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Create a table to track uploaded files and their QR codes
CREATE TABLE public.file_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on file_uploads
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for file_uploads (no auth required)
CREATE POLICY "Public read access for file_uploads"
ON public.file_uploads FOR SELECT
USING (true);

CREATE POLICY "Public insert access for file_uploads"
ON public.file_uploads FOR INSERT
WITH CHECK (true);
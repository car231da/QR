-- Create table for text messages
CREATE TABLE public.text_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.text_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public insert access for text_messages" 
ON public.text_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public read access for text_messages" 
ON public.text_messages 
FOR SELECT 
USING (true);
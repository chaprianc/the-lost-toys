-- Create toy status enum
CREATE TYPE public.toy_status AS ENUM ('available', 'sold', 'hidden');

-- Create toy category enum
CREATE TYPE public.toy_category AS ENUM ('vehicles', 'dolls', 'board-games', 'outdoor', 'educational', 'other');

-- Create toy condition enum
CREATE TYPE public.toy_condition AS ENUM ('new', 'like-new', 'used');

-- Create toys table
CREATE TABLE public.toys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  toy_name TEXT NOT NULL,
  category public.toy_category NOT NULL,
  condition public.toy_condition NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  city TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  status public.toy_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.toys ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view available toys)
CREATE POLICY "Anyone can view available toys" 
ON public.toys 
FOR SELECT 
USING (status = 'available');

-- Create policy for inserting toys (anyone can publish - no auth required for MVP)
CREATE POLICY "Anyone can publish toys" 
ON public.toys 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin access (for now, allow all updates/deletes - will be secured later)
CREATE POLICY "Allow all updates for admin" 
ON public.toys 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow all deletes for admin" 
ON public.toys 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_toys_updated_at
BEFORE UPDATE ON public.toys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for toy images
INSERT INTO storage.buckets (id, name, public) VALUES ('toy-images', 'toy-images', true);

-- Create storage policy for public access to images
CREATE POLICY "Anyone can view toy images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'toy-images');

-- Create storage policy for uploading images
CREATE POLICY "Anyone can upload toy images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'toy-images');
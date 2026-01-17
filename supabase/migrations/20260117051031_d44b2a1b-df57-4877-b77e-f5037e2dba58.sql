-- Create seller reviews table
CREATE TABLE public.seller_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_phone TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reviews
CREATE POLICY "Anyone can view reviews"
ON public.seller_reviews
FOR SELECT
USING (true);

-- Allow anyone to add reviews
CREATE POLICY "Anyone can add reviews"
ON public.seller_reviews
FOR INSERT
WITH CHECK (true);

-- Create index for faster seller lookups
CREATE INDEX idx_seller_reviews_phone ON public.seller_reviews(seller_phone);
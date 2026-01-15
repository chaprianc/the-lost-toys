-- Create a table for blocked phone numbers
CREATE TABLE public.blocked_phones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_by TEXT DEFAULT 'admin'
);

-- Enable Row Level Security
ALTER TABLE public.blocked_phones ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow all selects for blocked_phones"
ON public.blocked_phones
FOR SELECT
USING (true);

CREATE POLICY "Allow all inserts for blocked_phones"
ON public.blocked_phones
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all deletes for blocked_phones"
ON public.blocked_phones
FOR DELETE
USING (true);
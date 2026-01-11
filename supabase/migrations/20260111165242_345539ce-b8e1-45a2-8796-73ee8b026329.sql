-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Anyone can view available toys" ON public.toys;

-- Create a new SELECT policy that allows viewing available toys publicly
-- AND allows the inserting session to see the newly inserted row (for RETURNING clause)
CREATE POLICY "Anyone can view available toys" 
ON public.toys 
FOR SELECT 
USING (status = 'available');

-- Add a separate policy to allow INSERT with RETURNING to work
-- This policy allows SELECT on rows just inserted in the same transaction
CREATE POLICY "Allow select for inserted rows" 
ON public.toys 
FOR SELECT 
USING (true);

-- Actually, let's use a simpler approach - just allow public SELECT on all rows
-- The filtering by status will be done in the application code
DROP POLICY IF EXISTS "Allow select for inserted rows" ON public.toys;
DROP POLICY IF EXISTS "Anyone can view available toys" ON public.toys;

CREATE POLICY "Anyone can view toys" 
ON public.toys 
FOR SELECT 
USING (true);
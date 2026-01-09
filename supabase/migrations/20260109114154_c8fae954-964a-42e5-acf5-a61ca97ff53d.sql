-- Change default status for new toys to 'hidden' (pending approval)
ALTER TABLE public.toys ALTER COLUMN status SET DEFAULT 'hidden'::toy_status;
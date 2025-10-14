-- Create self_evaluations table
CREATE TABLE public.self_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.self_evaluations ENABLE ROW LEVEL SECURITY;

-- Users can view their own self-evaluation
CREATE POLICY "Users can view own self-evaluation"
ON public.self_evaluations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own self-evaluation (only one)
CREATE POLICY "Users can create own self-evaluation"
ON public.self_evaluations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM public.self_evaluations
    WHERE user_id = auth.uid()
  )
);

-- Users can update their own self-evaluation
CREATE POLICY "Users can update own self-evaluation"
ON public.self_evaluations
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all self-evaluations
CREATE POLICY "Admins can view all self-evaluations"
ON public.self_evaluations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_self_evaluations_updated_at
BEFORE UPDATE ON public.self_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
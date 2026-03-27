-- Add duration_options column to store the user's configurable list of duration choices.
-- Jobs store duration as a plain integer (minutes), not a foreign key, so this is purely
-- a "menu of choices" for the UI — deleting an option never breaks existing jobs.

ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS duration_options JSONB DEFAULT '[
  {"name": "15 min", "minutes": 15},
  {"name": "30 min", "minutes": 30},
  {"name": "45 min", "minutes": 45},
  {"name": "1 hr",   "minutes": 60},
  {"name": "1.5 hr", "minutes": 90},
  {"name": "2 hr",   "minutes": 120},
  {"name": "3 hr",   "minutes": 180},
  {"name": "4 hr",   "minutes": 240}
]'::jsonb;

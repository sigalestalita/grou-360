-- Add password_changed column to profiles table
ALTER TABLE profiles 
ADD COLUMN password_changed BOOLEAN NOT NULL DEFAULT false;
-- Fix RLS policies for chats table
-- Execute this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;

-- More permissive policy for creating chats
-- Allow authenticated users to create chats
CREATE POLICY "Authenticated users can create chats" 
  ON public.chats FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to update chats they created
CREATE POLICY "Users can update their own chats" 
  ON public.chats FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Similarly, fix policies for chat_members
DROP POLICY IF EXISTS "Users can join chats" ON public.chat_members;

CREATE POLICY "Authenticated users can join chats" 
  ON public.chat_members FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Fix policies for messages too
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Authenticated users can send messages" 
  ON public.messages FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Verify the policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_members', 'messages')
ORDER BY tablename, policyname;



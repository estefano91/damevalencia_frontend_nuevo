# Fix Messages System - Instructions

## Problem
The error "couldn't find the table public chat_members in schema cache" occurs because the messaging tables haven't been created in your Supabase database.

## Solution
Execute the SQL script in your Supabase dashboard.

## Steps

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor

### 2. Copy and execute this SQL

```sql
-- FIX MESSAGES SYSTEM - Execute this in Supabase SQL Editor
-- This creates the necessary tables for the messaging system

-- Step 1: Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'group')),
  name TEXT,
  description TEXT,
  sport TEXT,
  country TEXT,
  opportunity_type TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create chat_members table
CREATE TABLE IF NOT EXISTS public.chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(chat_id, user_id)
);

-- Step 3: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  translated_content JSONB,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'video', 'image', 'file', 'system')),
  read_by JSONB DEFAULT '[]'::jsonb,
  translated BOOLEAN DEFAULT FALSE,
  original_language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view their chat memberships" ON public.chat_members;
DROP POLICY IF EXISTS "Users can join chats" ON public.chat_members;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Step 6: Policies for chats
CREATE POLICY "Users can view their own chats" 
  ON public.chats FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members 
      WHERE public.chat_members.chat_id = public.chats.id 
      AND public.chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" 
  ON public.chats FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own chats" 
  ON public.chats FOR UPDATE 
  USING (auth.uid() = created_by);

-- Step 7: Policies for chat_members
CREATE POLICY "Users can view their chat memberships" 
  ON public.chat_members FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join chats" 
  ON public.chat_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 8: Policies for messages
CREATE POLICY "Users can view messages" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members 
      WHERE public.chat_members.chat_id = public.messages.chat_id 
      AND public.chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id);

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON public.chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Step 10: Verify tables were created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('chats', 'chat_members', 'messages')
ORDER BY table_name, ordinal_position;
```

### 3. Verify Success
After running the SQL, you should see the results showing the three tables were created.

### 4. Test the App
1. Refresh your app at https://aura-sports-app.web.app
2. Go to Discover
3. Click "Send Message" on any profile
4. The chat should now be created successfully!

## What this fixes:
- ✅ Creates `chats` table
- ✅ Creates `chat_members` table
- ✅ Creates `messages` table
- ✅ Sets up Row Level Security (RLS)
- ✅ Creates proper policies for user access
- ✅ Creates indexes for performance

After running this SQL, your messaging system will be fully functional!



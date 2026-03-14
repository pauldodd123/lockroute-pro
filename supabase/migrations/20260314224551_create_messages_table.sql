-- Messages table for contact forms, feature requests, and help requests
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('contact', 'feature_request', 'help')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous inserts (public forms, no auth required)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit messages"
    ON messages FOR INSERT
    WITH CHECK (true);

-- Only authenticated service_role can read/update/delete (for future admin page)
CREATE POLICY "Service role can manage messages"
    ON messages FOR ALL
    USING (auth.role() = 'service_role');

-- Index for admin queries
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Create notifications table for listing approvals and other notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('listing_approved', 'listing_rejected', 'booking_request', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to insert notifications (for admin approval system)
CREATE POLICY "Service role can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to send notification when listing is approved/rejected
CREATE OR REPLACE FUNCTION notify_listing_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only send notification if approval_status changed
    IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
        IF NEW.approval_status = 'approved' THEN
            INSERT INTO public.notifications (user_id, type, title, message, data)
            VALUES (
                NEW.owner_id,
                'listing_approved',
                'Listing Approved!',
                'Your listing "' || NEW.title || '" has been approved and is now live!',
                jsonb_build_object(
                    'listing_id', NEW.id,
                    'listing_title', NEW.title
                )
            );
        ELSIF NEW.approval_status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, type, title, message, data)
            VALUES (
                NEW.owner_id,
                'listing_rejected',
                'Listing Needs Updates',
                'Your listing "' || NEW.title || '" needs some updates before it can go live.',
                jsonb_build_object(
                    'listing_id', NEW.id,
                    'listing_title', NEW.title
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for listing status changes
DROP TRIGGER IF EXISTS listing_status_notification ON public.listings;
CREATE TRIGGER listing_status_notification
    AFTER UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION notify_listing_status_change();

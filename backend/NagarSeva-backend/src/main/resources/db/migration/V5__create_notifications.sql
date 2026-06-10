CREATE TABLE notifications (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL REFERENCES users(id),
                               complaint_id UUID REFERENCES complaints(id),
                               type VARCHAR(30) NOT NULL,
                               message TEXT,
                               read BOOLEAN DEFAULT false,
                               created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
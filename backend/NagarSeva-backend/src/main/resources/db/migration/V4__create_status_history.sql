CREATE TABLE status_history (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
                                changed_by UUID NOT NULL REFERENCES users(id),
                                from_status VARCHAR(20),
                                to_status VARCHAR(20) NOT NULL,
                                note TEXT,
                                changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_history_complaint ON status_history(complaint_id);
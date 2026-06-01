CREATE TABLE complaints (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            citizen_id UUID NOT NULL REFERENCES users(id),
                            ward_id UUID REFERENCES wards(id),
                            assigned_to UUID REFERENCES users(id),
                            category VARCHAR(30) NOT NULL,
                            title VARCHAR(200) NOT NULL,
                            description TEXT,
                            location geography(POINT, 4326),
                            address_text TEXT,
                            status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                            priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
                            sla_deadline TIMESTAMPTZ,
                            resolved_at TIMESTAMPTZ,
                            created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_complaints_location ON complaints USING GIST(location);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_ward ON complaints(ward_id);
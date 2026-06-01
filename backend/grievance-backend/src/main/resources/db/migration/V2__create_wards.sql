CREATE TABLE wards (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(100) NOT NULL,
                       boundary geography(POLYGON, 4326),
                       sla_hours INTEGER DEFAULT 48,
                       escalation_user_id UUID
);
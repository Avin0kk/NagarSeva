CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash TEXT NOT NULL,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN','OFFICIAL','ADMIN')),
                       full_name VARCHAR(150),
                       phone VARCHAR(20),
                       ward_id UUID,
                       created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
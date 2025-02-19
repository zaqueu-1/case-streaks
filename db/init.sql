CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_accesses INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
);

-- Tabela de acessos
CREATE TABLE IF NOT EXISTS accesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_channel VARCHAR(255)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accesses_user_id ON accesses(user_id);
CREATE INDEX IF NOT EXISTS idx_accesses_timestamp ON accesses(timestamp);
CREATE INDEX IF NOT EXISTS idx_accesses_post_id ON accesses(post_id);

-- Função para calcular dias úteis entre datas (excluindo domingos)
CREATE OR REPLACE FUNCTION working_days_between(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS INTEGER AS $$
DECLARE
    days INTEGER := 0;
    current_date TIMESTAMPTZ := start_date;
BEGIN
    WHILE current_date <= end_date LOOP
        IF EXTRACT(DOW FROM current_date) != 0 THEN
            days := days + 1;
        END IF;
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
    RETURN days - 1;
END;
$$ LANGUAGE plpgsql; 
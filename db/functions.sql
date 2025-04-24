-- Função min para UUID
CREATE OR REPLACE FUNCTION min(uuid) RETURNS uuid AS $$
BEGIN
    RETURN $1;
END;
$$ LANGUAGE plpgsql;

-- Função round para double precision
CREATE OR REPLACE FUNCTION round(double precision, integer) RETURNS numeric AS $$
BEGIN
    RETURN round($1::numeric, $2);
END;
$$ LANGUAGE plpgsql; 
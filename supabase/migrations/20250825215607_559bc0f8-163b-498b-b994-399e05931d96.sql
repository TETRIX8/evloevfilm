-- Создаем таблицу для хранения временных email кодов
CREATE TABLE public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индекс для быстрого поиска по email и коду
CREATE INDEX idx_email_verification_codes_email_code ON public.email_verification_codes(email, code);
CREATE INDEX idx_email_verification_codes_expires_at ON public.email_verification_codes(expires_at);

-- Создаем функцию для очистки устаревших кодов
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.email_verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Включаем RLS
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS - только система может управлять кодами
CREATE POLICY "Service role can manage verification codes" 
ON public.email_verification_codes 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
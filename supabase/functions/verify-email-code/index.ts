import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyCodeRequest {
  email: string;
  code: string;
  type: 'registration' | 'password_reset';
  password?: string; // Для регистрации или сброса пароля
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type, password }: VerifyCodeRequest = await req.json();

    // Создаем Supabase клиент с service role ключом
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Проверяем код
    const { data: codeData, error: codeError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ 
        error: "Неверный или истекший код" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Отмечаем код как использованный
    await supabase
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    let result: any = { success: true };

    if (type === 'registration') {
      if (!password) {
        return new Response(JSON.stringify({ 
          error: "Пароль обязателен для регистрации" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Создаем пользователя
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // Автоматически подтверждаем email
      });

      if (authError) {
        console.error("Auth error:", authError);
        return new Response(JSON.stringify({ 
          error: "Ошибка при создании аккаунта" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      result.message = "Аккаунт успешно создан";
      result.user = authData.user;

    } else if (type === 'password_reset') {
      // Генерируем временный токен для смены пароля
      result.message = "Код подтвержден. Можете установить новый пароль";
      result.verified = true;
      result.email = email;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in verify-email-code function:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
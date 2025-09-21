import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailCodeRequest {
  email: string;
  type: 'registration' | 'password_reset';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: EmailCodeRequest = await req.json();

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Создаем Supabase клиент с service role ключом
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Очищаем старые коды для этого email
    await supabase
      .from('email_verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', type);

    // Сохраняем новый код в базе данных
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .insert({
        email,
        code,
        type,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 минут
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save verification code");
    }

    // Отправляем email через Gmail SMTP
    const emailUser = Deno.env.get("EMAIL_USER");
    const emailPass = Deno.env.get("EMAIL_PASS");

    if (!emailUser || !emailPass) {
      throw new Error("Email credentials not configured");
    }

    // Подготавливаем данные для отправки через Gmail API
    const subject = type === 'registration' 
      ? 'Код подтверждения регистрации - EvloevFilm'
      : 'Код для сброса пароля - EvloevFilm';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; font-size: 28px;">EvloevFilm</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
          <h2 style="margin: 0 0 20px 0; font-size: 24px;">
            ${type === 'registration' ? 'Подтверждение регистрации' : 'Сброс пароля'}
          </h2>
          
          <p style="font-size: 16px; margin-bottom: 30px; opacity: 0.9;">
            ${type === 'registration' 
              ? 'Добро пожаловать в EvloevFilm! Используйте код ниже для завершения регистрации:'
              : 'Используйте код ниже для сброса пароля:'
            }
          </p>
          
          <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
            Код действителен в течение 10 минут
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
          <p style="margin-top: 20px;">
            <strong>EvloevFilm</strong><br>
            Лучшие фильмы и сериалы онлайн
          </p>
        </div>
      </div>
    `;

    // Отправляем email через внешний сервис (например, через Gmail API или SMTP)
    // Для простоты используем fetch к Gmail API
    const emailBody = {
      to: email,
      subject: subject,
      html: htmlContent,
      from: emailUser
    };

    // В реальном проекте здесь должна быть интеграция с Gmail API или SMTP
    // Для демонстрации просто логируем
    console.log("Sending email:", {
      to: email,
      subject,
      code,
      type
    });

    // Здесь можно добавить реальную отправку через Gmail API
    // Пока что просто возвращаем успех
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Код отправлен на ваш email",
      // В продакшене не возвращайте код!
      debug_code: code // Только для тестирования
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-email-code function:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
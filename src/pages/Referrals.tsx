import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserPlus, Users, Link, Share, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Referrals() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("referral_code, referred_user_id")
        .eq("referrer_id", (await supabase.auth.getUser()).data.user?.id);

      if (referralsError) throw referralsError;

      if (referralsData && referralsData.length > 0) {
        setReferralCode(referralsData[0].referral_code);
        // Count completed referrals
        const completedReferrals = referralsData.filter(r => r.referred_user_id).length;
        setReferralCount(completedReferrals);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Не удалось загрузить данные о рефералах");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("generate_referral_code", {
        user_id: user.id,
      });

      if (error) throw error;
      setReferralCode(data);
      toast.success("Реферальный код успешно создан");
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast.error("Не удалось создать реферальный код");
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Ссылка скопирована в буфер обмена");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <motion.h1 
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Реферальная программа
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Приглашайте друзей и получайте бонусы
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Ваша реферальная ссылка
                  </CardTitle>
                  <CardDescription>
                    Поделитесь этой ссылкой с друзьями
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : referralCode ? (
                    <>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                        {`${window.location.origin}/auth?ref=${referralCode}`}
                      </div>
                      <Button 
                        className="w-full gap-2" 
                        onClick={copyReferralLink}
                      >
                        <Share className="h-4 w-4" />
                        Копировать ссылку
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full gap-2" 
                      onClick={generateReferralCode}
                    >
                      <UserPlus className="h-4 w-4" />
                      Создать реферальный код
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Статистика приглашений
                  </CardTitle>
                  <CardDescription>
                    Количество приглашенных пользователей
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="flex items-center justify-center gap-2 text-4xl font-bold">
                        <Users className="h-8 w-8" />
                        {referralCount}
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {referralCount === 0 
                          ? "Пригласите своих первых пользователей!"
                          : "Спасибо за приглашение новых пользователей!"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
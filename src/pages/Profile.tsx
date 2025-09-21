
import { Navigation } from "@/components/navigation/Navigation";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const navigate = useNavigate();
  
  const { user: firebaseUser, loading: firebaseLoading, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    if (firebaseUser) {
      toast.success("Добро пожаловать!");
    }
  }, [firebaseUser]);

  const handleSignOut = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      toast.error("Ошибка при выходе из системы");
    }
  };

  if (firebaseLoading) {
    return (
      <div className="min-h-screen relative">
        <Navigation />
        <main className="container pt-24 pb-16">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* WebGL Background */}
      <AppWebGLBackground />
      
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-xl mx-auto space-y-8">
          {firebaseUser ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/30">
                  <CardTitle className="text-2xl font-cinzel bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                    Профиль
                  </CardTitle>
                  <CardDescription>
                    Управление вашей учетной записью
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={firebaseUser.photoURL || undefined} alt={firebaseUser.displayName || firebaseUser.email || 'User'} />
                      <AvatarFallback className="text-lg">
                        {firebaseUser.displayName ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : firebaseUser.email?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{firebaseUser.displayName || 'Пользователь'}</h3>
                      <p className="text-sm text-muted-foreground">{firebaseUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Управление аккаунтом</h3>
                      <p className="text-sm text-muted-foreground">
                        Для изменения пароля используйте настройки вашего Google аккаунта или функцию восстановления пароля
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={handleSignOut}
                        className="w-full rounded-xl font-medium"
                        size="lg"
                      >
                        Выйти из аккаунта
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <motion.div 
                  initial={{ scale: 0.8 }} 
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-4xl font-bold font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
                    Профиль
                  </h1>
                </motion.div>
                <p className="text-muted-foreground">
                  Войдите или зарегистрируйтесь, чтобы получить доступ к дополнительным возможностям
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-2 border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="space-y-6 text-center">
                      <h2 className="text-2xl font-medium">Требуется авторизация</h2>
                      <p className="text-muted-foreground">
                        Для доступа к данной странице необходимо войти в аккаунт
                      </p>
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="rounded-xl px-8 py-6 h-auto text-lg font-medium"
                      >
                        Войти или зарегистрироваться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

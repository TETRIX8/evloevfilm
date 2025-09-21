
import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();

  // Показываем загрузку
  if (firebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если не авторизован, перенаправляем на страницу входа
  if (!firebaseUser) {
    return <Navigate to="/auth" replace />;
  }

  // Если авторизован, показываем защищенный контент
  return <>{children}</>;
}

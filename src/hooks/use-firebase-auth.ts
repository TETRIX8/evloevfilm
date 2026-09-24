import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/integrations/firebase/config';
import { toast } from 'sonner';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getRedirectResult(auth).catch((error: { code?: string }) => {
      if (error.code) toast.error(getErrorMessage(error.code));
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Успешный вход в систему!');
      return result.user;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      toast.success('Аккаунт успешно создан!');
      return result.user;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        toast.success('Успешный вход через Google!');
        return result.user;
      } catch (error: any) {
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw error;
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      toast.success('Вы успешно вышли из системы');
    } catch (error: any) {
      toast.error('Ошибка при выходе из системы');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
  };
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Пользователь с таким email не найден';
    case 'auth/wrong-password':
      return 'Неверный пароль';
    case 'auth/email-already-in-use':
      return 'Email уже используется';
    case 'auth/weak-password':
      return 'Пароль слишком слабый';
    case 'auth/invalid-email':
      return 'Неверный формат email';
    case 'auth/user-disabled':
      return 'Аккаунт заблокирован';
    case 'auth/too-many-requests':
      return 'Слишком много попыток входа. Попробуйте позже';
    case 'auth/network-request-failed':
      return 'Ошибка сети. Проверьте подключение к интернету';
    case 'auth/popup-closed-by-user':
      return 'Вход отменен пользователем';
    case 'auth/cancelled-popup-request':
      return 'Вход отменен';
    case 'auth/popup-blocked':
      return 'Браузер заблокировал окно Google. Повторите попытку или разрешите всплывающие окна для сайта';
    case 'auth/unauthorized-domain':
      return 'Домен сайта не добавлен в Firebase Auth: добавьте tetrixfilm.ru в Authorized domains';
    case 'auth/operation-not-allowed':
      return 'Вход через Google не включён в Firebase Authentication';
    case 'auth/internal-error':
      return 'Firebase временно не смог завершить вход через Google. Попробуйте ещё раз';
    default:
      return 'Произошла ошибка при авторизации';
  }
}

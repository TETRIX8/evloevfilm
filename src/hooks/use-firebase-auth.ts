import { useEffect, useRef, useState } from 'react';
import {
  ConfirmationResult,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  User,
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
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    void getRedirectResult(auth).catch((error: { code?: string }) => {
      if (error.code) toast.error(getErrorMessage(error.code));
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
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
      if (displayName) await updateProfile(result.user, { displayName });
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

  const sendPhoneCode = async (phoneNumber: string, recaptchaContainerId: string) => {
    try {
      setLoading(true);
      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(recaptchaContainerId, {
          size: 'invisible',
          callback: () => undefined,
          'expired-callback': () => {
            recaptchaVerifier.current?.clear();
            recaptchaVerifier.current = null;
          },
        }, auth);
      }
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
      toast.success('Код отправлен на номер телефона');
      return confirmation;
    } catch (error: any) {
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
      toast.error(getErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPhoneCode = async (confirmation: ConfirmationResult, code: string) => {
    try {
      setLoading(true);
      const result = await confirmation.confirm(code);
      toast.success('Успешный вход по номеру телефона!');
      return result.user;
    } catch (error: any) {
      toast.error(getErrorMessage(error.code));
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
    sendPhoneCode,
    confirmPhoneCode,
    logout,
  };
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found': return 'Пользователь с таким email не найден';
    case 'auth/wrong-password': return 'Неверный пароль';
    case 'auth/email-already-in-use': return 'Email уже используется';
    case 'auth/weak-password': return 'Пароль слишком слабый';
    case 'auth/invalid-email': return 'Неверный формат email';
    case 'auth/user-disabled': return 'Аккаунт заблокирован';
    case 'auth/too-many-requests': return 'Слишком много попыток. Попробуйте позже';
    case 'auth/network-request-failed': return 'Ошибка сети. Проверьте подключение';
    case 'auth/popup-closed-by-user': return 'Окно Google было закрыто';
    case 'auth/cancelled-popup-request': return 'Вход отменен';
    case 'auth/popup-blocked': return 'Браузер заблокировал окно Google';
    case 'auth/unauthorized-domain': return 'Добавьте tetrixfilm.ru в Firebase Authorized domains';
    case 'auth/operation-not-allowed': return 'Этот способ входа не включён в Firebase Authentication';
    case 'auth/invalid-phone-number': return 'Введите номер в международном формате, например +79991234567';
    case 'auth/missing-phone-number': return 'Введите номер телефона';
    case 'auth/invalid-verification-code': return 'Неверный код из SMS';
    case 'auth/code-expired': return 'Срок действия SMS-кода истёк';
    case 'auth/quota-exceeded': return 'Лимит SMS Firebase исчерпан';
    case 'auth/captcha-check-failed': return 'Не пройдена проверка reCAPTCHA';
    case 'auth/internal-error': return 'Firebase временно не смог завершить авторизацию';
    default: return 'Произошла ошибка при авторизации';
  }
}

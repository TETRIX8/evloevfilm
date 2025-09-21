# Инструкция по настройке Firebase

## 1. Настройка Firestore Database

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект `akai-adad3`
3. В левом меню выберите **Firestore Database**
4. Нажмите **"Create database"**
5. Выберите **"Start in test mode"** (для разработки)
6. Выберите ближайший к вам регион

## 2. Настройка правил безопасности

1. В Firestore Database перейдите на вкладку **"Rules"**
2. Замените содержимое на правила из файла `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для пользовательских данных
    match /users/{userId} {
      // Пользователь может читать и писать только свои данные
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Правила для избранного
      match /saved/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Правила для истории
      match /history/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Нажмите **"Publish"**

## 3. Настройка Authentication

1. В левом меню выберите **Authentication**
2. Перейдите на вкладку **"Sign-in method"**
3. Включите следующие провайдеры:
   - **Email/Password** - включить
   - **Google** - включить и настроить

### Настройка Google OAuth:
1. Нажмите на **Google** в списке провайдеров
2. Включите переключатель
3. Добавьте домен вашего сайта в **Authorized domains**
4. Сохраните изменения

## 4. Настройка доменов для разработки

1. В Authentication перейдите на вкладку **"Settings"**
2. В разделе **"Authorized domains"** добавьте:
   - `localhost` (для локальной разработки)
   - `127.0.0.1` (альтернативный localhost)
   - Ваш домен (если есть)

## 5. Проверка конфигурации

Убедитесь, что в файле `.env.local` правильно указаны все переменные:

```
VITE_FIREBASE_API_KEY=AIzaSyCUFtk5_2-Ka_HpEfHFNA-nuXXMNlIH9Nc
VITE_FIREBASE_AUTH_DOMAIN=akai-adad3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=akai-adad3
VITE_FIREBASE_STORAGE_BUCKET=akai-adad3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=137568253759
VITE_FIREBASE_APP_ID=1:137568253759:web:75bfcf3ade31714527858a
```

## 6. Тестирование

После настройки:
1. Перезапустите сервер разработки: `npm run dev`
2. Попробуйте зарегистрироваться/войти через Google или email
3. Проверьте, что данные сохраняются в Firestore

## Возможные проблемы

### "Missing or insufficient permissions"
- Убедитесь, что правила Firestore настроены правильно
- Проверьте, что пользователь авторизован

### "Cross-Origin-Opener-Policy"
- Это предупреждение Google OAuth, не критично
- Можно игнорировать или настроить CORS в Firebase

### "Unsupported field value: undefined"
- Исправлено в коде - undefined значения фильтруются перед сохранением

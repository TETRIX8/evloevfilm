# 🎬 EVOLVEFILM — Киноплатформа нового поколения  

**✨ Где каждый кадр — история, а каждый просмотр — событие**  

---

## 🌌 О проекте  

EVOLVEFILM — это не просто стриминговый сервис, а **целая экосистема для киноманов**:  
- 🎥 Умные рекомендации на основе нейросетей  
- 🌈 Динамический интерфейс, адаптирующийся под ваш вкус  
- 🚀 Технологии кинопоказа уровня премиальных кинотеатров  

---

## 🔗 Техническая часть  

Проект состоит из:  
- **Frontend**: Современный React-интерфейс  
- **Backend**: Мощный API на Node.js  
- **Рекомендательная система**: Python + ML  

### 📚 API Документация  
Полное описание методов и схем:  
[Документация EVOLVEFILM API](https://github.com/TETRIX8/evloevfilmapi.git)  

### 🛠 Исходный код API  
[Репозиторий проекта на GitHub](https://github.com/TETRIX8/evloevfilmapi.git)  

---

## 🌟 Ключевые особенности  

<div align="center">

| 🎭 Кинотеатр дома | 🔮 Персонализация | 🦾 Технологии |  
|------------------|-----------------|--------------|  
| Dolby Vision и Atmos поддержка | Анализ ваших предпочтений | Оптимизированная CDN-сеть |  
| Виртуальные кинозалы | Ежедневные персонализированные подборки | AI-апскейлинг контента |  

</div>

---

## 🚀 Быстрый старт  

```bash
git clone https://github.com/TETRIX8/evloevfilmapi.git
cd evloevfilmapi
npm install
npm start
```

---

## 📬 Контакты  

По вопросам сотрудничества:  
✉️ tetrixuno@gmail.com  

Техподдержка:  
🛟 tetrixuno@gmail.com 

---

> *"Мы не просто показываем фильмы — мы создаем атмосферу."*  
> © Команда EVOLVEFILM

## Vercel: избранное, сохранения и история

Избранное, сохранения и история просмотров хранятся через endpoint `/api/user-data` в Vercel Blob. Данные разделены по Firebase UID. Для приватного режима задайте `BLOB_ACCESS=private` и используйте **Private Blob Store**; для уже созданного Public Store оставьте `BLOB_ACCESS=public` (это режим совместимости, при котором URL JSON нельзя считать секретным). `localStorage`, Firestore и Supabase больше не используются для этих трёх функций.

Перед деплоем:

1. В Vercel откройте проект и подключите Storage → Blob к этому проекту. Vercel автоматически добавит `BLOB_READ_WRITE_TOKEN` (или OIDC-переменные `BLOB_STORE_ID` и `VERCEL_OIDC_TOKEN`). Если Store отмечен как Public, задайте `BLOB_ACCESS=public`; для нового Private Store задайте `BLOB_ACCESS=private`.
2. Сервер может проверить Firebase ID token через `FIREBASE_SERVICE_ACCOUNT_JSON`; если этот секрет не задан, API использует Firebase Identity Toolkit и `FIREBASE_WEB_API_KEY` (или ключ проекта по умолчанию). Для production рекомендуется добавить `FIREBASE_SERVICE_ACCOUNT_JSON`. Не добавляйте секрет в репозиторий и не используйте его с префиксом `VITE_`.
3. Для frontend оставьте существующие `VITE_FIREBASE_*` переменные, если они уже настроены в Firebase-проекте.
4. Выполните деплой с Build Command `npm run build` и Output Directory `dist`. API-функция `api/user-data.ts` будет опубликована Vercel автоматически.

Локальная проверка frontend выполняется командой `npm run build`. Для проверки API локально используйте `vercel dev`, чтобы Vercel подгрузил serverless routes и переменные окружения.


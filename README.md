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

## Firebase: избранное, сохранения и история

Избранное, сохранения и история просмотров хранятся в **Cloud Firestore** внутри коллекций `users/{firebaseUid}/saved` и `users/{firebaseUid}/history`. Firebase Authentication отвечает за вход, а Firestore Rules разрешают доступ только владельцу соответствующего `uid`.

Перед деплоем:

1. В Firebase Console откройте проект `akai-adad3` и включите **Firestore Database**.
2. Опубликуйте правила из `firestore.rules` командой `firebase deploy --only firestore:rules` или вставьте их в Firestore → Rules.
3. Для frontend оставьте существующие `VITE_FIREBASE_*` переменные, если они уже настроены в Firebase-проекте.
4. Выполните деплой с Build Command `npm run build` и Output Directory `dist`.

Локальная проверка выполняется командой `npm run build`. Для локальной работы с Firestore используйте Firebase Emulator Suite.

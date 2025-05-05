
import { soundEffects } from "./soundEffects";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      localStorage.setItem("notificationPermission", "granted");
      soundEffects.play("notification");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const scheduleNotification = () => {
  // Schedule daily notification at 12:15 MSK
  const now = new Date();
  const mskOffset = 3; // UTC+3 for Moscow
  const userOffset = -now.getTimezoneOffset() / 60;
  const offsetDiff = mskOffset - userOffset;
  
  // Target time 12:15 MSK converted to user's local time
  const targetHour = 12 - offsetDiff;
  const targetMinute = 15;
  
  const scheduleTime = new Date();
  scheduleTime.setHours(targetHour, targetMinute, 0, 0);
  
  // If it's already past target time, schedule for next day
  if (now > scheduleTime) {
    scheduleTime.setDate(scheduleTime.getDate() + 1);
  }
  
  const timeUntilNotification = scheduleTime.getTime() - now.getTime();
  
  console.log(`Scheduling notification for ${scheduleTime.toLocaleString()}, which is in ${Math.round(timeUntilNotification/1000/60)} minutes`);
  
  setTimeout(() => {
    sendNotification();
    // Schedule next notification for tomorrow
    scheduleNotification();
  }, timeUntilNotification);
};

const notificationMessages = [
  "🎬 Новые фильмы уже ждут тебя!",
  "🍿 Время для нового кино!",
  "🎥 Загляни к нам - появились новинки!",
  "🌟 Твой вечер станет лучше с новым фильмом!",
  "📽️ Новые фильмы добавлены специально для тебя!"
];

const sendNotification = () => {
  if (Notification.permission === "granted") {
    soundEffects.play("notification");
    const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    new Notification("EvloevFilm", {
      body: randomMessage,
      icon: "/favicon.ico"
    });
  }
};

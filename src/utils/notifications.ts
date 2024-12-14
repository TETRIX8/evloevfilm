export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      localStorage.setItem("notificationPermission", "granted");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const scheduleNotification = () => {
  // Convert 11:00 MSK to user's local time
  const now = new Date();
  const mskOffset = 3; // UTC+3 for Moscow
  const userOffset = -now.getTimezoneOffset() / 60;
  const offsetDiff = mskOffset - userOffset;
  
  const targetHour = 11 - offsetDiff;
  
  const scheduleTime = new Date();
  scheduleTime.setHours(targetHour, 0, 0, 0);
  
  // If it's already past target time, schedule for next day
  if (now > scheduleTime) {
    scheduleTime.setDate(scheduleTime.getDate() + 1);
  }
  
  const timeUntilNotification = scheduleTime.getTime() - now.getTime();
  
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
    const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    new Notification("EvloevFilm", {
      body: randomMessage,
      icon: "/favicon.ico"
    });
  }
};
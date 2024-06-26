// Telegram/fetchCheckInData.js
import { fetchCheckInData } from "../utils/fetchCheckInData.js";

export const handleFetchCheckInData = async (bot, chatId) => {
  try {
    const checkInData = await fetchCheckInData(
      process.env.NOTION_API_KEY,
      process.env.MAIN_DATABASE_ID,
      process.env.PERSON_DATABASE_ID,
      process.env.LISTINGS_DATABASE_ID
    );

    if (checkInData.length === 0) {
      bot.sendMessage(chatId, "Check-in verisi bulunamadı.");
      return;
    }

    let message = "Check-in Verileri:\n\n";
    checkInData.forEach((entry, index) => {
      message += `**Room**: ${entry.roomId}\n`;
      message += `**Person**: ${entry.personId}\n`;
      message += `**Check-in Date**: ${entry.checkInDate}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching check-in data:", error.message);
    bot.sendMessage(chatId, "Check-in verileri alınırken hata oluştu.");
  }
};

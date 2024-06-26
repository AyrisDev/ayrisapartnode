// Telegram/addReservation.js
import fetch from "node-fetch";
import { addPersonToNotion } from "../utils/addPersonToNotion.js";

export const handleAddReservation = (bot, chatId) => {
  bot.sendMessage(
    chatId,
    "Rezervasyon eklemeye başlayalım. Lütfen isim girin:"
  );
  bot.once("message", (msg) => handleName(msg, bot, chatId));
};

const handleName = (msg, bot, chatId) => {
  const name = msg.text;
  bot.sendMessage(chatId, "Lütfen kişinin adını girin:");
  bot.once("message", (msg) => handlePersonName(msg, bot, chatId, name));
};

const handlePersonName = (msg, bot, chatId, name) => {
  const personName = msg.text;
  bot.sendMessage(chatId, "Lütfen kişinin telefon numarasını girin:");
  bot.once("message", (msg) =>
    handlePersonPhone(msg, bot, chatId, name, personName)
  );
};

const handlePersonPhone = async (msg, bot, chatId, name, personName) => {
  const phone = msg.text;
  try {
    const personId = await addPersonToNotion(
      personName,
      phone,
      process.env.NOTION_API_KEY,
      process.env.PERSON_DATABASE_ID
    );
    bot.sendMessage(
      chatId,
      "Kişi başarıyla eklendi. Mevcut odalar getiriliyor..."
    );
    const response = await fetch("http://localhost:3000/api/rooms");
    const listings = await response.json();
    const listingsText = Object.values(listings)
      .map((listing, i) => `${i + 1}. ${listing}`)
      .join("\n");
    bot.sendMessage(
      chatId,
      `Mevcut odalar:\n${listingsText}\n\nOda numarasını girin:`
    );
    bot.once("message", (msg) =>
      handleListing(msg, bot, chatId, name, personId, listings)
    );
  } catch (error) {
    console.error("Error adding person or fetching rooms:", error);
    bot.sendMessage(chatId, "Odalar alınırken hata oluştu.");
  }
};

// Devamı aynı şekilde handleListing, handleTotalPrice, handleKapora, handleStartDate, handleEndDate...

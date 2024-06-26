// Telegram/addOksana.js
import { fetchListingsFromNotion } from "../utils/fetchListingsFromNotion.js";
import { addOksanaToNotion } from "../utils/addOksanaToNotion.js";

const session = {};

export const handleAddOksana = async (bot, chatId) => {
  try {
    const listings = await fetchListingsFromNotion(
      process.env.NOTION_API_KEY,
      process.env.LISTINGS_DATABASE_ID
    );
    session[chatId] = { listings, state: "waiting_for_listing_oksana" };
    const listingsText = listings
      .map((listing, i) => `${i + 1}. ${listing.name}`)
      .join("\n");
    bot.sendMessage(
      chatId,
      `Mevcut odalar:\n${listingsText}\n\nOda numarasını girin:`
    );
  } catch (error) {
    console.error("Error fetching listings:", error.message);
    bot.sendMessage(chatId, "Odalar alınırken hata oluştu.");
  }
};

export const handleOksanaMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (session[chatId]?.state === "waiting_for_listing_oksana") {
    const listingIndex = parseInt(text, 10) - 1;
    if (listingIndex >= 0 && listingIndex < session[chatId].listings.length) {
      const listingId = session[chatId].listings[listingIndex].id;
      try {
        await addOksanaToNotion(
          process.env.NOTION_API_KEY,
          process.env.OKSANA_DATABASE_ID,
          listingId
        );
        bot.sendMessage(chatId, "Oksana veritabanına başarıyla eklendi!");
      } catch (error) {
        bot.sendMessage(chatId, `Bir hata oluştu: ${error.message}`);
      }
      session[chatId] = null;
    } else {
      bot.sendMessage(chatId, "Geçersiz seçim. Lütfen tekrar deneyin:");
    }
  }
};

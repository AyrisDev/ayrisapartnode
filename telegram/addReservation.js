import { addPersonToNotion } from "../utils/addPersonToNotion.js";

const sessions = {};

export const handleAddReservation = (bot, chatId) => {
  sessions[chatId] = { state: "waiting_for_name" };
  bot.sendMessage(
    chatId,
    "Rezervasyon eklemeye başlayalım. Lütfen isim girin:"
  );
};

export const handleReservationMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId]) return;

  const session = sessions[chatId];
  switch (session.state) {
    case "waiting_for_name":
      session.name = text;
      session.state = "waiting_for_person_name";
      bot.sendMessage(chatId, "Lütfen kişinin adını girin:");
      break;
    case "waiting_for_person_name":
      session.person_name = text;
      session.state = "waiting_for_person_phone";
      bot.sendMessage(chatId, "Lütfen kişinin telefon numarasını girin:");
      break;
    case "waiting_for_person_phone":
      session.person_phone = text;
      try {
        const personId = await addPersonToNotion(
          session.person_name,
          session.person_phone,
          process.env.NOTION_API_KEY,
          process.env.PERSON_DATABASE_ID
        );
        session.personId = personId;
        bot.sendMessage(
          chatId,
          "Kişi başarıyla eklendi. Mevcut odalar getiriliyor..."
        );
        const response = await fetch("http://localhost:3000/api/rooms");
        const listings = await response.json();
        session.listings = listings;
        const listingsText = Object.values(listings)
          .map((listing, i) => `${i + 1}. ${listing}`)
          .join("\n");
        bot.sendMessage(
          chatId,
          `Mevcut odalar:\n${listingsText}\n\nOda numarasını girin:`
        );
        session.state = "waiting_for_listing";
      } catch (error) {
        console.error("Error adding person or fetching rooms:", error);
        bot.sendMessage(chatId, "Odalar alınırken hata oluştu.");
        delete sessions[chatId];
      }
      break;
    case "waiting_for_listing":
      const listingIndex = parseInt(text, 10) - 1;
      if (
        listingIndex >= 0 &&
        listingIndex < Object.values(session.listings).length
      ) {
        session.listing = Object.keys(session.listings)[listingIndex];
        session.state = "waiting_for_total_price";
        bot.sendMessage(chatId, "Lütfen toplam fiyatı girin:");
      } else {
        bot.sendMessage(chatId, "Geçersiz seçim. Lütfen tekrar deneyin:");
      }
      break;
    case "waiting_for_total_price":
      session.total_price = text;
      session.state = "waiting_for_kapora";
      bot.sendMessage(chatId, "Lütfen kapora miktarını girin:");
      break;
    case "waiting_for_kapora":
      session.kapora = text;
      session.state = "waiting_for_start_date";
      bot.sendMessage(
        chatId,
        "Lütfen rezervasyon başlangıç tarihini girin (dd/mm/yyyy):"
      );
      break;
    case "waiting_for_start_date":
      session.start_date = text;
      session.state = "waiting_for_end_date";
      bot.sendMessage(
        chatId,
        "Lütfen rezervasyon bitiş tarihini girin (dd/mm/yyyy):"
      );
      break;
    case "waiting_for_end_date":
      session.end_date = text;
      const reservationDetails = {
        name: session.name,
        person: session.personId,
        listing: session.listing,
        total_price: session.total_price,
        kapora: session.kapora,
        start_date: session.start_date,
        end_date: session.end_date,
      };
      try {
        const response = await fetch(
          "http://localhost:3000/api/reservations/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reservationDetails),
          }
        );
        const data = await response.json();
        bot.sendMessage(
          chatId,
          `Rezervasyon başarıyla eklendi. ID: ${data.reservationId}`
        );
      } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "Rezervasyon eklenirken bir hata oluştu.");
      }
      delete sessions[chatId];
      break;
    default:
      bot.sendMessage(chatId, "Something went wrong. Please try again.");
      delete sessions[chatId];
      break;
  }
};

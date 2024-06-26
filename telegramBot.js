import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { addPersonToNotion } from "./utils/addPersonToNotion.js";
import { fetchListingsFromNotion } from "./utils/fetchListingsFromNotion.js";
import { addOksanaToNotion } from "./utils/addOksanaToNotion.js";
import { fetchCheckInData } from "./utils/fetchCheckInData.js";
import { addExpenseToNotion } from "./utils/addExpenseToNotion.js";
dotenv.config();

const webhookUrl = process.env.VERCEL_DEPLOYMENT_URL;
const bot = new TelegramBot(process.env.TELEGRAM_API_KEY, { polling: true });

const session = {};

bot.onText(/\/expenses/, (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = { state: "waiting_for_expenses_name" };
  bot.sendMessage(
    chatId,
    "Let's add a new expense. Please enter the name of the expense:"
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId]) return;

  const session = sessions[chatId];
  switch (session.state) {
    case "waiting_for_expenses_name":
      session.name = text;
      session.state = "waiting_for_amount";
      bot.sendMessage(chatId, "Please enter the amount:");
      break;
    case "waiting_for_amount":
      session.amount = parseFloat(text);
      if (isNaN(session.amount)) {
        bot.sendMessage(
          chatId,
          "Invalid amount. Please enter a numeric value:"
        );
      } else {
        session.state = "waiting_for_date";
        bot.sendMessage(chatId, "Please enter the date (yyyy-mm-dd):");
      }
      break;
    case "waiting_for_date":
      session.date = text;
      session.state = "waiting_for_description";
      bot.sendMessage(chatId, "Please enter a description:");
      break;
    case "waiting_for_description":
      session.description = text;
      session.state = "waiting_for_category";
      bot.sendMessage(chatId, "Please enter the category:");
      break;
    case "waiting_for_category":
      session.category = text;
      try {
        await addExpenseToNotion(
          session,
          process.env.NOTION_API_KEY,
          process.env.EXPENSES_DATABASE_ID
        );
        bot.sendMessage(chatId, "Expense added successfully!");
      } catch (error) {
        bot.sendMessage(chatId, `Error adding expense: ${error.message}`);
      }
      delete sessions[chatId];
      break;
    default:
      bot.sendMessage(chatId, "Something went wrong. Please try again.");
      delete sessions[chatId];
      break;
  }
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome to the Notion Bot! Use /help to see available commands."
  );
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
  Available commands:
  /rooms - Get the list of rooms
  /checkdate - Check available dates for rooms
  /persons - Get the list of persons
  /addreservation - Add a new reservation
  `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

bot.onText(/\/rooms/, async (msg) => {
  try {
    const response = await fetch("http://localhost:3000/api/rooms");
    const data = await response.json();
    bot.sendMessage(msg.chat.id, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
    bot.sendMessage(msg.chat.id, "Error fetching rooms data.");
  }
});

bot.onText(/\/checkdate/, async (msg) => {
  try {
    const response = await fetch("http://localhost:3000/api/checkdate");
    const data = await response.json();

    let message = "Available Dates:\n\n";
    for (const [room, dates] of Object.entries(data)) {
      message += `<b>${room}</b>\n`;
      dates.forEach(({ start, end }) => {
        message += `Start: ${start}\nEnd: ${end}\n\n`;
      });
    }

    bot.sendMessage(msg.chat.id, message, { parse_mode: "HTML" });
  } catch (error) {
    console.error(error);
    bot.sendMessage(msg.chat.id, "Error fetching check date data.");
  }
});

bot.onText(/\/persons/, async (msg) => {
  try {
    const response = await fetch("http://localhost:3000/api/persons");
    const data = await response.json();
    bot.sendMessage(msg.chat.id, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
    bot.sendMessage(msg.chat.id, "Error fetching persons data.");
  }
});

// Polling error event listener
bot.on("polling_error", (error) => {
  console.error("Polling error occurred:", error);
});

bot.onText(/\/addreservation/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Rezervasyon eklemeye başlayalım. Lütfen isim girin:"
  );
  bot.once("message", (msg) => handleName(msg, chatId));
});

const handleName = (msg, chatId) => {
  const name = msg.text;
  bot.sendMessage(chatId, "Lütfen kişinin adını girin:");
  bot.once("message", (msg) => handlePersonName(msg, chatId, name));
};

const handlePersonName = (msg, chatId, name) => {
  const personName = msg.text;
  bot.sendMessage(chatId, "Lütfen kişinin telefon numarasını girin:");
  bot.once("message", (msg) =>
    handlePersonPhone(msg, chatId, name, personName)
  );
};

const handlePersonPhone = async (msg, chatId, name, personName) => {
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
      handleListing(msg, chatId, name, personId, listings)
    );
  } catch (error) {
    console.error("Error adding person or fetching rooms:", error);
    bot.sendMessage(chatId, "Odalar alınırken hata oluştu.");
  }
};

const handleListing = (msg, chatId, name, personId, listings) => {
  const listingIndex = parseInt(msg.text, 10) - 1;
  if (listingIndex >= 0 && listingIndex < Object.values(listings).length) {
    const listing = Object.keys(listings)[listingIndex];
    bot.sendMessage(chatId, "Lütfen toplam fiyatı girin:");
    bot.once("message", (msg) =>
      handleTotalPrice(msg, chatId, name, personId, listing)
    );
  } else {
    bot.sendMessage(chatId, "Geçersiz seçim. Lütfen tekrar deneyin:");
  }
};

const handleTotalPrice = (msg, chatId, name, personId, listing) => {
  const totalPrice = msg.text;
  bot.sendMessage(chatId, "Lütfen kapora miktarını girin:");
  bot.once("message", (msg) =>
    handleKapora(msg, chatId, name, personId, listing, totalPrice)
  );
};

const handleKapora = (msg, chatId, name, personId, listing, totalPrice) => {
  const kapora = msg.text;
  bot.sendMessage(
    chatId,
    "Lütfen rezervasyon başlangıç tarihini girin (dd/mm/yyyy):"
  );
  bot.once("message", (msg) =>
    handleStartDate(msg, chatId, name, personId, listing, totalPrice, kapora)
  );
};

const handleStartDate = (
  msg,
  chatId,
  name,
  personId,
  listing,
  totalPrice,
  kapora
) => {
  const startDate = msg.text;
  bot.sendMessage(
    chatId,
    "Lütfen rezervasyon bitiş tarihini girin (dd/mm/yyyy):"
  );
  bot.once("message", (msg) =>
    handleEndDate(
      msg,
      chatId,
      name,
      personId,
      listing,
      totalPrice,
      kapora,
      startDate
    )
  );
};

const handleEndDate = async (
  msg,
  chatId,
  name,
  personId,
  listing,
  totalPrice,
  kapora,
  startDate
) => {
  const endDate = msg.text;
  const reservationDetails = {
    name,
    person: personId,
    listing,
    total_price: totalPrice,
    kapora,
    start_date: startDate,
    end_date: endDate,
  };

  try {
    const response = await fetch("http://localhost:3000/api/reservations/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationDetails),
    });
    const data = await response.json();
    bot.sendMessage(
      chatId,
      `Rezervasyon başarıyla eklendi. ID: ${data.reservationId}`
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Rezervasyon eklenirken bir hata oluştu.");
  }
};

bot.onText(/\/oksana/, async (msg) => {
  const chatId = msg.chat.id;
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
});

bot.on("message", async (msg) => {
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
});

bot.onText(/\/checkin/, async (msg) => {
  const chatId = msg.chat.id;
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
});

bot.setWebHook(`${webhookUrl}/bot${process.env.TELEGRAM_API_KEY}`);

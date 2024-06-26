import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { handleAddReservation } from "./addReservation.js";
import { handleAddExpenses, handleExpensesMessage } from "./addExpenses.js";
import { handleAddOksana, handleOksanaMessage } from "./addOksana.js";
import { handleFetchCheckInData } from "./fetchCheckInData.js";

dotenv.config();

const sessions = {};

export const startTelegramBot = () => {
  const bot = new TelegramBot(process.env.TELEGRAM_API_KEY, { polling: true });
  const webhookUrl = process.env.VERCEL_DEPLOYMENT_URL;

  bot.onText(/\/expenses/, (msg) => {
    const chatId = msg.chat.id;
    handleAddExpenses(bot, chatId);
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!sessions[chatId]) return;

    handleExpensesMessage(bot, msg);
    handleOksanaMessage(bot, msg);
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
      /expenses - Add a new expenses
      /oksana - Add a new Oksana entry
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

  bot.onText(/\/addreservation/, (msg) => {
    const chatId = msg.chat.id;
    handleAddReservation(bot, chatId);
  });

  bot.onText(/\/oksana/, (msg) => {
    const chatId = msg.chat.id;
    handleAddOksana(bot, chatId);
  });

  bot.onText(/\/checkin/, async (msg) => {
    const chatId = msg.chat.id;
    handleFetchCheckInData(bot, chatId);
  });

  bot.setWebHook(`${webhookUrl}/bot${process.env.TELEGRAM_API_KEY}`);
};

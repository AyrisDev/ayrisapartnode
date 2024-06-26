import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import {
  handleAddExpenses,
  handleExpensesMessage,
} from "./telegram/addExpenses.js";
import {
  handleAddReservation,
  handleReservationMessage,
} from "./telegram/addReservation.js";
import { handleAddOksana, handleOksanaMessage } from "./telegram/addOksana.js";
import { handleFetchCheckInData } from "./telegram/fetchCheckInData.js";
import routes from "./routes/index.js";
dotenv.config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_API_KEY, { polling: false });

app.use(express.json());

bot.onText(/\/expenses/, (msg) => {
  const chatId = msg.chat.id;
  handleAddExpenses(bot, chatId);
});

bot.on("message", async (msg) => {
  handleExpensesMessage(bot, msg);
  handleReservationMessage(bot, msg);
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
    /expenses - Add a new expense
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
    bot.sendMessage(msg.chat.id, "Error fetching check date data.");
  }
});

bot.onText(/\/persons/, async (msg) => {
  try {
    const response = await fetch("http://localhost:3000/api/persons");
    const data = await response.json();
    bot.sendMessage(msg.chat.id, JSON.stringify(data, null, 2));
  } catch (error) {
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

app.use("/api", routes);

app.post(`/bot${process.env.TELEGRAM_API_KEY}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

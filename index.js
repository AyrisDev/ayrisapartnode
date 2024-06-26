import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import { startTelegramBot } from "./telegram/startTelegramBot.js";
dotenv.config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_API_KEY, { polling: false });

app.use(express.json());
startTelegramBot();

app.use("/api", routes);

app.post(`/bot${process.env.TELEGRAM_API_KEY}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

import { addExpenseToNotion } from "../utils/addExpenseToNotion.js";

const sessions = {};

export const handleAddExpenses = (bot, chatId) => {
  sessions[chatId] = { state: "waiting_for_expenses_name" };
  bot.sendMessage(
    chatId,
    "Let's add a new expense. Please enter the name of the expense:"
  );
};

export const handleExpensesMessage = async (bot, msg) => {
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
};

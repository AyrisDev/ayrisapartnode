import { addExpenseToNotion } from "../utils/addExpenseToNotion.js";
import { fetchCategoriesFromNotion } from "../utils/fetchCategoriesFromNotion.js";

const sessions = {};

export const handleAddExpenses = async (bot, chatId) => {
  try {
    const categories = await fetchCategoriesFromNotion(
      process.env.NOTION_API_KEY,
      process.env.EXPENSES_DATABASE_ID
    );
    sessions[chatId] = { state: "waiting_for_expenses_name", categories };
    bot.sendMessage(
      chatId,
      "Let's add a new expense. Please enter the name of the expense:"
    );
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    bot.sendMessage(chatId, "Categories alınırken hata oluştu.");
  }
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
      // ISO 8601 formatına çevirmek
      const isoDate = new Date(text).toISOString();
      session.date = isoDate;
      session.state = "waiting_for_description";
      bot.sendMessage(chatId, "Please enter a description:");
      break;
    case "waiting_for_description":
      session.description = text;
      session.state = "waiting_for_category";
      const categoriesText = session.categories
        .map((category, i) => `${i + 1}. ${category.name}`)
        .join("\n");
      bot.sendMessage(chatId, `Please select a category:\n${categoriesText}`);
      break;
    case "waiting_for_category":
      const categoryIndex = parseInt(text, 10) - 1;
      if (categoryIndex >= 0 && categoryIndex < session.categories.length) {
        session.category = session.categories[categoryIndex].name;
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
      } else {
        bot.sendMessage(chatId, "Invalid selection. Please try again:");
      }
      break;
    default:
      bot.sendMessage(chatId, "Something went wrong. Please try again.");
      delete sessions[chatId];
      break;
  }
};

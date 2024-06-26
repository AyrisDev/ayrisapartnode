import express from "express";
import { addExpenseToNotion } from "../utils/addExpenseToNotion.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const expense = req.body;
  try {
    const expenseId = await addExpenseToNotion(
      expense,
      process.env.NOTION_API_KEY,
      process.env.EXPENSES_DATABASE_ID
    );
    res.json({ expenseId });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;

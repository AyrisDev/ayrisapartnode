import express from "express";
import { fetchNotionDatabase } from "../utils/fetchNotionDatabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await fetchNotionDatabase();
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;

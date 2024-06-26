import express from "express";
import { getRoomNames } from "../utils/getRoomNames.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const roomNames = await getRoomNames(
      process.env.NOTION_API_KEY,
      process.env.LISTINGS_DATABASE_ID
    );
    res.json(roomNames);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;

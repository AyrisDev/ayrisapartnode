import express from "express";
import { fetchCheckInData } from "../utils/fetchCheckInData.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const checkInData = await fetchCheckInData(
      process.env.NOTION_API_KEY,
      process.env.MAIN_DATABASE_ID,
      process.env.PERSON_DATABASE_ID,
      process.env.LISTINGS_DATABASE_ID
    );
    res.json(checkInData);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;

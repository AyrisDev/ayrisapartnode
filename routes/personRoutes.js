import express from "express";
import { getPersonNames } from "../utils/getPersonNames.js";
import { addPersonToNotion } from "../utils/addPersonToNotion.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const personNames = await getPersonNames(
      process.env.NOTION_API_KEY,
      process.env.PERSON_DATABASE_ID
    );
    res.json(personNames);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;

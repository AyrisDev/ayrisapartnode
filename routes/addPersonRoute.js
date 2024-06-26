import express from "express";
import { addPersonToNotion } from "../utils/addPersonToNotion.js";

const router = express.Router();

router.post("/add-person", async (req, res) => {
  const { name, phone } = req.body;
  try {
    const personId = await addPersonToNotion(
      name,
      phone,
      process.env.NOTION_API_KEY,
      process.env.PERSON_DATABASE_ID
    );
    res.json({ personId });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;

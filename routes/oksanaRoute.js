import express from "express";
import { addOksanaToNotion } from "../utils/addOksanaToNotion.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { listingId } = req.body;

  if (!listingId) {
    return res.status(400).send("Listing ID is required");
  }

  try {
    await addOksanaToNotion(
      process.env.NOTION_API_KEY,
      process.env.OKSANA_DATABASE_ID,
      listingId
    );
    res.status(200).send("Oksana entry added successfully");
  } catch (error) {
    console.error("Error adding Oksana entry:", error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

export default router;

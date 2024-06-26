import express from "express";
import { fetchNotionDatabase } from "../utils/fetchNotionDatabase.js";
import { getRoomNames } from "../utils/getRoomNames.js";
import { findEmptyDatesByRoom } from "../utils/findEmptyDatesByRoom.js";
import { format } from "date-fns";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mainData = await fetchNotionDatabase(
      process.env.NOTION_API_KEY,
      process.env.MAIN_DATABASE_ID
    );

    const dateEntries = mainData.results
      .map((entry) => {
        const roomId = entry.properties?.Listings?.relation?.[0]?.id;
        const startDate = entry.properties?.["Check Date"]?.date?.start;
        const endDate =
          entry.properties?.["Check Date"]?.date?.end || startDate;

        return { roomId, startDate, endDate };
      })
      .filter((entry) => entry.roomId && entry.startDate);

    const roomNames = await getRoomNames(
      process.env.NOTION_API_KEY,
      process.env.LISTINGS_DATABASE_ID
    );

    const dateRangesByRoom = {};
    dateEntries.forEach(({ roomId, startDate, endDate }) => {
      const roomName = roomNames[roomId] || "Unknown Room";
      if (!dateRangesByRoom[roomName]) {
        dateRangesByRoom[roomName] = [];
      }
      dateRangesByRoom[roomName].push({ startDate, endDate });
    });

    const emptyDatesByRoom = findEmptyDatesByRoom(dateRangesByRoom);

    const result = {};
    Object.keys(emptyDatesByRoom)
      .sort()
      .forEach((room) => {
        result[room] = emptyDatesByRoom[room]
          .map((block) => ({
            start: format(new Date(block.start), "dd/MM/yyyy"),
            end: format(new Date(block.end), "dd/MM/yyyy"),
          }))
          .sort((a, b) => new Date(a.start) - new Date(b.start));
      });

    res.json(result);
  } catch (error) {
    console.error("Error fetching data from Notion:", error);
    res.status(500).send(`Hata: ${error.message}`);
  }
});

export default router;

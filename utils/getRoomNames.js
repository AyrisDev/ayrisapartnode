import { fetchNotionDatabase } from "./fetchNotionDatabase.js";

export async function getRoomNames(apiKey, roomsDatabaseId) {
  const data = await fetchNotionDatabase(apiKey, roomsDatabaseId);
  const roomNames = {};
  data.results.forEach((result) => {
    const roomId = result.id;
    const roomName =
      result.properties?.Name?.title?.[0]?.text?.content || "Unknown";
    roomNames[roomId] = roomName;
  });
  return roomNames;
}

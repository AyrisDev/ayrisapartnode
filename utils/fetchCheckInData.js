import fetch from "node-fetch";
import { getPersonNames } from "./getPersonNames.js";
import { getRoomNames } from "./getRoomNames.js";

export async function fetchCheckInData(
  apiKey,
  databaseId,
  personDatabaseId,
  roomsDatabaseId
) {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split("T")[0];

  const payload = {
    filter: {
      or: [
        {
          property: "Check Date",
          date: {
            equals: today,
          },
        },
        {
          property: "Check Date",
          date: {
            equals: tomorrow,
          },
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error fetching data from Notion: ${response.statusText}`);
  }

  const data = await response.json();
  const personNames = await getPersonNames(apiKey, personDatabaseId);
  const roomNames = await getRoomNames(apiKey, roomsDatabaseId);

  return data.results.map((result) => {
    const personId = result.properties.Person.relation?.[0]?.id || "Unknown";
    const checkInDate =
      result.properties["Check Date"].date?.start || "Unknown";
    const listings = result.properties.Listings.relation?.[0]?.id || "Unknown";

    const personName = personNames[personId] || "Unknown";
    const roomName = roomNames[listings] || "Unknown";

    return { personName, checkInDate, roomName };
  });
}

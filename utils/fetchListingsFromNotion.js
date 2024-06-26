// utils/fetchListingsFromNotion.js
import fetch from "node-fetch";

export async function fetchListingsFromNotion(
  notionApiKey,
  listingsDatabaseId
) {
  const url = `https://api.notion.com/v1/databases/${listingsDatabaseId}/query`;
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error("Failed to fetch listings from Notion:", responseText);
      throw new Error(responseText);
    }

    const data = await response.json();
    return data.results.map((listing) => ({
      id: listing.id,
      name: listing.properties.Name.title[0]?.text.content,
    }));
  } catch (error) {
    console.error("Error fetching listings from Notion:", error.message);
    throw error;
  }
}

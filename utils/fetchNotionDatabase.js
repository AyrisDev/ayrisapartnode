import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function fetchNotionDatabase(apiKey, databaseId) {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching data from Notion API: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

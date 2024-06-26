import fetch from "node-fetch";

export async function addPersonToNotion(
  name,
  phone,
  notionApiKey,
  personDatabaseId
) {
  const url = "https://api.notion.com/v1/pages";
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };
  const payload = {
    parent: { database_id: personDatabaseId },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Phone: {
        rich_text: [{ text: { content: phone } }],
      },
    },
  };
  console.log(
    "Adding person to Notion with payload:",
    JSON.stringify(payload, null, 2)
  );
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  console.log("Response from adding person to Notion:", responseText);
  if (!response.ok) {
    throw new Error(`Error adding person: ${responseText}`);
  }
  const data = JSON.parse(responseText);
  return data.id;
}

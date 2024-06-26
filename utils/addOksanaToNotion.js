export async function addOksanaToNotion(
  notionApiKey,
  oksanaDatabaseId,
  listingId
) {
  const url = "https://api.notion.com/v1/pages";
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  const payload = {
    parent: { database_id: oksanaDatabaseId },
    properties: {
      Amount: {
        number: 750,
      },
      "Temizlik Zamanı": {
        date: {
          start: new Date().toISOString(),
        },
      },
      Listings: {
        relation: [{ id: listingId }],
      },
    },
  };
  console.log(
    "Adding Oksana to Notion with payload:",
    JSON.stringify(payload, null, 2)
  );
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  console.log("Response from adding Oksana to Notion:", responseText);
  if (!response.ok) {
    throw new Error(`Error adding Oksana: ${responseText}`);
  }
}

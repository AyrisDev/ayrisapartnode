import fetch from "node-fetch";

function convertToIsoDate(dateString) {
  const [day, month, year] = dateString.split("/");
  const isoDateString = `${year}-${month}-${day}`;
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    throw new RangeError(`Invalid time value: ${dateString}`);
  }
  return isoDateString;
}

export async function addReservationToNotion(
  data,
  notionApiKey,
  mainDatabaseId
) {
  const url = "https://api.notion.com/v1/pages";
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };
  const payload = {
    parent: { database_id: mainDatabaseId },
    properties: {
      Name: {
        title: [{ text: { content: data.name } }],
      },
      Person: {
        relation: [{ id: data.person }],
      },
      Listings: {
        relation: [{ id: data.listing }],
      },
      "Total Price": {
        number: parseFloat(data.total_price),
      },
      Kapora: {
        number: parseFloat(data.kapora),
      },
      "Check Date": {
        date: {
          start: convertToIsoDate(data.start_date),
          end: convertToIsoDate(data.end_date),
        },
      },
    },
  };
  console.log(
    "Adding reservation to Notion with payload:",
    JSON.stringify(payload, null, 2)
  );
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  console.log("Response from adding reservation to Notion:", responseText);
  if (!response.ok) {
    throw new Error(`Error adding reservation: ${responseText}`);
  }
  const dataResponse = JSON.parse(responseText);
  return dataResponse.id;
}

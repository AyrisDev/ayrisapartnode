import fetch from "node-fetch";

export async function addExpenseToNotion(
  expense,
  notionApiKey,
  expensesDatabaseId
) {
  const url = "https://api.notion.com/v1/pages";
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  const payload = {
    parent: { database_id: expensesDatabaseId },
    properties: {
      Name: {
        title: [{ text: { content: expense.name } }],
      },
      Amount: {
        number: expense.amount,
      },
      Date: {
        date: {
          start: expense.date,
        },
      },
      Description: {
        rich_text: [{ text: { content: expense.description } }],
      },
      Category: {
        select: { name: expense.category },
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Error adding expense: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return data.id;
}

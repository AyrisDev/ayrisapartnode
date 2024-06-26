import fetch from "node-fetch";

export const fetchCategoriesFromNotion = async (
  notionApiKey,
  expensesDatabaseId
) => {
  const url = `https://api.notion.com/v1/databases/${expensesDatabaseId}`;
  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error fetching categories: ${data.message}`);
  }

  const categories = data.properties.Category.select.options.map((option) => ({
    name: option.name,
  }));

  return categories;
};

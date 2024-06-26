import { fetchNotionDatabase } from "./fetchNotionDatabase.js";

export async function getPersonNames(apiKey, personDatabaseId) {
  const data = await fetchNotionDatabase(apiKey, personDatabaseId);
  const personNames = {};
  data.results.forEach((result) => {
    const personId = result.id;
    const personName =
      result.properties.Name.title?.[0]?.text?.content || "Unknown";
    personNames[personId] = personName;
  });
  return personNames;
}

import fetch from "node-fetch";

export async function convertToIsoDate(dateString) {
  const [day, month, year] = dateString.split("/");
  const isoDateString = `${year}-${month}-${day}`;
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    throw new RangeError(`Invalid time value: ${dateString}`);
  }
  return isoDateString;
}

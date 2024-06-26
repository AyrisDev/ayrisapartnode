import { parseISO, eachDayOfInterval, isWithinInterval } from "date-fns";

export function findEmptyDatesByRoom(dateRangesByRoom) {
  const emptyDatesByRoom = {};
  Object.keys(dateRangesByRoom).forEach((room) => {
    const occupiedDates = dateRangesByRoom[room].map((range) => ({
      start: parseISO(range.startDate),
      end: parseISO(range.endDate),
    }));
    const allDates = eachDayOfInterval({
      start: occupiedDates[0].start,
      end: occupiedDates[occupiedDates.length - 1].end,
    });

    const emptyBlocks = [];
    let blockStart = null;
    allDates.forEach((date) => {
      if (!occupiedDates.some((occupied) => isWithinInterval(date, occupied))) {
        if (!blockStart) {
          blockStart = date;
        }
      } else {
        if (blockStart) {
          emptyBlocks.push({ start: blockStart, end: date });
          blockStart = null;
        }
      }
    });
    if (blockStart) {
      emptyBlocks.push({
        start: blockStart,
        end: allDates[allDates.length - 1],
      });
    }

    emptyDatesByRoom[room] = emptyBlocks;
  });
  return emptyDatesByRoom;
}

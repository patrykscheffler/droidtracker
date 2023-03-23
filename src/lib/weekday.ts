import { startOfWeek } from "date-fns";

export function weekdayNames(type: "short" | "long" = "long") {
  const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from(Array(7).keys()).map((dayNumber) => {
    const date = new Date(startOfWeekDate);
    date.setDate(date.getDate() + dayNumber);
    return date.toLocaleDateString("en-US", { weekday: type });
  });
}
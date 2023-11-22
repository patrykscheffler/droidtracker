import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds?: number) {
  if (!seconds) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  return formattedDuration;
}

export function getDuration(timeString: string) {
  const timeParts = timeString.split(":").map((part) => parseInt(part, 10));
  if (timeParts.length !== 3) {
    return null;
  }

  const hours = timeParts[0];
  const minutes = timeParts[1];
  const seconds = timeParts[2];

  if (
    typeof hours !== "number" ||
    typeof minutes !== "number" ||
    typeof seconds !== "number"
  ) {
    return null;
  }

  if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return null;
  }

  return hours * 60 * 60 + minutes * 60 + seconds;
}

export function stringToHSLColor(str: string) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = (hash % 360 + 360) % 360; // Ensure hue is between 0 and 359
  const saturation = 50;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
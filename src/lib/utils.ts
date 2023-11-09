import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
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

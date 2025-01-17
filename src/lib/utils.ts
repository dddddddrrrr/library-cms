import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (timeInfo: { time: number; label: string }) => {
  switch (timeInfo.label) {
    case "分钟":
      return `${timeInfo.time}m`;
    case "小时":
      return `${timeInfo.time}h`;
    case "天":
      return `${timeInfo.time}d`;
    default:
      throw new Error(`Unknown time unit: ${timeInfo.label}`);
  }
};

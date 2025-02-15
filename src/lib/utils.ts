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

export const getUserInitials = (name: string) => {
  const [firstName, lastName] = name.split(" ");
  return lastName ? `${firstName![0]}${lastName[0]}` : firstName!.slice(0, 2);
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
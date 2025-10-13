import { CRAWLERS } from "@/constants/crawlers";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function camelToTitleCase(input: string): string {
  const result = input
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

  return result
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isCrawler(userAgent: string) {
  if (CRAWLERS.some((pattern) => userAgent.includes(pattern))) {
    return true;
  }

  // automation flags
  if (navigator.webdriver === true) {
    return true;
  }

  // known automation globals
  if (
    "callPhantom" in window ||
    "_phantom" in window ||
    "__nightmare" in window ||
    "__headless" in window ||
    "__pwInitScripts" in window ||
    "__playwright__binding__" in window
  ) {
    return true;
  }

  // simple hardware check (bots may report inconsistent values)
  if (
    navigator.hardwareConcurrency === undefined ||
    navigator.hardwareConcurrency < 1
  ) {
    return true;
  }

  if (navigator.languages.length === 0) {
    return true;
  }

  if (/headless/i.test(userAgent)) {
    return true;
  }

  return false;
}

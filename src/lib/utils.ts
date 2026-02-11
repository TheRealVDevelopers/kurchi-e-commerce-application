import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateGST(gst: string): boolean {
  // Regex for standard Indian GSTIN format:
  // 2 digits (State) + 5 letters (PAN) + 4 digits (PAN) + 1 letter (PAN) + 1 digit + Z + 1 char
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getInitials(name: string) {
  // Remove extra spaces and split into words
  const words = name.trim().split(/\s+/);
  
  // Return initials for first two words
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  
  // For single word names, return first two characters
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  
  // For very short names
  return name.toUpperCase();
}
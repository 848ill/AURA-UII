import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Membersihkan markdown formatting dari text AI response
 * Menghilangkan ** (bold), * (italic), # (headers), dll
 */
export function cleanMarkdown(text: string): string {
  if (!text) return text

  return text
    // Hilangkan bold markdown **text** atau __text__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Hilangkan italic markdown *text* atau _text_
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Hilangkan header markdown # ## ###
    .replace(/^#{1,6}\s+/gm, '')
    // Hilangkan code blocks ```
    .replace(/```[\s\S]*?```/g, '')
    // Hilangkan inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Hilangkan link markdown [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Hilangkan strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Bersihkan multiple spaces menjadi single space
    .replace(/\s{2,}/g, ' ')
    // Trim whitespace
    .trim()
}

/**
 * Format timestamp menjadi relative time (e.g., "5 minutes ago", "yesterday")
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return "Baru saja"
  }

  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} menit yang lalu`
  }

  // Less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} jam yang lalu`
  }

  // Less than 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    if (days === 1) return "Kemarin"
    return `${days} hari yang lalu`
  }

  // More than 7 days - show date
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}


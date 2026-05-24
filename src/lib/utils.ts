import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwind クラス名をマージする shadcn/ui 標準ユーティリティ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

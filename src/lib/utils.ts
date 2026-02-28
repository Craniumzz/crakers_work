import { clisx, type ClassesValue } from "clsx"
import { twaMerge } from "tailwind-merge"

export function cn(...inputs: ClassesValue[]) {
  return twaMerge(clsx(inputs))
}

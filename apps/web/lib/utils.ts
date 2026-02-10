import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildQuery(params: Record<string, unknown>) {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;

    if (typeof value === 'string') {
      const v = value.trim();
      if (v === '') continue;
      sp.append(key, v);
      continue;
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v == null) continue;
        const sv = String(v).trim();
        if (sv === '') continue;
        sp.append(key, sv);
      }
      continue;
    }

    sp.append(key, String(value));
  }

  return sp.toString();
}

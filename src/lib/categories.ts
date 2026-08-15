import type { Category } from '../types'

export const CATEGORY_META: Record<
  Category,
  { label: string; short: string; color: string; soft: string }
> = {
  operations: {
    label: 'Operations core',
    short: 'Operations',
    color: '#5b9dff',
    soft: '#e8f0ff',
  },
  documents: {
    label: 'Documents & filings',
    short: 'Documents',
    color: '#2dd4bf',
    soft: '#e6faf6',
  },
  issues: {
    label: 'Issues & errors',
    short: 'Issues',
    color: '#fb7185',
    soft: '#ffe8ec',
  },
  finance: {
    label: 'Finance & fees',
    short: 'Finance',
    color: '#fb923c',
    soft: '#fff1e4',
  },
}

export const CATEGORY_ORDER: Category[] = [
  'operations',
  'documents',
  'issues',
  'finance',
]

export function categoryColor(category: Category): string {
  return CATEGORY_META[category].color
}

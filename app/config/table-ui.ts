/**
 * Shared `:ui` overrides for `<UTable>` so every list page has the same
 * row, header, and cell styling. Use spreading on the rare table that
 * needs to tweak one of the tokens:
 *
 *   <UTable :ui="{ ...TABLE_UI, tr: 'hover:bg-elevated/40 ...' }" />
 */
export const TABLE_UI = {
  tr: 'cursor-pointer hover:bg-elevated/50 transition-colors',
  th: 'bg-elevated/30 font-semibold',
  td: 'py-3.5'
} as const

/** Per-page dropdown options reused across list pages. */
export const PER_PAGE_OPTIONS = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

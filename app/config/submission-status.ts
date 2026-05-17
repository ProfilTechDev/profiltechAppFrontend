import type { SubmissionStatus } from '~/composables/useCustomOrders'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

interface SubmissionStatusMeta {
  label: string
  color: BadgeColor
}

const STATUS_META: Record<NonNullable<SubmissionStatus> | 'new', SubmissionStatusMeta> = {
  new: { label: 'Ny bestilling', color: 'neutral' },
  draft: { label: 'Kladde', color: 'warning' },
  queued: { label: 'I kø til afsendelse', color: 'info' },
  sent: { label: 'Sendt', color: 'success' },
  failed: { label: 'Afsendelse fejlede', color: 'error' }
}

export function getSubmissionStatusMeta(status: SubmissionStatus): SubmissionStatusMeta {
  return STATUS_META[status ?? 'new']
}

import type { CustomOrder, SubmissionStatus } from '~/composables/useCustomOrders'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

interface SubmissionStatusMeta {
  label: string
  color: BadgeColor
}

const SUBMISSION_META: Record<NonNullable<SubmissionStatus>, SubmissionStatusMeta> = {
  draft: { label: 'Kladde', color: 'warning' },
  queued: { label: 'I kø til afsendelse', color: 'info' },
  sent: { label: 'Sendt', color: 'success' },
  failed: { label: 'Afsendelse fejlede', color: 'error' }
}

type OrderLike = Pick<CustomOrder, 'status' | 'submission_status'>

export function getSubmissionStatusMeta(order: OrderLike): SubmissionStatusMeta {
  const isCompleted = order.status === 'completed'
  const submission = order.submission_status

  if (submission === null) {
    return isCompleted
      ? { label: 'Gennemført – ikke sendt', color: 'success' }
      : { label: 'Ny bestilling', color: 'neutral' }
  }

  const meta = SUBMISSION_META[submission]
  return isCompleted
    ? { label: `Gennemført – ${meta.label}`, color: meta.color }
    : meta
}

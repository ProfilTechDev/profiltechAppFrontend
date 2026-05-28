type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export type TourStatus = 'draft' | 'approved' | 'completed'

interface TourStatusMeta {
  label: string
  color: BadgeColor
}

const STATUS_META: Record<TourStatus, TourStatusMeta> = {
  draft: { label: 'Kladde', color: 'warning' },
  approved: { label: 'Godkendt', color: 'info' },
  completed: { label: 'Færdig', color: 'success' }
}

export function getTourStatusMeta(status: TourStatus): TourStatusMeta {
  return STATUS_META[status]
}

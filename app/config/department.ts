type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export type Department = 'steel_plates' | 'flashings' | 'accessories'

interface DepartmentMeta {
  label: string
  color: BadgeColor
  icon: string
}

const DEPARTMENT_META: Record<Department, DepartmentMeta> = {
  steel_plates: { label: 'Stålplader', color: 'primary', icon: 'i-lucide-layers' },
  flashings: { label: 'Inddækninger', color: 'info', icon: 'i-lucide-fold-horizontal' },
  accessories: { label: 'Tilbehør', color: 'neutral', icon: 'i-lucide-wrench' }
}

export function getDepartmentMeta(department: Department | null | undefined): DepartmentMeta {
  if (!department) return DEPARTMENT_META.accessories
  return DEPARTMENT_META[department]
}

export const DEPARTMENTS: Department[] = ['steel_plates', 'flashings', 'accessories']

/** Distinct departments referenced by the given order lines. */
export function departmentsFromLines(
  lines: ReadonlyArray<{ department: Department | null }>
): Department[] {
  const set = new Set<Department>()
  for (const line of lines) {
    if (line.department) set.add(line.department)
  }
  return [...set]
}

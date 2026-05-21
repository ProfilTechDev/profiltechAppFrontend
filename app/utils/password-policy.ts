/**
 * Single source of truth for the password rules — used by:
 *  - PasswordStrengthMeter (live indicator)
 *  - UForm `validate` functions on every password input
 *
 * Mirror of the Laravel rule set configured in `Password::defaults()`
 * (see App\Providers\AppServiceProvider). If you change the criteria
 * here, change them there too — otherwise backend will reject what
 * the frontend let through.
 */

export interface PasswordCriterion {
  key: string
  label: string
  test: (value: string) => boolean
}

export const PASSWORD_CRITERIA: PasswordCriterion[] = [
  { key: 'length', label: 'Mindst 8 tegn', test: v => v.length >= 8 },
  { key: 'lower', label: 'Mindst ét lille bogstav', test: v => /[a-z]/.test(v) },
  { key: 'upper', label: 'Mindst ét stort bogstav', test: v => /[A-Z]/.test(v) },
  { key: 'number', label: 'Mindst ét tal', test: v => /\d/.test(v) },
  { key: 'symbol', label: 'Mindst ét specialtegn', test: v => /[^a-zA-Z0-9]/.test(v) }
]

export function passwordScore(value: string): number {
  return PASSWORD_CRITERIA.filter(c => c.test(value)).length
}

export function failedCriteria(value: string): PasswordCriterion[] {
  return PASSWORD_CRITERIA.filter(c => !c.test(value))
}

export function isPasswordValid(value: string): boolean {
  return failedCriteria(value).length === 0
}

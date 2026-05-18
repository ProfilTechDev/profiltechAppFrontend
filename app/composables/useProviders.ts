export type ProviderLanguage = 'da' | 'en'

export interface Provider {
  id: string
  name: string
  email: string
  language: ProviderLanguage
}

export function useProviders() {
  return useApiFetch<Provider[]>('/custom-orders/providers', {
    errorTitle: 'Failed to load providers'
  })
}

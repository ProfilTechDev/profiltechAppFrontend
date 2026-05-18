export function useColors() {
  return useApiFetch<Record<string, string>>('/products/colors', {
    key: 'products-colors',
    errorTitle: 'Failed to load colors'
  })
}

import type { ProviderLanguage } from '~/composables/useProviders'

interface MessageTemplate {
  subject: (orderNumber: string) => string
  body: (orderNumber: string, customerName: string) => string
}

export const MESSAGE_TEMPLATES: Record<ProviderLanguage, MessageTemplate> = {
  da: {
    subject: orderNumber => `Bestilling ordrenummer: ${orderNumber}`,
    body: (orderNumber, customerName) =>
      `Bestilling ordrenummer ${orderNumber} mrk: ${customerName}. Svar venligst til hanne@profiltech.dk.`
  },
  en: {
    subject: orderNumber => `Order number: ${orderNumber}`,
    body: (orderNumber, customerName) =>
      `Order number ${orderNumber} ref: ${customerName}. Please reply to hanne@profiltech.dk.`
  }
}

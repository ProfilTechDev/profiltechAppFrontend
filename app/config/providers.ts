export type ProviderLanguage = 'da' | 'en'

export interface Provider {
  id: string
  name: string
  email: string
  language: ProviderLanguage
}

export const PROVIDERS: Provider[] = [
  {
    id: 'byggprofiler',
    name: 'Byggprofiler',
    email: 'TODO@byggprofiler.dk',
    language: 'da'
  },
  {
    id: 'romania',
    name: 'Romænien',
    email: 'TODO@romania-provider.com',
    language: 'en'
  }
]

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

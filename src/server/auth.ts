import { createServerFn } from '@tanstack/react-start'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wohnungsbau2024'

export const checkPassword = createServerFn({ method: 'POST' }).handler(
  async ({ data: password }: { data: string }) => {
    return { valid: password === ADMIN_PASSWORD }
  },
)

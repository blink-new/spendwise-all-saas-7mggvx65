import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'spendwise-all-saas-7mggvx65',
  authRequired: true
})

export default blink
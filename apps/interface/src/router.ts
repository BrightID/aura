import { Router } from '@lit-labs/router'
import { signal } from '@lit-labs/signals'

import 'urlpattern-polyfill'

export const router = signal(null as null | Router)

export const pushRouter = (path: string) => {
  history.pushState('', '', path)
  router.get()?.goto(path)
}

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(params.entries())
}

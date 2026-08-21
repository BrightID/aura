import { Router } from '@lit-labs/router'
import { html, type ReactiveControllerHost } from 'lit'
import { router } from './router'

export const createRouter = (classThis: ReactiveControllerHost & HTMLElement) => {
  const routerValue = new Router(classThis, [
    {
      path: '/interface/login',
      enter: async () => {
        await import('@/routes/login')
        return true
      },
      render: () => html` <app-layout> <login-page></login-page></app-layout>`
    },
    {
      path: '/interface/landings/:id',
      enter: async () => {
        await import('@/routes/project-page')
        return true
      },
      render: ({ id }) =>
        html`<app-layout> <project-landing .projectId=${Number(id)}></project-landing></app-layout>`
    },
    {
      path: '/interface/complete-profile',
      enter: async () => {
        await import('@/routes/complete-profile')
        return true
      },
      render: () => html` <app-layout> <complete-profile></complete-profile></app-layout>`
    },
    {
      path: '/interface/home',
      enter: async () => {
        await import('@/routes/home')
        return true
      },
      render: () => html`<app-layout> <my-home></my-home> <app-footer></app-footer> </app-layout> `
    },
    {
      path: '/interface/projects/:id',
      enter: async () => {
        await import('@/routes/verification')
        return true
      },
      render: ({ id }) =>
        html`<app-layout>
          <verification-page .projectId=${Number(id)}></verification-page> <app-footer></app-footer>
        </app-layout> `
    },
    {
      path: '/interface/activities',
      enter: async () => {
        await import('@/routes/verifiers')
        return true
      },
      render: () =>
        html`<app-layout>
          <verifiers-page></verifiers-page> <app-footer></app-footer>
        </app-layout> `
    },
    {
      path: '/interface/notifications',
      enter: async () => {
        await import('@/routes/notifications')
        return true
      },
      render: () =>
        html`<app-layout>
          <notifications-page></notifications-page> <app-footer></app-footer>
        </app-layout> `
    },
    {
      path: '/interface/share',
      enter: async () => {
        await import('@/routes/share')
        return true
      },
      render: () =>
        html`<app-layout> <share-page></share-page> <app-footer></app-footer> </app-layout> `
    },
    {
      path: '/interface/privacy-policy',
      enter: async () => {
        await import('@/routes/privacy-policy')
        return true
      },
      render: () => html`<app-layout> <privacy-policy></privacy-policy> </app-layout> `
    },
    {
      path: '/interface/dev',
      enter: async () => {
        await import('@/routes/dev')
        return true
      },
      render: () => html`<app-layout> <verification-project></verification-project> </app-layout> `
    },
    {
      path: '/interface/profile',
      enter: async () => {
        await import('@/routes/profile')
        return true
      },
      render: () =>
        html`<app-layout> <profile-page></profile-page> <app-footer></app-footer> </app-layout> `
    },
    {
      path: '/interface/brightid',
      enter: async () => {
        await import('@/routes/brightid')
        return true
      },
      render: () => html`<app-layout> <brightid-login></brightid-login></app-layout>`
    },
    {
      path: '/interface/embed/projects/:id',
      enter: async () => {
        await import('@aura/widgets/verification/index')
        return true
      },
      render: ({ id }) =>
        html`<div style="height:100dvh;overflow:hidden">
          <app-verification-embed .projectId=${Number(id)}></app-verification-embed>
        </div>`
    },
    {
      path: '*',
      enter: async () => {
        await import('@/routes/not-found')
        return true
      },
      render: () => html`<app-layout> <not-found></not-found></app-layout>`
    }
  ])

  router.set(routerValue)

  return routerValue
}

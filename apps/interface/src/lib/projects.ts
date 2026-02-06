import { signal } from '@lit-labs/signals'
import { localStorageSignal } from './state'
import { Project } from '@/types'

export const enrolledProjects = localStorageSignal('enrolledProjects', [])

export const focusedProject = signal(null as Project | null)

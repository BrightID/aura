import type { BrightIdApp } from "./brightid"

export type Project = {
  id: string
  name: string
  description: string
  requirementLevel: number | null
  websiteUrl?: string
  image?: string
  landingMarkdown?: string
  remainingtokens: number
  brightIdAppId: string
  deadline: string | null
  isActive: boolean
  logoUrl?: string | null
  selectedPlanId?: number | null
  createdAt: string
  updatedAt?: string
  brightIdApp?: BrightIdApp
}

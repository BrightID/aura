import axios from "axios"

// Dashboard API base URL - using environment variable for flexibility
const DASHBOARD_API_BASE = import.meta.env.VITE_SOME_AURA_DASHBOARD_API_URL || 'https://dashboard.aura.brightid.org'

const $http = axios.create({
  baseURL: DASHBOARD_API_BASE,
  headers: { 
    "Cache-Control": "no-cache",
    "Content-Type": "application/json"
  },
  timeout: 60 * 1000,
})

export const dashboardApi = {
  // Project endpoints
  getProjectsList: async () => {
    return $http.get('/api/projects/list')
  },

  updateProject: async (projectId: string, projectData: any) => {
    return $http.post(`/api/projects/update-project`, { 
      projectId,
      ...projectData 
    })
  },

  createProject: async (projectData: any) => {
    return $http.post('/api/projects/create-project', projectData)
  },

  upgradeProject: async (projectId: string, planId: string) => {
    return $http.post(`/api/projects/upgrade-project`, { 
      projectId,
      planId
    })
  },

  updateProjectBrightid: async (projectId: string, brightId: string) => {
    return $http.post(`/api/projects/update-project-brightid`, { 
      projectId,
      brightId
    })
  },

  // Payment endpoints
  getPaymentsHistory: async () => {
    return $http.get('/api/payments/history')
  },

  getPaymentStatus: async (orderId: string) => {
    return $http.get(`/api/payments/status/${orderId}`)
  },

  createInvoice: async (invoiceData: any) => {
    return $http.post('/api/payments/create-invoice', invoiceData)
  },

  createPayment: async (paymentData: any) => {
    return $http.post('/api/payments/create-payment', paymentData)
  }
}
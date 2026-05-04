import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "store"
import { AURA_NODE_URL_PROXY } from "@/constants/urls"
import { RESET_STORE } from "@/features/brightid/actions/reset.store"
import { __DEV__ } from "@/utils/env"

const ProdCandidates = [AURA_NODE_URL_PROXY]
const TestCandidates = [AURA_NODE_URL_PROXY]

export enum RoleStatus {
  NOT_SET,
  HIDE,
  SHOW,
}

export interface SettingsSlice {
  baseUrl: string | null
  nodeUrls: Array<string>
  isPrimaryDevice: boolean
  lastSyncTime: number
  languageTag: string | null
  prefferedTheme: "dark" | "light"
  isSearchModalOpen?: boolean
  hasManagerRole?: RoleStatus
  hasTrainerRole?: RoleStatus
}

const initialState: SettingsSlice = {
  baseUrl: AURA_NODE_URL_PROXY,
  nodeUrls: __DEV__ ? TestCandidates : ProdCandidates,
  isPrimaryDevice: true,
  lastSyncTime: 0,
  languageTag: null,
  prefferedTheme: "dark",
  isSearchModalOpen: false,
  hasManagerRole: RoleStatus.NOT_SET,
  hasTrainerRole: RoleStatus.NOT_SET,
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleManagerRole(state) {
      if (state.hasManagerRole === undefined) {
        state.hasManagerRole = RoleStatus.HIDE
      } else if (state.hasManagerRole === RoleStatus.HIDE) {
        state.hasManagerRole = RoleStatus.SHOW
      } else {
        state.hasManagerRole = RoleStatus.HIDE
      }
    },
    toggleTrainerRole(state) {
      if (state.hasTrainerRole === undefined) {
        state.hasTrainerRole = RoleStatus.HIDE
      } else if (state.hasTrainerRole === RoleStatus.HIDE) {
        state.hasTrainerRole = RoleStatus.SHOW
      } else {
        state.hasTrainerRole = RoleStatus.HIDE
      }
    },
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload
    },
    clearBaseUrl: (state) => {
      state.baseUrl = null
    },
    setPrefferedTheme: (state, action: PayloadAction<"dark" | "light">) => {
      state.prefferedTheme = action.payload
    },
    addNodeUrl: (state, action: PayloadAction<string>) => {
      const newNodeUrl = action.payload.toLowerCase()
      if (!state.nodeUrls.includes(newNodeUrl))
        state.nodeUrls.push(action.payload)
    },
    removeNodeUrl: (state, action: PayloadAction<string>) => {
      const removeUrl = action.payload.toLowerCase()
      state.nodeUrls = state.nodeUrls.filter(
        (url) => url.toLowerCase() !== removeUrl,
      )
      if (state.baseUrl?.toLowerCase() === removeUrl) {
        state.baseUrl = null
      }
    },
    removeCurrentNodeUrl: (state) => {
      if (state.baseUrl) {
        console.log(`Removing active node ${state.baseUrl}`)
        state.nodeUrls = state.nodeUrls.filter(
          (url) => url.toLowerCase() !== state.baseUrl,
        )
        state.baseUrl = null
      } else {
        console.log(`No active node to remove`)
      }
    },
    resetNodeUrls: (state) => {
      console.log(`Resetting node urls`)
      state.nodeUrls = initialState.nodeUrls
      if (state.baseUrl && !state.nodeUrls.includes(state.baseUrl)) {
        console.log(`current baseUrl removed from nodeList. Clearing baseUrl.`)
        state.baseUrl = initialState.baseUrl
      }
    },
    setPrimaryDevice: (state, action: PayloadAction<boolean>) => {
      state.isPrimaryDevice = action.payload
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload
    },
    setLanguageTag: (state, action: PayloadAction<string>) => {
      state.languageTag = action.payload
    },
    resetLanguageTag: (state) => {
      state.languageTag = initialState.languageTag
    },
    toggleSearchModal: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === RESET_STORE,
      () => initialState,
    )
  },
})

export const {
  setBaseUrl,
  clearBaseUrl,
  addNodeUrl,
  removeNodeUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  setPrimaryDevice,
  setLastSyncTime,
  setLanguageTag,
  resetLanguageTag,
  setPrefferedTheme,
  toggleSearchModal,
  toggleManagerRole,
  toggleTrainerRole,
} = settingsSlice.actions

export const selectBaseUrl = () => AURA_NODE_URL_PROXY
export const selectPreferredTheme = (state: RootState) =>
  state.settings.prefferedTheme ?? "dark"

export const selectAllNodeUrls = (state: RootState) => state.settings.nodeUrls
export const selectDefaultNodeUrls = () => initialState.nodeUrls
export const selectIsPrimaryDevice = (state: RootState) =>
  state.settings.isPrimaryDevice
export const selectLastSyncTime = (state: RootState) =>
  state.settings.lastSyncTime
export const selectLanguageTag = (state: RootState) =>
  state.settings.languageTag

export const selectManagerRoleState = (state: RootState) =>
  state.settings.hasManagerRole

export const selectTrainerRoleState = (state: RootState) =>
  state.settings.hasTrainerRole

export const selectHasManagerRole = (state: RootState) =>
  state.settings.hasManagerRole !== RoleStatus.HIDE

export const selectTrainerRole = (state: RootState) =>
  state.settings.hasTrainerRole !== RoleStatus.HIDE

export const selectIsSearchModalOpen = (state: RootState) =>
  state.settings.isSearchModalOpen

export default settingsSlice.reducer

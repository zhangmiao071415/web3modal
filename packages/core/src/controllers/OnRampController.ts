import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { ONRAMP_PROVIDERS } from '../utils/ConstantsUtil'

// -- Types ------------------.-------------------------- //
export type OnRampProviderOption = 'coinbase' | 'moonpay' | 'stripe' | 'paypal'

export type OnRampProvider = {
  label: string
  name: OnRampProviderOption
  feeRange: string
  url: string
}

export interface OnRampControllerState {
  providers: OnRampProvider[]
  selectedProvider: OnRampProvider | null
  error: string | null
}

type StateKey = keyof OnRampControllerState

// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>({
  providers: ONRAMP_PROVIDERS as OnRampProvider[],
  selectedProvider: null,
  error: null
})

// -- Controller ---------------------------------------- //
export const OnRampController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: OnRampControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setSelectedProvider(provider: OnRampProvider | null) {
    state.selectedProvider = provider
  }
}

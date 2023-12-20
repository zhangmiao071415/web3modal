import '@web3modal/polyfills'

import type { Config, CreateConnectorFn } from '@wagmi/core'
import { type Chain } from 'viem/chains'
import { createConfig } from '@wagmi/core'

import { createClient, http } from 'viem'
import { coinbaseWallet, walletConnect, injected } from '@wagmi/connectors'
import { emailConnector } from '../connectors/EmailConnectorv2.js'

export interface ConfigOptions {
  projectId: string
  chains: Chain[]
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
    verifyUrl: string
  }
  enableInjected?: boolean
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  enableWalletConnect?: boolean
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableInjected,
  enableCoinbase,
  enableWalletConnect,
  enableEmail,
  enableEIP6963
}: ConfigOptions): Config {
  const connectors: CreateConnectorFn[] = []

  // Enabled by default
  if (enableWalletConnect !== false) {
    connectors.push(walletConnect({ projectId, metadata, showQrModal: false }))
  }

  if (enableInjected !== false) {
    connectors.push(injected({ shimDisconnect: true }))
  }

  if (enableCoinbase !== false) {
    connectors.push(coinbaseWallet({ appName: metadata?.name ?? 'Unknown' }))
  }

  // Dissabled by default
  if (enableEmail === true) {
    connectors.push(emailConnector({ chains, options: { projectId } }))
  }

  return createConfig({
    chains: chains as [Chain, ...Chain[]],
    client: ({ chain }) =>
      createClient({
        chain,
        transport: http()
      }),
    connectors,
    multiInjectedProviderDiscovery: enableEIP6963 !== false
  })
}

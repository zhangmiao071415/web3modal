import { Center, Text, VStack } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { SiweMessage } from 'siwe'
import { getCsrfToken, signIn, signOut, getSession, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  arbitrum,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora
} from 'wagmi/chains'
import { WagmiConnectButton } from '../../components/Wagmi/WagmiConnectButton'
import { NetworksButton } from '../../components/NetworksButton'
import { ThemeStore } from '../../utils/StoreUtil'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs, SIWESession } from '@web3modal/core'
import { createSIWEConfig } from '@web3modal/siwe'

// 0. Setup queryClient for WAGMIv2
const queryClient = new QueryClient()

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora
]

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  verifyUrl: ''
}

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
})

const siweConfig = createSIWEConfig({
  createMessage: ({ nonce, address, chainId }: SIWECreateMessageArgs) =>
    new SiweMessage({
      version: '1',
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: 'Sign in With Ethereum.'
    }).prepareMessage(),
  getNonce: async () => {
    const nonce = await getCsrfToken()
    if (!nonce) {
      throw new Error('Failed to get nonce!')
    }

    return nonce
  },
  getSession: async () => {
    const session = await getSession()
    if (!session) {
      throw new Error('Failed to get session!')
    }

    const { address, chainId } = session as unknown as SIWESession

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn('credentials', {
        message,
        redirect: false,
        signature,
        callbackUrl: '/protected'
      })

      return Boolean(success?.ok)
    } catch (error) {
      return false
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false
      })

      return true
    } catch (error) {
      return false
    }
  }
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: true,
  metadata,
  siweConfig
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  const [ready, setReady] = useState(false)
  const { data, status } = useSession()
  const session = data as unknown as SIWESession

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Center paddingTop={10}>
          <Text fontSize="xl" fontWeight={700}>
            Wagmi with SIWE
          </Text>
        </Center>
        <Center h="65vh">
          <VStack gap={4}>
            <Text>Status: {status}</Text>
            {session && (
              <>
                <Text>Network: eip155:{session.chainId}</Text>
                <VStack>
                  <Text>Address:</Text>
                  <Text isTruncated={true} fontSize="sm">
                    {session.address}
                  </Text>
                </VStack>
              </>
            )}
            <WagmiConnectButton />
            <NetworksButton />
          </VStack>
        </Center>
      </QueryClientProvider>
    </WagmiProvider>
  ) : null
}

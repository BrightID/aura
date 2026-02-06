import { injected, walletConnect } from '@wagmi/connectors'
import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({
      shimDisconnect: true
    }),
    walletConnect({
      projectId: import.meta.env['VITE_SOME_WALLET_CONNECT_PROJECT_ID']!
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  }
})

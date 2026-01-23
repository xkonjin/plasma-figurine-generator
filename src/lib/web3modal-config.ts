import { createWeb3Modal } from '@web3modal/wagmi';
import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

// Define Plasma chain
export const plasmaChain = {
  id: 9745,
  name: 'Plasma',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.plasma.to'] },
    public: { http: ['https://rpc.plasma.to'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.plasma.to' },
  },
} as const;

// WalletConnect project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Wagmi config
export const wagmiConfig = createConfig({
  chains: [plasmaChain as any],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      showQrModal: false,
    }),
  ],
  transports: {
    [plasmaChain.id]: http(),
  },
});

// Create Web3Modal
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
  },
});

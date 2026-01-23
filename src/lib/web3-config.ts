import { http, createConfig } from 'wagmi';
import { plasma } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Define Plasma chain if not in wagmi/chains
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
};

// WalletConnect project ID (public, can be shared)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = createConfig({
  chains: [plasmaChain as any],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [plasmaChain.id]: http(),
  },
});

import { setupManifest } from '@start9labs/start-sdk'
import { depElementsDescription, depLndDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'peerswap',
  title: 'PeerSwap',
  license: 'mit',
  packageRepo: 'https://github.com/Start9Labs/peerswap-startos',
  upstreamRepo: 'https://github.com/ElementsProject/peerswap',
  marketingUrl: 'https://www.peerswap.dev/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    peerswap: {
      source: {
        dockerBuild: {},
      },
      arch: ['aarch64', 'x86_64'],
    },
  },
  dependencies: {
    // The lightning backend. Optional at the manifest level; `dependencies.ts`
    // turns it into a hard running-dependency once a backend is configured.
    lnd: {
      description: depLndDescription,
      optional: true,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
    },
    // Liquid (L-BTC) backend. Only becomes a running dependency when the user
    // enables Liquid swaps; otherwise peerswap runs Bitcoin-only.
    elements: {
      description: depElementsDescription,
      optional: true,
      metadata: {
        title: 'Elements (Liquid)',
        // start-cli fetches + rasterizes this at pack time, so it MUST resolve
        // to a real image. TODO: repoint to elements-startos's own icon.svg
        // once that package is published (its master raw URL).
        icon: 'https://raw.githubusercontent.com/ElementsProject/elements/master/share/pixmaps/bitcoin256.png',
      },
    },
  },
})

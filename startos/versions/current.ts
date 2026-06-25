import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '5.0.4:0',
  releaseNotes: {
    en_US:
      'Initial native StartOS package for PeerSwap (peerswap-web v5.0.4). LND backend with Bitcoin swaps; Liquid (L-BTC) swaps available via the optional Elements dependency. Incoming swap requests are off by default.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

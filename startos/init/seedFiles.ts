import { settingsFile } from '../fileModels/settings'
import { sdk } from '../sdk'

/**
 * Seed StartOS-managed settings on fresh install with safe defaults:
 * LND backend, Liquid OFF, incoming swap requests OFF (peerswap is beta and
 * moves real funds).
 */
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await settingsFile.merge(effects, {
      lightningBackend: 'lnd',
      liquidEnabled: false,
      allowSwapRequests: false,
      localMempoolUrl: '',
    })
  }
})

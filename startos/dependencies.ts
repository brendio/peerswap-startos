import { settingsFile } from './fileModels/settings'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const settings = await settingsFile.read().const(effects)

  const deps: Awaited<ReturnType<Parameters<typeof sdk.setupDependencies>[0]>> =
    {}

  // Lightning backend. LND is the only supported backend today; it becomes a
  // hard running-dependency whenever the backend is configured (always, on a
  // fresh install we seed lightningBackend='lnd').
  if (!settings || settings.lightningBackend === 'lnd') {
    deps.lnd = {
      kind: 'running',
      versionRange: '>=0.20.1-beta',
      healthChecks: ['lnd'],
    }
  }

  // Liquid backend. Only a running dependency once the user enables Liquid swaps.
  if (settings?.liquidEnabled) {
    deps.elements = {
      kind: 'running',
      versionRange: '>=23.2.1',
      // Health check id exposed by the sibling elements-startos package. Adjust
      // to match that package's actual RPC health-check id.
      healthChecks: ['rpc'],
    }
  }

  return deps
})

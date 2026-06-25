import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * StartOS-managed settings — the single source of truth for everything the user
 * controls through Actions. The `reconcile-config` oneshot reads this on every
 * start and (re)writes `peerswap.conf` + `pswebconfig.json` from it, so neither
 * psweb's `SavePS()` nor a hand-edit of those files can drift the running
 * configuration away from what StartOS owns.
 *
 * This file lives on the `main` volume and is NOT consumed by the upstream
 * binaries directly.
 */
export const shape = z.object({
  // Which lightning backend peerswapd talks to. LND only for now; structured as
  // a field so a CLN backend can slot in later (see plan, Phase 2).
  lightningBackend: z.enum(['lnd']).catch('lnd'),

  // Whether the user has opted into Liquid (L-BTC) swaps. When true we declare a
  // running dependency on `elements` and write the elementsd.* keys. When false,
  // peerswapd runs Bitcoin-only with no Liquid errors.
  liquidEnabled: z.boolean().catch(false),

  // peerswap is BETA software that moves real funds. Incoming swap requests are
  // OFF by default; the user must explicitly opt in via the action.
  allowSwapRequests: z.boolean().catch(false),

  // Optional local mempool/explorer base URL (e.g. a self-hosted mempool). Empty
  // string means "use upstream default (mempool.space)".
  localMempoolUrl: z.string().catch(''),
})

export type Settings = z.infer<typeof shape>

export const settingsFile = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/startos-settings.json' },
  shape,
)

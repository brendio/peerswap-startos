import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Typed model for psweb's `pswebconfig.json`.
 *
 * psweb (peerswap-web) marshals its Go `Configuration` struct with
 * `json.MarshalIndent` and NO json tags, so the JSON keys are the Go field
 * names verbatim (PascalCase): `AllowSwapRequests`, `ListenPort`, `RpcHost`,
 * `DataDir`, `BitcoinSwaps`, `LocalMempool`, `Elements*`, etc.
 *
 * We only declare and manage the StartOS-owned subset and `.passthrough()` the
 * rest so that values psweb itself writes (telegram, autoswap, color scheme,
 * peg-in bookkeeping, ...) survive a reconcile.
 */
export const shape = z
  .object({
    AllowSwapRequests: z.boolean().optional(),
    RpcHost: z.string().optional(),
    ListenPort: z.string().optional(),
    DataDir: z.string().optional(),
    BitcoinSwaps: z.boolean().optional(),
    LocalMempool: z.string().optional(),
    ElementsHost: z.string().optional(),
    ElementsPort: z.string().optional(),
    ElementsUser: z.string().optional(),
    ElementsPass: z.string().optional(),
    ElementsWallet: z.string().optional(),
  })
  .passthrough()

export type PswebConfig = z.infer<typeof shape>

export const pswebConfigFile = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/pswebconfig.json' },
  shape,
)

import { T } from '@start9labs/start-sdk'
import { readFile } from 'fs/promises'
import { peerswapConfFile, PeerswapConf } from './fileModels/peerswapConf'
import { pswebConfigFile } from './fileModels/pswebConfig'
import { Settings } from './fileModels/settings'
import {
  elementsCookiePath,
  elementsRpcHost,
  elementsRpcPort,
  elementsRpcWallet,
  lndCertPath,
  lndGrpcHost,
  lndMacaroonPath,
  peerswapdHost,
  peerswapdPort,
  uiPort,
} from './utils'

type ElementsCreds = { user: string; pass: string }

/**
 * Read the elements (Liquid) RPC credentials from the mounted `elements`
 * dependency volume.
 *
 * CONTRACT (must match the sibling elements-startos build): the elements
 * package exposes a bitcoind/elementsd-style `.cookie` file at
 * `${elementsMountpoint}/.cookie` whose contents are `<user>:<pass>`. If that
 * package instead surfaces an explicit rpcuser/rpcpassword file, adapt here.
 *
 * Returns null when Liquid is enabled but credentials aren't available yet
 * (e.g. elements still starting); callers then fall back to Bitcoin-only so the
 * daemon never crashes on a missing cookie.
 */
async function readElementsCredentials(): Promise<ElementsCreds | null> {
  try {
    const raw = (await readFile(elementsCookiePath, 'utf-8')).trim()
    const sep = raw.indexOf(':')
    if (sep === -1) return null
    return { user: raw.slice(0, sep), pass: raw.slice(sep + 1) }
  } catch {
    return null
  }
}

/**
 * Build the `peerswap.conf` contents from StartOS-managed settings.
 *
 * NOTE on LND TLS/ALPN: we point peerswapd at LND's REAL internal gRPC
 * (`lnd.startos:10009`) using the REAL mounted `tls.cert`. Unlike the legacy
 * homelab setup (which hit StartOS's external TLS proxy), this should NOT
 * require `GRPC_ENFORCE_ALPN_ENABLED=false` or any hand-extracted cert chain.
 * VERIFY ON-NODE that peerswapd connects cleanly without those overrides.
 */
function buildPeerswapConf(
  settings: Settings,
  elementsCreds: ElementsCreds | null,
): PeerswapConf {
  const conf: PeerswapConf = {}

  // peerswapd's own RPC listen address (psweb/pscli connect here).
  conf['host'] = `${peerswapdHost}:${peerswapdPort}`

  // Lightning backend. Only LND today; gate on the setting so CLN can slot in.
  if (settings.lightningBackend === 'lnd') {
    conf['lnd.host'] = lndGrpcHost
    conf['lnd.macaroonpath'] = lndMacaroonPath
    conf['lnd.tlscertpath'] = lndCertPath
  }

  // Bitcoin swaps are always available with an LND backend.
  conf['bitcoinswaps'] = 'true'

  // Liquid: only when the user enabled it AND credentials are present.
  if (settings.liquidEnabled && elementsCreds) {
    conf['elementsd.rpchost'] = elementsRpcHost
    conf['elementsd.rpcport'] = elementsRpcPort
    conf['elementsd.rpcuser'] = elementsCreds.user
    conf['elementsd.rpcpass'] = elementsCreds.pass
    conf['elementsd.rpcwallet'] = elementsRpcWallet
    conf['elementsd.liquidswaps'] = 'true'
  }

  return conf
}

/**
 * Reconcile the upstream config files from StartOS-managed settings.
 *
 * Runs as a `reconcile-config` oneshot BEFORE peerswapd starts. This is the
 * proper, supervisord-free replacement for the old `fix-peerswap.sh` wrapper:
 * peerswapd reads a config we fully own, and although psweb's `SavePS()` may
 * later rewrite `peerswap.conf`, peerswapd has already started against the
 * correct file by then.
 *
 * Idempotent and safe to run on every boot.
 */
export async function reconcileConfig(
  effects: T.Effects,
  settings: Settings,
): Promise<void> {
  const elementsCreds = settings.liquidEnabled
    ? await readElementsCredentials()
    : null

  if (settings.liquidEnabled && !elementsCreds) {
    console.warn(
      'reconcile-config: Liquid is enabled but elements credentials are not ' +
        'yet available at the mounted cookie path; starting Bitcoin-only for now.',
    )
  }

  await peerswapConfFile.write(
    effects,
    buildPeerswapConf(settings, elementsCreds),
  )

  // Pin the psweb-managed JSON to the StartOS-owned values. Merge so psweb's
  // own fields (autoswap, telegram, color scheme, ...) are preserved.
  await pswebConfigFile.merge(effects, {
    AllowSwapRequests: settings.allowSwapRequests,
    RpcHost: `${peerswapdHost}:${peerswapdPort}`,
    ListenPort: String(uiPort),
    BitcoinSwaps: true,
    LocalMempool: settings.localMempoolUrl,
    ...(settings.liquidEnabled && elementsCreds
      ? {
          ElementsHost: elementsRpcHost,
          ElementsPort: elementsRpcPort,
          ElementsUser: elementsCreds.user,
          ElementsPass: elementsCreds.pass,
          ElementsWallet: elementsRpcWallet,
        }
      : {}),
  })
}

// Shared constants and helpers used across the package codebase.
import { sdk } from './sdk'

/** Web UI port served by peerswap-web (psweb). */
export const uiPort = 1984

/**
 * peerswapd gRPC/REST listen address inside the subcontainer. psweb (pscli)
 * connects to this to drive peerswapd. Upstream default is localhost:42069.
 */
export const peerswapdHost = 'localhost'
export const peerswapdPort = 42069

/**
 * Data directory for peerswapd + psweb on the `main` volume. Holds
 * peerswap.conf, policy.conf, pswebconfig.json and peerswapd's swap database.
 * Mounted into the subcontainer at /root/.peerswap (psweb/peerswapd default
 * when running as root).
 */
export const dataDirMountpoint = '/root/.peerswap'

/** Mountpoint for the (read-only) LND dependency volume. */
export const lndMountpoint = '/mnt/lnd'

/** Mountpoint for the (read-only) elements dependency volume (Liquid). */
export const elementsMountpoint = '/mnt/elements'

// --- Paths LND exposes inside its mounted volume (StartOS 0.4 lnd package) ---
export const lndMacaroonPath = `${lndMountpoint}/data/chain/bitcoin/mainnet/admin.macaroon`
export const lndCertPath = `${lndMountpoint}/tls.cert`
/** Internal hostname:port for LND's real gRPC endpoint on StartOS. */
export const lndGrpcHost = 'lnd.startos:10009'

// --- elements dependency contract (see ABOUT.md / sibling elements-startos) ---
//
// We expect the `elements` package to expose, on its mounted volume:
//   - an RPC cookie file at `${elementsMountpoint}/.cookie` of the form
//     `<user>:<pass>` (bitcoind/elementsd `.cookie` convention), OR
//   - rpcuser/rpcpassword that the elements package surfaces via that cookie.
// Liquid mainnet RPC is reachable at `elements.startos:7041`.
//
// NOTE: this contract MUST be reconciled with the sibling elements-startos
// build. If that package writes credentials under a different filename
// (e.g. `elements.conf` or a custom credentials file), update
// `readElementsCredentials` in reconcileConfig.ts accordingly.
export const elementsCookiePath = `${elementsMountpoint}/.cookie`
export const elementsRpcHost = 'http://elements.startos'
export const elementsRpcPort = '7041'
export const elementsRpcWallet = 'peerswap'

export const mainMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  mountpoint: dataDirMountpoint,
  readonly: false,
  subpath: null,
  type: 'directory',
})

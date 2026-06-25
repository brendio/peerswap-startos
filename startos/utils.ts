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
// LND nests the admin macaroon under the active network:
//   <mount>/data/chain/bitcoin/<network>/admin.macaroon  (mainnet|signet|testnet|regtest)
// We discover <network> at runtime from the mounted volume rather than assume
// mainnet — see resolveLndMacaroonPath() in reconcileConfig.ts.
export const lndChainDir = `${lndMountpoint}/data/chain/bitcoin`
/** Fallback when the chain dir can't be read yet (LND still initializing). */
export const lndMacaroonPath = `${lndChainDir}/mainnet/admin.macaroon`
export const lndCertPath = `${lndMountpoint}/tls.cert`
/** Internal hostname:port for LND's real gRPC endpoint on StartOS. */
export const lndGrpcHost = 'lnd.startos:10009'

// --- elements dependency contract (reconciled with sibling elements-startos) ---
//
// The `elements` package (id `elements`) exposes, on its read-only mounted
// volume, the elementsd RPC cookie. Because elementsd runs the `liquidv1`
// chain, the cookie is nested under the chain subdir:
//   `${elementsMountpoint}/liquidv1/.cookie`
// Its contents are `__cookie__:<password>` (bitcoind/elementsd convention);
// `readElementsCredentials` splits on the first `:` -> user `__cookie__`,
// pass `<password>`, which elementsd accepts for RPC auth.
// Liquid mainnet RPC is reachable at `elements.startos:7041`, wallet `peerswap`
// (pre-created by the elements package). Dep health check id: `elementsd`.
export const elementsCookiePath = `${elementsMountpoint}/liquidv1/.cookie`
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

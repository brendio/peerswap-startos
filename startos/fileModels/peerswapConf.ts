import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Typed model for peerswapd's `peerswap.conf`.
 *
 * The upstream format is a FLAT `key=value` file (one per line, `#` comments)
 * with dotted keys, e.g.:
 *
 *   lnd.host=lnd.startos:10009
 *   lnd.macaroonpath=/mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon
 *   lnd.tlscertpath=/mnt/lnd/tls.cert
 *   bitcoinswaps=true
 *   elementsd.rpchost=http://elements.startos
 *   elementsd.rpcport=7041
 *   elementsd.rpcuser=...
 *   elementsd.rpcpass=...
 *   elementsd.rpcwallet=peerswap
 *   elementsd.liquidswaps=true
 *
 * We model it as a string->string map and serialize deterministically. Keys are
 * only emitted when present, so Bitcoin-only installs simply omit every
 * `elementsd.*` key.
 */
export const shape = z.record(z.string(), z.string())

export type PeerswapConf = z.infer<typeof shape>

function toFile(data: PeerswapConf): string {
  const header =
    '# Managed by StartOS — edits here are overwritten on every start.\n' +
    '# Change settings via the PeerSwap service Actions instead.\n'
  const body = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  return `${header}${body}\n`
}

function fromFile(raw: string): unknown {
  const out: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return out
}

export const peerswapConfFile = FileHelper.raw<PeerswapConf>(
  { base: sdk.volumes.main, subpath: '/peerswap.conf' },
  toFile,
  fromFile,
  (data) => shape.parse(data),
)

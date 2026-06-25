export const DEFAULT_LANG = 'en_US'

const dict = {
  'Allow Incoming Swap Requests': 0,
  'Allow your channel peers to initiate swaps with your node. When off, you can still initiate swaps yourself.': 1,
  'Choose which Lightning implementation PeerSwap uses': 2,
  'Control whether peers may initiate swaps with your node (default off)': 3,
  'Could not reach the PeerSwap daemon.': 4,
  'Display your Lightning node pubkey and, if Liquid is enabled, a Liquid address': 5,
  'Enable L-BTC (Liquid) swaps. This requires the Elements (Liquid) service to be installed and running. When disabled, PeerSwap performs Bitcoin-only swaps.': 6,
  'Enable Liquid Swaps': 7,
  'Enabling Liquid adds a running dependency on the Elements (Liquid) service. Make sure it is installed first.': 8,
  'LND': 9,
  'Lightning Backend': 10,
  'Liquid Address': 11,
  'Liquid is not enabled.': 12,
  'Local Mempool URL': 13,
  'Node Info': 14,
  'Optional base URL of a local mempool/block explorer (e.g. a self-hosted mempool). Leave blank to use the public default.': 15,
  'PeerSwap Daemon': 16,
  'PeerSwap is BETA software that moves real funds. Enabling this lets peers initiate swaps against your node.': 17,
  'PeerSwap is BETA software that moves real funds. Only allow incoming swap requests from peers you trust. Off by default for safety.': 18,
  'PeerSwap node details': 19,
  'Peers / Node Info': 20,
  'Point PeerSwap Web at a local mempool/explorer for transaction links': 21,
  'Select Lightning Backend': 22,
  'Set Local Mempool URL': 23,
  'Show Node Info': 24,
  'Starting PeerSwap!': 25,
  'The Lightning node PeerSwap connects to. Only LND is supported today; Core Lightning is planned.': 26,
  'The PeerSwap Web management interface': 27,
  'The PeerSwap daemon is not ready': 28,
  'The PeerSwap daemon is ready': 29,
  'The web interface is not ready': 30,
  'The web interface is ready': 31,
  'Toggle Liquid (L-BTC) swap support, gating the Elements dependency': 32,
  'Web Interface': 33,
  'Web UI': 34,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

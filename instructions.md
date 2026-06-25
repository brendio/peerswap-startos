# PeerSwap

PeerSwap lets you rebalance your Lightning channels by swapping off-chain Lightning liquidity for on-chain Bitcoin (and optionally Liquid L-BTC) directly with your channel peers.

> ⚠️ **PeerSwap is BETA software that moves real funds.** Swaps are irreversible on-chain operations. Start small, and only allow incoming swaps from peers you trust.

## Requirements

- **LND** must be installed and running. PeerSwap connects to it automatically over the StartOS internal network (`lnd.startos:10009`) using LND's mounted macaroon and TLS certificate — no manual credential copying.
- (Optional) **Elements (Liquid)** must be installed and running if you want L-BTC swaps.

## Getting started

1. Install and start the service. PeerSwap will connect to LND and start **Bitcoin-only**.
2. Open the **Web UI** (the `ui` interface) over your `.local` LAN address or Tor.
3. Review the Actions:
   - **Select Lightning Backend** — LND today (CLN planned).
   - **Allow Incoming Swap Requests** — *off by default*. Turn on only if you want peers to be able to initiate swaps with you.
   - **Enable Liquid Swaps** — requires the Elements (Liquid) service; turning this on adds a running dependency on it.
   - **Set Local Mempool URL** — optional; point transaction links at a self-hosted mempool/explorer.
   - **Show Node Info** — display peers and (if Liquid is on) a Liquid address.

## Configuration is StartOS-managed

`peerswap.conf` and `pswebconfig.json` are written from StartOS-managed settings on every start. Do **not** edit them by hand — your changes will be overwritten on the next start. Use the Actions instead.

## Backups

The `main` volume (peerswapd swap database, `policy.conf`, `pswebconfig.json`) is included in StartOS backups. Your Lightning funds live in LND, and any Liquid wallet state lives in the Elements service — back those up separately.

PeerSwap is a peer-to-peer asset swap plugin/daemon for the Lightning Network. It lets node operators rebalance their Lightning channels by atomically swapping off-chain Lightning liquidity for on-chain Bitcoin — and optionally Liquid (L-BTC) — directly with their channel peers, without a trusted third party or a centralized service.

This package runs PeerSwap natively on StartOS:

- **peerswapd** — the PeerSwap daemon, connected to your LND node over its internal gRPC endpoint using the mounted macaroon and TLS certificate.
- **PeerSwap Web (psweb)** — a web UI (port 1984) for managing swaps, exposed automatically over Tor and LAN-HTTPS.

**Bitcoin-only by default.** Liquid (L-BTC) swaps are optional and require the separate Elements (Liquid) service to be installed; enable them from the service Actions. When Elements is absent, PeerSwap performs Bitcoin-only swaps with no errors.

**⚠️ PeerSwap is BETA software that moves real funds.** Incoming swap requests are disabled by default. Only enable them, and only swap with peers you trust, once you understand the risks.

### Elements (Liquid) dependency contract

When Liquid swaps are enabled, this package mounts the `elements` package's volume read-only at `/mnt/elements` and reads its RPC credentials from a bitcoind/elementsd-style cookie file at `/mnt/elements/.cookie` (`user:pass`). Liquid mainnet RPC is expected at `elements.startos:7041`, and PeerSwap uses/creates a wallet named `peerswap`. If the sibling `elements-startos` package exposes credentials differently, the reconcile logic (`startos/reconcileConfig.ts`) must be updated to match.

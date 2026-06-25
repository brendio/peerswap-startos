<p align="center">
  <img src="icon.svg" alt="PeerSwap Logo" width="21%">
</p>

# PeerSwap on StartOS

> **Upstream daemon:** <https://github.com/ElementsProject/peerswap>
> **Web UI:** <https://github.com/Impa10r/peerswap-web>

PeerSwap is a peer-to-peer Lightning channel-balancing tool. It atomically swaps off-chain Lightning liquidity for on-chain Bitcoin (and optionally Liquid L-BTC) directly with your channel peers. This package runs it natively on StartOS against the LND package.

> ⚠️ **PeerSwap is BETA software that moves real funds.** Incoming swap requests are off by default.

---

## Image and Container Runtime

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Image         | built from source (`dockerBuild`)                |
| Architectures | x86_64, aarch64                                  |
| Binaries      | `peerswapd`, `pscli`, `psweb`                    |
| Daemons       | `reconcile-config` (oneshot), `peerswapd`, `psweb` |

---

## Volume and Data Layout

| Volume        | Mount Point       | Mode | Purpose                                            |
| ------------- | ----------------- | ---- | -------------------------------------------------- |
| `main`        | `/root/.peerswap` | rw   | peerswapd db, `peerswap.conf`, `pswebconfig.json`, `policy.conf` |
| `lnd` (dep)   | `/mnt/lnd`        | ro   | LND macaroon + `tls.cert`                           |
| `elements` (dep, optional) | `/mnt/elements` | ro | Elements RPC cookie/credentials (Liquid)  |

---

## Configuration Management

`peerswap.conf` and `pswebconfig.json` are generated on every start by the `reconcile-config` oneshot from StartOS-managed settings (`startos-settings.json` on the `main` volume). This neutralizes psweb's `SavePS()` clobber without a supervisord/wrapper script: peerswapd starts against a config StartOS fully owns; psweb starts afterward and only drives the already-running daemon.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose            |
| --------- | ---- | -------- | ------------------ |
| Web UI    | 1984 | HTTP     | PeerSwap Web UI    |

Exposed automatically over LAN-HTTPS and Tor.

---

## Actions (StartOS UI)

- **Select Lightning Backend** — LND (CLN planned).
- **Enable Liquid Swaps** — gates the optional `elements` dependency.
- **Allow Incoming Swap Requests** — default **off** (beta safety).
- **Set Local Mempool URL** — optional explorer override.
- **Show Node Info** — peers and Liquid address.

---

## Backups and Restore

`main` volume only. LND funds and Liquid wallet state live in their own packages.

---

## Health Checks

| Check          | Method                 |
| -------------- | ---------------------- |
| PeerSwap Daemon | Port listening (42069) |
| Web Interface  | Port listening (1984)  |

---

## Dependencies

- **lnd** `>=0.20.1-beta`, running, health check `lnd` (required once a backend is configured).
- **elements** (optional) — running dependency only when Liquid swaps are enabled.

---

## Limitations and Differences

1. **LND backend only.** CLN is a `lightningd` plugin and requires a change to `cln-startos`; deferred.
2. **Liquid requires the separate `elements` package.** Bitcoin-only otherwise.
3. The internal LND gRPC + real `tls.cert` should remove the legacy ALPN/cert-extraction hacks — **verify on-node**.

---

## Quick Reference for AI Consumers

```yaml
package_id: peerswap
binaries: [peerswapd, pscli, psweb]
architectures: [x86_64, aarch64]
volumes:
  main: /root/.peerswap
mounts:
  lnd: /mnt/lnd (ro)
  elements: /mnt/elements (ro, when Liquid enabled)
ports:
  ui: 1984
  peerswapd_rpc: 42069
dependencies:
  lnd: ">=0.20.1-beta" (running)
  elements: optional (running when Liquid enabled)
actions:
  - select-lightning-backend
  - enable-liquid-swaps
  - allow-swap-requests
  - set-mempool-url
  - show-node-info
safety_defaults:
  allow_swap_requests: false
  liquid_enabled: false
```

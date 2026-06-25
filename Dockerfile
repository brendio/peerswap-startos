# syntax=docker/dockerfile:1
#
# Multi-stage, multi-arch build for the PeerSwap StartOS package.
#
#   Stage 1: build peerswapd + pscli from ElementsProject/peerswap (make lnd-release)
#   Stage 2: build psweb from Impa10r/peerswap-web (peerswap-web v5.0.4)
#   Stage 3: slim runtime with tini + the three binaries
#
# StartOS builds this once per target arch (aarch64, x86_64) and passes the
# Docker build platform, so no manual cross-compilation flags are needed.

ARG PEERSWAP_VERSION=master
ARG PSWEB_VERSION=v5.0.4
ARG GO_VERSION=1.23

# ---------------------------------------------------------------------------
# Stage 1 — build psweb + peerswapd + pscli (all via `go install` -> /go/bin)
#
# This mirrors the upstream Impa10r/peerswap-web Dockerfile exactly:
#   - peerswap-web `make install-lnd`  -> `go install ./cmd/psweb`      (LND is
#     the DEFAULT build; `-tags cln` is the CLN variant — so no tags here).
#   - ElementsProject/peerswap `make lnd-release` -> `go install` peerswapd+pscli.
# Both `go install` to GOPATH/bin (=/go/bin in the golang image), NOT ./out.
# StartOS builds this once per target arch under buildx, so native compilation
# for the target platform happens without explicit cross flags.
# ---------------------------------------------------------------------------
FROM golang:${GO_VERSION}-bookworm AS builder
ARG PEERSWAP_VERSION
ARG PSWEB_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends git make ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# psweb (peerswap-web) — LND flavor (default)
WORKDIR /src/peerswap-web
RUN git clone --depth 1 --branch ${PSWEB_VERSION} \
  https://github.com/Impa10r/peerswap-web.git . \
  && make install-lnd

# peerswapd + pscli (standalone LND daemon)
WORKDIR /src/peerswap
RUN git clone --depth 1 --branch ${PEERSWAP_VERSION} \
  https://github.com/ElementsProject/peerswap.git . \
  && make lnd-release

# ---------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS final

RUN apt-get update && apt-get install -y --no-install-recommends \
  tini \
  ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# go install drops psweb, peerswapd and pscli into /go/bin
COPY --from=builder /go/bin/peerswapd /usr/local/bin/peerswapd
COPY --from=builder /go/bin/pscli /usr/local/bin/pscli
COPY --from=builder /go/bin/psweb /usr/local/bin/psweb

# StartOS runs daemons as root by default; peerswap/psweb default their data dir
# to /root/.peerswap, which is the `main` volume mountpoint (see utils.ts).
WORKDIR /root

ENTRYPOINT ["/usr/bin/tini", "-g", "--"]

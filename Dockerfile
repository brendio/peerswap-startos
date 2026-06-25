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
# Stage 1 — peerswapd + pscli
# ---------------------------------------------------------------------------
FROM golang:${GO_VERSION}-bookworm AS peerswapd-builder
ARG PEERSWAP_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends git make ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone --depth 1 --branch ${PEERSWAP_VERSION} \
  https://github.com/ElementsProject/peerswap.git .
# `make lnd-release` produces the standalone peerswapd + pscli (LND backend).
RUN make lnd-release \
  && install -Dm755 ./out/peerswapd /out/peerswapd \
  && install -Dm755 ./out/pscli /out/pscli

# ---------------------------------------------------------------------------
# Stage 2 — psweb (peerswap-web)
# ---------------------------------------------------------------------------
FROM golang:${GO_VERSION}-bookworm AS psweb-builder
ARG PSWEB_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone --depth 1 --branch ${PSWEB_VERSION} \
  https://github.com/Impa10r/peerswap-web.git .
# psweb's main package lives in cmd/psweb; build the LND-flavored binary.
RUN cd cmd/psweb \
  && CGO_ENABLED=0 go build -tags lnd -o /out/psweb . \
  && test -x /out/psweb

# ---------------------------------------------------------------------------
# Stage 3 — runtime
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS final

RUN apt-get update && apt-get install -y --no-install-recommends \
  tini \
  ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=peerswapd-builder /out/peerswapd /usr/local/bin/peerswapd
COPY --from=peerswapd-builder /out/pscli /usr/local/bin/pscli
COPY --from=psweb-builder /out/psweb /usr/local/bin/psweb

# StartOS runs daemons as root by default; peerswap/psweb default their data dir
# to /root/.peerswap, which is the `main` volume mountpoint (see utils.ts).
WORKDIR /root

ENTRYPOINT ["/usr/bin/tini", "-g", "--"]

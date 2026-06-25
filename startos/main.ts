import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { elementsManifest } from './elementsManifest'
import { settingsFile } from './fileModels/settings'
import { i18n } from './i18n'
import { reconcileConfig } from './reconcileConfig'
import { sdk } from './sdk'
import {
  dataDirMountpoint,
  elementsMountpoint,
  lndMountpoint,
  mainMounts,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting PeerSwap!'))

  const settings =
    (await settingsFile.read().const(effects)) ?? settingsFile.validate({})

  // Always mount the `main` volume (rw) for peerswapd/psweb data, plus the LND
  // dependency volume (ro) for the macaroon + tls.cert.
  let mounts = mainMounts.mountDependency<typeof lndManifest>({
    dependencyId: 'lnd',
    mountpoint: lndMountpoint,
    readonly: true,
    subpath: null,
    volumeId: 'main',
  })

  // Mount the elements (Liquid) volume read-only only when the user enabled
  // Liquid swaps. Using a string-literal manifest shape here because the sibling
  // `elements` package isn't published as an npm dep yet (see ABOUT.md); when it
  // is, replace this with `mountDependency<typeof elementsManifest>`.
  if (settings.liquidEnabled) {
    mounts = mounts.mountDependency<typeof elementsManifest>({
      dependencyId: 'elements',
      mountpoint: elementsMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    })
  }

  const peerswapSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'peerswap' },
    mounts,
    'peerswap-sub',
  )

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects)
    .addOneshot('reconcile-config', {
      subcontainer: peerswapSub,
      // Rewrite peerswap.conf + pswebconfig.json from StartOS-managed settings
      // BEFORE peerswapd starts. This is the supervisord-free replacement for
      // the old fix-peerswap.sh wrapper: peerswapd reads a config we fully own,
      // and although psweb's SavePS() may later rewrite peerswap.conf, peerswapd
      // has already started against the correct file by then.
      exec: {
        fn: async () => {
          await reconcileConfig(effects, settings)
          return null
        },
      },
      requires: [],
    })
    .addDaemon('peerswapd', {
      subcontainer: peerswapSub,
      // peerswapd reads its config from the data dir (peerswap.conf). It is the
      // primary daemon; psweb drives it over gRPC.
      exec: {
        command: ['peerswapd', `--configfile=${dataDirMountpoint}/peerswap.conf`],
      },
      ready: {
        display: i18n('PeerSwap Daemon'),
        // peerswapd is healthy once its gRPC/REST port is listening. pscli/psweb
        // connect to this same port.
        gracePeriod: 60_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 42069, {
            successMessage: i18n('The PeerSwap daemon is ready'),
            errorMessage: i18n('The PeerSwap daemon is not ready'),
          }),
      },
      requires: ['reconcile-config'],
    })
    .addDaemon('psweb', {
      subcontainer: peerswapSub,
      // psweb serves the web UI on :1984 and talks to the already-running
      // peerswapd. -datadir points it at the StartOS-managed config dir.
      exec: {
        command: ['psweb', `-datadir=${dataDirMountpoint}`],
      },
      ready: {
        display: i18n('Web Interface'),
        gracePeriod: 30_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['peerswapd'],
    })
})

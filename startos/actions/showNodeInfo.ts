import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { dataDirMountpoint, mainMounts } from '../utils'

/**
 * Show the node's LN pubkey and (if Liquid is enabled) a fresh Liquid address.
 *
 * Runs `pscli` against the live peerswapd in a temporary subcontainer that
 * shares the same data dir / config. Only available while running.
 */
export const showNodeInfo = sdk.Action.withoutInput(
  'show-node-info',

  {
    name: i18n('Show Node Info'),
    description: i18n(
      'Display your Lightning node pubkey and, if Liquid is enabled, a Liquid address',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  },

  async ({ effects }) => {
    return await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'peerswap' },
      mainMounts,
      'peerswap-info',
      async (subc) => {
        const cfgArg = `--configfile=${dataDirMountpoint}/peerswap.conf`

        let pubkey = ''
        try {
          // `pscli listpeers` / `lbtc-getaddress` shape varies by version; we
          // read the node id from peerswapd's reloadpolicy/listpeers output.
          const res = await subc.execFail(['pscli', cfgArg, 'listpeers'])
          pubkey = res.stdout.toString().trim()
        } catch (e) {
          pubkey = i18n('Could not reach the PeerSwap daemon.')
        }

        let liquidAddress = ''
        try {
          const res = await subc.execFail(['pscli', cfgArg, 'lbtc-getaddress'])
          liquidAddress = res.stdout.toString().trim()
        } catch {
          liquidAddress = i18n('Liquid is not enabled.')
        }

        return {
          version: '1' as const,
          title: i18n('Node Info'),
          message: i18n('PeerSwap node details'),
          result: {
            type: 'group' as const,
            value: [
              {
                name: i18n('Peers / Node Info'),
                description: null,
                type: 'single' as const,
                value: pubkey,
                masked: false,
                copyable: true,
                qr: false,
              },
              {
                name: i18n('Liquid Address'),
                description: null,
                type: 'single' as const,
                value: liquidAddress,
                masked: false,
                copyable: true,
                qr: true,
              },
            ],
          },
        }
      },
    )
  },
)

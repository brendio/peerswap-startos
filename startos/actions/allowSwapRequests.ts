import { settingsFile } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  allow: Value.toggle({
    name: i18n('Allow Incoming Swap Requests'),
    description: i18n(
      'Allow your channel peers to initiate swaps with your node. When off, you can still initiate swaps yourself.',
    ),
    warning: i18n(
      'PeerSwap is BETA software that moves real funds. Only allow incoming swap requests from peers you trust. Off by default for safety.',
    ),
    default: false,
  }),
})

export const allowSwapRequests = sdk.Action.withInput(
  'allow-swap-requests',

  {
    name: i18n('Allow Incoming Swap Requests'),
    description: i18n(
      'Control whether peers may initiate swaps with your node (default off)',
    ),
    warning: i18n(
      'PeerSwap is BETA software that moves real funds. Enabling this lets peers initiate swaps against your node.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const settings = await settingsFile.read().const(effects)
    return { allow: settings?.allowSwapRequests ?? false }
  },

  async ({ effects, input }) => {
    await settingsFile.merge(effects, { allowSwapRequests: input.allow })
  },
)

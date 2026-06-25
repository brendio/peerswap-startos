import { settingsFile } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Liquid Swaps'),
    description: i18n(
      'Enable L-BTC (Liquid) swaps. This requires the Elements (Liquid) service to be installed and running. When disabled, PeerSwap performs Bitcoin-only swaps.',
    ),
    warning: i18n(
      'Enabling Liquid adds a running dependency on the Elements (Liquid) service. Make sure it is installed first.',
    ),
    default: false,
  }),
})

export const enableLiquidSwaps = sdk.Action.withInput(
  'enable-liquid-swaps',

  {
    name: i18n('Enable Liquid Swaps'),
    description: i18n(
      'Toggle Liquid (L-BTC) swap support, gating the Elements dependency',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const settings = await settingsFile.read().const(effects)
    return { enabled: settings?.liquidEnabled ?? false }
  },

  async ({ effects, input }) => {
    await settingsFile.merge(effects, { liquidEnabled: input.enabled })
  },
)

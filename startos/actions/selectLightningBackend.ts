import { settingsFile } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  backend: Value.select({
    name: i18n('Lightning Backend'),
    description: i18n(
      'The Lightning node PeerSwap connects to. Only LND is supported today; Core Lightning is planned.',
    ),
    values: {
      lnd: i18n('LND'),
    },
    default: 'lnd',
  }),
})

export const selectLightningBackend = sdk.Action.withInput(
  'select-lightning-backend',

  {
    name: i18n('Select Lightning Backend'),
    description: i18n('Choose which Lightning implementation PeerSwap uses'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const settings = await settingsFile.read().const(effects)
    return { backend: settings?.lightningBackend ?? 'lnd' }
  },

  async ({ effects, input }) => {
    await settingsFile.merge(effects, { lightningBackend: input.backend })
  },
)

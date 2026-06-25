import { settingsFile } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.text({
    name: i18n('Local Mempool URL'),
    description: i18n(
      'Optional base URL of a local mempool/block explorer (e.g. a self-hosted mempool). Leave blank to use the public default.',
    ),
    warning: null,
    default: null,
    required: false,
    placeholder: 'http://mempool.embassy:3006',
    inputmode: 'url',
    patterns: [],
  }),
})

export const setMempoolUrl = sdk.Action.withInput(
  'set-mempool-url',

  {
    name: i18n('Set Local Mempool URL'),
    description: i18n(
      'Point PeerSwap Web at a local mempool/explorer for transaction links',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const settings = await settingsFile.read().const(effects)
    return { url: settings?.localMempoolUrl || null }
  },

  async ({ effects, input }) => {
    await settingsFile.merge(effects, { localMempoolUrl: input.url ?? '' })
  },
)

import { sdk } from '../sdk'
import { allowSwapRequests } from './allowSwapRequests'
import { enableLiquidSwaps } from './enableLiquidSwaps'
import { selectLightningBackend } from './selectLightningBackend'
import { setMempoolUrl } from './setMempoolUrl'
import { showNodeInfo } from './showNodeInfo'

export const actions = sdk.Actions.of()
  .addAction(selectLightningBackend)
  .addAction(enableLiquidSwaps)
  .addAction(allowSwapRequests)
  .addAction(setMempoolUrl)
  .addAction(showNodeInfo)

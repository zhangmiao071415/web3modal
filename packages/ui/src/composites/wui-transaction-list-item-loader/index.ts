import { html, LitElement } from 'lit'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item-loader')
export class WuiTransactionListItemLoader extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-shimmer width="40px" height="40px"></wui-shimmer>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-shimmer width="72px" height="16px" borderRadius="3xs"></wui-shimmer>
          <wui-shimmer width="148px" height="14px" borderRadius="3xs"></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" borderRadius="3xs"></wui-shimmer>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item-loader': WuiTransactionListItemLoader
  }
}
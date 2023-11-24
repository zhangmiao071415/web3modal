import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-token-list-item')
export class WuiTokenListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public name?: string = undefined

  @property() public symbol?: string = undefined

  @property() public price?: string = undefined

  @property() public amount?: string = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center">
        ${this.visualTemplate()}
        <wui-flex flexDirection="column" gap="3xs">
          <wui-flex justifyContent="space-between">
            <wui-text variant="paragraph-500" color="fg-100">${this.name}</wui-text>
            ${this.price &&
            this.amount &&
            html`<wui-text variant="paragraph-500" color="fg-100"
              >$${(parseFloat(this.price) * parseFloat(this.amount)).toFixed(2)}</wui-text
            >`}
          </wui-flex>
          <wui-flex justifyContent="space-between">
            <wui-text variant="small-400" color="fg-200">${this.symbol}</wui-text>
            ${this.amount &&
            html`<wui-text variant="small-400" color="fg-200">${this.amount}</wui-text>`}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.imageSrc) {
      return html`<wui-image width="40" height="40" src=${this.imageSrc}></wui-image>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-list-item': WuiTokenListItem
  }
}
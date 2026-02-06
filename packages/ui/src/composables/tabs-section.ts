import { html, LitElement } from 'lit';
import {customElement} from 'lit/decorators.js'

@customElement("tabs-section")
export class TabElement extends LitElement {
    protected render() {
        return html`
        <a-head>Tabs section</a-head>
        <a-tabs value="profile">
        <a-tab value="profile">Profile</a-tab>
        <a-tab value="account">Account</a-tab>
        <a-tab value="advanced">Advanced</a-tab>

        <a-tab-panel slot="panel" value="profile">
        Profile content here...
            </a-tab-panel>
        <a-tab-panel slot="panel" value="account">
        Account settings...
            </a-tab-panel>
        <a-tab-panel slot="panel" value="advanced">
        Advanced options...
            </a-tab-panel>
        </a-tabs>
        `
    }
}

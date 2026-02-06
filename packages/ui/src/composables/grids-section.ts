import {html, LitElement} from "lit"
import {customElement} from "lit/decorators.js"
import "../components/grid"
import "../components/head"


@customElement("grids-section")
export class GridsSection extends LitElement {
    protected render() {
        return html`
        <a-head>Sample Grids</a-head>
        <a-grid gap="1.5rem" cols-lg="5" cols-md="4" cols-sm="3">
            <div class="card">Card 1 content...</div>
            <div class="card">Card 2 content...</div>
        </a-grid>
        `
    }
}



declare global {
    interface HTMLElementTagNameMap {
        'grids-section': GridsSection
    }
}

class CNCCard extends HTMLElement {
  connectedCallback() {
    this.classList.add('card');
  }
}

customElements.define('cnc-card', CNCCard);

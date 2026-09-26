class CNCBody extends HTMLElement {
  connectedCallback() {
    this.classList.add('body');
  }
}

customElements.define('cnc-body', CNCBody);

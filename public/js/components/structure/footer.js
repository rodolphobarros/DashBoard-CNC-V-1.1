class CNCFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="dashboard-footer">
        <div class="footer-brand">
          <span class="footer-subtitle">
            @Direitos Reservados: Rodolpho Barros Tomaz do Nascimento
          </span>
        </div>
      </footer>
    `;
  }
}

customElements.define('cnc-footer', CNCFooter);

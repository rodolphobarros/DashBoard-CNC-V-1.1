class CNCThermalMonitor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="section-header">
                <h2>Monitorização Térmica</h2>
            </div>

            <div class="thermal-monitor-content">
                <div class="temperature-card">
                    <span class="temperature-label">
                        Temperatura do driver
                    </span>

                    <div class="temperature-value">
                        <span id="driverTemperature">---</span>
                        <span class="temperature-unit">°C</span>
                    </div>
                </div>

                <div class="temperature-card">
                    <span class="temperature-label">
                        Temperatura do spindle
                    </span>

                    <div class="temperature-value">
                        <span id="spindleTemperature">---</span>
                        <span class="temperature-unit">°C</span>
                    </div>
                </div>
            </div>
        `;

    this.driverTemperature = this.querySelector('#driverTemperature');
    this.spindleTemperature = this.querySelector('#spindleTemperature');

    this.handleState = (event) => this.updateTemperatures(event.detail);
    window.addEventListener('cnc:state', this.handleState);
  }

  disconnectedCallback() {
    window.removeEventListener('cnc:state', this.handleState);
  }

  updateTemperatures(state) {
    const isConnected = state?.connection === 'CONNECTED';

    const hasValidTemperatures =
      Number.isFinite(state?.driverTemp) && Number.isFinite(state?.spindleTemp);

    if (!isConnected || !hasValidTemperatures) {
      this.driverTemperature.textContent = '---';
      this.spindleTemperature.textContent = '---';
      return;
    }

    this.driverTemperature.textContent = state.driverTemp.toFixed(1);
    this.spindleTemperature.textContent = state.spindleTemp.toFixed(1);
  }
}

customElements.define('cnc-thermal-monitor', CNCThermalMonitor);

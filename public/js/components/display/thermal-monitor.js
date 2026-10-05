class CNCThermalMonitor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="section-header">
                <h2>Monitorização Térmica</h2>
            </div>

            <div class="thermal-monitor-content">
                <div class="temperature-card">
                    <span class="temperature-label">
                        Temperatura dos drivers
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

                <div class="temperature-card">
                    <span class="temperature-label">
                        Humidade
                    </span>

                    <div class="temperature-value">
                        <span id="humidity">---</span>
                        <span class="temperature-unit">%</span>
                    </div>
                </div>
            </div>
        `;

    this.driverTemperature = this.querySelector('#driverTemperature');
    this.spindleTemperature = this.querySelector('#spindleTemperature');
    this.humidity = this.querySelector('#humidity');

    this.handleState = (event) => this.updateTemperatures(event.detail);
    window.addEventListener('cnc:state', this.handleState);
  }

  disconnectedCallback() {
    window.removeEventListener('cnc:state', this.handleState);
  }

  updateTemperatures(state) {
    const isConnected = state?.connection === 'CONNECTED';

    if (!isConnected) {
      this.driverTemperature.textContent = '---';
      this.spindleTemperature.textContent = '---';
      this.humidity.textContent = '---';
      return;
    }

    this.driverTemperature.textContent = Number.isFinite(state?.driverTemp)
      ? state.driverTemp.toFixed(1)
      : '---';

    this.spindleTemperature.textContent = Number.isFinite(state?.spindleTemp)
      ? state.spindleTemp.toFixed(1)
      : '---';

    this.humidity.textContent = Number.isFinite(state?.humidity)
      ? state.humidity.toFixed(1)
      : '---';
  }
}

customElements.define('cnc-thermal-monitor', CNCThermalMonitor);

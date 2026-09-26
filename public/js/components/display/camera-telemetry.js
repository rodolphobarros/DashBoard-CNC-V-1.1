class CNCCameraTelemetry extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="camera-telemetry">
        <div class="section-header camera-telemetry-header">
          <div class="camera-telemetry-tabs">
            <ui-button
              class="tab-button"
              data-tab="camera"
              variant="primary"
              size="sm"
            >
              Câmera
            </ui-button>

            <ui-button
              class="tab-button"
              data-tab="telemetry"
              variant="secondary"
              size="sm"
            >
              Telemetria
            </ui-button>
          </div>
        </div>

        <div class="camera-telemetry-panels">
          <div class="tab-panel active" data-panel="camera">
            <div class="camera-content">
              <div class="camera-view">
                <img
                  id="cameraStream"
                  class="camera-stream"
                  alt="Transmissão ao vivo da câmera CNC"
                />
              </div>

              <div class="camera-info">
                <div class="camera-status">
                  <span class="parameter-label">Estado</span>
                  <span id="cameraStatus" class="parameter-value">
                    A ligar...
                  </span>
                </div>

                <div class="camera-name">
                  <span class="parameter-label">Câmera</span>
                  <span id="cameraName" class="parameter-value">
                    CNC-01
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="tab-panel" data-panel="telemetry">
            <div class="telemetry-content">
              <div class="telemetry-header">
                <span>Registo de eventos</span>
              </div>

              <div class="telemetry-log">
                <ul id="logBox">
                  <li>À espera de dados...</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.tabButtonElements = this.querySelectorAll('.tab-button');
    this.tabPanelElements = this.querySelectorAll('.tab-panel');
    this.cameraStreamElement = this.querySelector('#cameraStream');
    this.cameraStatusElement = this.querySelector('#cameraStatus');

    this.cameraStreamElement.addEventListener('load', () => {
      this.cameraStatusElement.textContent = 'Ligada';
    });

    this.cameraStreamElement.addEventListener('error', () => {
      this.cameraStatusElement.textContent = 'Indisponível';
    });

    this.querySelector('.camera-telemetry-tabs').addEventListener(
      'click',
      (event) => {
        const tabButton = event.target.closest('.tab-button');

        if (!tabButton) {
          return;
        }

        this.setActiveTab(tabButton.dataset.tab);
      }
    );

    void this.loadCameraStream();
  }

  async loadCameraStream() {
    try {
      const response = await fetch('/api/config', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Configuration unavailable: HTTP ${response.status}`);
      }

      const configuration = await response.json();

      const fallbackStreamUrl =
        `${window.location.protocol}//` +
        `${window.location.hostname}:8080/stream`;

      this.cameraStreamElement.src =
        configuration.cameraStreamUrl || fallbackStreamUrl;
    } catch (error) {
      console.error('[Camera] Failed to load configuration:', error);

      this.cameraStatusElement.textContent = 'Indisponível';
    }
  }

  setActiveTab(tabName) {
    this.tabButtonElements.forEach((tabButton) => {
      const isActive = tabButton.dataset.tab === tabName;

      tabButton.setAttribute('variant', isActive ? 'primary' : 'secondary');
    });

    this.tabPanelElements.forEach((tabPanel) => {
      tabPanel.classList.toggle('active', tabPanel.dataset.panel === tabName);
    });
  }
}

customElements.define('camera-telemetry', CNCCameraTelemetry);

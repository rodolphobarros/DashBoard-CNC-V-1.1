import { emergencyStop, resetEmergency } from '../../socket/socketClient.js';

class CNCEmergency extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="section-header">
        <h2>Parada de Emergência</h2>
      </div>

      <div class="emergency-content">
        <div class="emergency-summary">
          <div class="emergency-info">
            <span class="parameter-label">Estado atual</span>
            <span id="emergencyStatus" class="parameter-value">
              Desconectado
            </span>
          </div>

          <div class="emergency-info">
            <span class="parameter-label">Última parada</span>
            <span id="lastEmergency" class="parameter-value">---</span>
          </div>

          <div class="emergency-info">
            <span class="parameter-label">Total de paradas</span>
            <span id="emergencyCount" class="parameter-value">0</span>
          </div>
        </div>

        <button class="emergency-button" type="button" disabled>
          Parada de Emergência
        </button>

        <p class="emergency-warning">
          Utilize este comando somente em uma situação de emergência.
        </p>
      </div>
    `;

    this.isEmergencyActive = false;

    this.emergencyButtonElement = this.querySelector('.emergency-button');
    this.emergencyStatusElement = this.querySelector('#emergencyStatus');
    this.lastEmergencyElement = this.querySelector('#lastEmergency');
    this.emergencyCountElement = this.querySelector('#emergencyCount');

    this.handleState = (event) => {
      this.updateEmergencyState(event.detail);
    };

    window.addEventListener('cnc:state', this.handleState);

    this.emergencyButtonElement.addEventListener('click', () => {
      if (this.emergencyButtonElement.disabled) {
        return;
      }

      if (this.isEmergencyActive) {
        console.log('[Emergency] Emergency reset requested');
        resetEmergency();
      } else {
        console.log('[Emergency] Emergency stop requested');
        emergencyStop();
      }
    });
  }

  disconnectedCallback() {
    window.removeEventListener('cnc:state', this.handleState);
  }

  updateEmergencyState(state) {
    const emergencyCount = Number.isInteger(state?.emergencyCount)
      ? state.emergencyCount
      : 0;

    this.emergencyCountElement.textContent = String(emergencyCount);

    if (state?.lastEmergencyAt) {
      const lastEmergencyDate = new Date(state.lastEmergencyAt);

      this.lastEmergencyElement.textContent = Number.isNaN(
        lastEmergencyDate.getTime()
      )
        ? '---'
        : lastEmergencyDate.toLocaleString('pt-PT');
    } else {
      this.lastEmergencyElement.textContent = '---';
    }

    const isConnected = state?.connection === 'CONNECTED';
    const isEmergencySupported = state?.capabilities?.emergency === true;

    if (!isConnected || !isEmergencySupported) {
      this.isEmergencyActive = false;
      this.emergencyButtonElement.disabled = true;
      this.emergencyButtonElement.textContent = 'Parada de Emergência';
      this.emergencyButtonElement.classList.remove('is-active');

      this.emergencyStatusElement.textContent = isConnected
        ? 'Indisponível'
        : 'Desconectado';

      return;
    }

    const isEmergencyActive = state?.emergency === true;

    this.isEmergencyActive = isEmergencyActive;
    this.emergencyButtonElement.disabled = false;

    this.emergencyButtonElement.classList.toggle(
      'is-active',
      isEmergencyActive
    );

    this.emergencyButtonElement.textContent = isEmergencyActive
      ? 'Repor Emergência'
      : 'Parada de Emergência';

    this.emergencyStatusElement.textContent = isEmergencyActive
      ? 'Emergência'
      : 'Normal';
  }
}

customElements.define('cnc-emergency', CNCEmergency);

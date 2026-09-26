import { jog } from '../../socket/socketClient.js';

class CNCAxisPosition extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="section-header">
        <h2>Posição dos Eixos</h2>
      </div>

      <div class="jog-step-selector">
        <label for="jogStep">Selecione o Passo</label>

        <select id="jogStep">
          <option value="0.1">0.1 mm</option>
          <option value="1" selected>1 mm</option>
          <option value="10">10 mm</option>
        </select>
      </div>

      <div class="axis-position-layout">
        <div class="jog-panel">
          <div class="jog-pad">
            <button
              class="jog-button jog-pos-x"
              type="button"
              data-axis="x"
              data-direction="1"
            >
              +X
            </button>

            <button
              class="jog-button jog-neg-y"
              type="button"
              data-axis="y"
              data-direction="-1"
            >
              −Y
            </button>

            <button
              class="jog-button jog-pos-y"
              type="button"
              data-axis="y"
              data-direction="1"
            >
              +Y
            </button>

            <button
              class="jog-button jog-neg-x"
              type="button"
              data-axis="x"
              data-direction="-1"
            >
              −X
            </button>

            <button
              class="jog-button jog-pos-z"
              type="button"
              data-axis="z"
              data-direction="1"
            >
              +Z
            </button>

            <button
              class="jog-button jog-neg-z"
              type="button"
              data-axis="z"
              data-direction="-1"
            >
              −Z
            </button>
          </div>
        </div>

        <div class="axis-position-content">
          <div class="axis-card">
            <span class="axis-label">Eixo X</span>
            <span id="posX" class="axis-value">---</span>
            <span class="axis-unit">mm</span>
          </div>

          <div class="axis-card">
            <span class="axis-label">Eixo Y</span>
            <span id="posY" class="axis-value">---</span>
            <span class="axis-unit">mm</span>
          </div>

          <div class="axis-card">
            <span class="axis-label">Eixo Z</span>
            <span id="posZ" class="axis-value">---</span>
            <span class="axis-unit">mm</span>
          </div>
        </div>
      </div>

      <cnc-emergency></cnc-emergency>
    `;

    this.stepSelector = this.querySelector('#jogStep');
    this.jogPad = this.querySelector('.jog-pad');
    this.jogButtons = [...this.querySelectorAll('.jog-button')];

    this.canJog = false;

    this.stepSelector.disabled = true;

    this.jogButtons.forEach((jogButton) => {
      jogButton.disabled = true;
    });

    this.positionX = this.querySelector('#posX');
    this.positionY = this.querySelector('#posY');
    this.positionZ = this.querySelector('#posZ');

    this.jogPad?.addEventListener('click', (event) => {
      const jogButton = event.target.closest('.jog-button');

      if (!jogButton || !this.canJog) {
        return;
      }

      const selectedAxis = jogButton.dataset.axis;
      const jogDirection = Number(jogButton.dataset.direction);
      const jogStep = Number(this.stepSelector.value);

      console.log(
        `[AxisPosition] Jog: axis=${selectedAxis} direction=${jogDirection} step=${jogStep}`
      );

      jog(selectedAxis, jogDirection, jogStep);
    });

    this.handleState = (event) => {
      this.updatePosition(event.detail);
      this.updateJogControls(event.detail);
    };

    window.addEventListener('cnc:state', this.handleState);
  }

  disconnectedCallback() {
    window.removeEventListener('cnc:state', this.handleState);
  }

  updatePosition(state) {
    const isConnected = state?.connection === 'CONNECTED';

    const hasValidPosition =
      Number.isFinite(state?.position?.x) &&
      Number.isFinite(state?.position?.y) &&
      Number.isFinite(state?.position?.z);

    if (!isConnected || !hasValidPosition) {
      this.positionX.textContent = '---';
      this.positionY.textContent = '---';
      this.positionZ.textContent = '---';

      return;
    }

    this.positionX.textContent = state.position.x.toFixed(1);
    this.positionY.textContent = state.position.y.toFixed(1);
    this.positionZ.textContent = state.position.z.toFixed(1);
  }

  updateJogControls(state) {
    const isConnected = state?.connection === 'CONNECTED';
    const isJogSupported = state?.capabilities?.jog === true;
    const isEmergencyActive = state?.emergency === true;

    const isBlockedStatus =
      state?.status === 'HOLD' || state?.status === 'ALARM';

    this.canJog =
      isConnected && isJogSupported && !isEmergencyActive && !isBlockedStatus;

    this.stepSelector.disabled = !this.canJog;

    this.jogButtons.forEach((jogButton) => {
      jogButton.disabled = !this.canJog;
    });
  }
}

customElements.define('cnc-axis-position', CNCAxisPosition);

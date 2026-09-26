import socket, {
  connectCNC,
  disconnectCNC,
} from '../../socket/socketClient.js';

class CNCHeader extends HTMLElement {
  connectedCallback() {
    const actions = this.innerHTML;

    this.innerHTML = `
      <header class="dashboard-header">
        <div class="header-brand">
          <h1>CNC Dashboard</h1>
          <span class="header-subtitle">Monitorização em tempo real</span>
        </div>

        <div class="header-actions">
          <span class="connection-status" id="connectionStatus">
            <span class="connection-status__dot"></span>
            <span class="connection-status__label">
              A ligar ao servidor...
            </span>
          </span>

          ${actions}
        </div>
      </header>

      <div class="connect-modal-backdrop" hidden>
        <div class="connect-modal">
          <h2 class="connect-modal__title">Escolher fonte de dados</h2>

          <div class="connect-modal__options">
            <ui-button
              class="connect-menu__option"
              data-source="SIMULATOR"
              variant="secondary"
              size="md"
            >
              Simulador
            </ui-button>

            <ui-button
              class="connect-menu__option"
              data-source="MACHINE"
              variant="secondary"
              size="md"
            >
              Placa Serial
            </ui-button>
          </div>
        </div>
      </div>
    `;

    this.isCNCConnected = false;
    this.isServerConnected = socket.connected;

    this.connectButton = this.querySelector('#cnc-connect-button');

    this.statusElement = this.querySelector('#connectionStatus');
    this.statusLabel = this.statusElement.querySelector(
      '.connection-status__label'
    );

    this.modalBackdrop = this.querySelector('.connect-modal-backdrop');
    this.connectModal = this.querySelector('.connect-modal');

    this.connectButton?.addEventListener('click', (event) => {
      event.stopPropagation();

      if (!this.isServerConnected) {
        return;
      }

      if (this.isCNCConnected) {
        console.log('[Header] CNC disconnect requested');

        disconnectCNC();
        return;
      }

      this.modalBackdrop.hidden = false;
    });

    this.modalBackdrop?.addEventListener('click', (event) => {
      if (event.target === this.modalBackdrop) {
        this.modalBackdrop.hidden = true;
      }
    });

    this.connectModal?.addEventListener('click', (event) => {
      const selectedOption = event.target.closest('.connect-menu__option');

      if (!selectedOption || !this.isServerConnected) {
        return;
      }

      const source = selectedOption.dataset.source;

      console.log(`[Header] CNC connection requested (source: ${source})`);

      connectCNC(source);

      this.modalBackdrop.hidden = true;
    });

    this.handleState = (event) => {
      this.updateConnectionStatus(event.detail);
    };

    this.handleServerState = (event) => {
      this.updateServerStatus(event.detail);
    };

    this.handleConnectionError = (event) => {
      this.showConnectionError(event.detail);
    };

    window.addEventListener('cnc:state', this.handleState);
    window.addEventListener('cnc:server-state', this.handleServerState);
    window.addEventListener('cnc:connect-error', this.handleConnectionError);

    this.updateServerStatus({
      connected: socket.connected,
      reason: null,
    });
  }

  disconnectedCallback() {
    window.removeEventListener('cnc:state', this.handleState);
    window.removeEventListener('cnc:server-state', this.handleServerState);
    window.removeEventListener('cnc:connect-error', this.handleConnectionError);
  }

  updateServerStatus(serverState) {
    this.isServerConnected = serverState?.connected === true;

    if (!this.isServerConnected) {
      this.isCNCConnected = false;
      this.modalBackdrop.hidden = true;

      this.statusElement.classList.remove('is-connected', 'is-connecting');
      this.statusLabel.textContent = 'Servidor indisponível';

      this.setButtonMode(false, false);

      return;
    }

    this.statusLabel.textContent = 'Desconectado';

    this.setButtonMode(false, false);
  }

  updateConnectionStatus(state) {
    if (!state || !this.isServerConnected) {
      return;
    }

    const isConnected = state.connection === 'CONNECTED';
    const isConnecting = state.connection === 'CONNECTING';

    this.statusElement.classList.toggle('is-connected', isConnected);
    this.statusElement.classList.toggle('is-connecting', isConnecting);

    this.statusLabel.textContent = isConnected
      ? 'Conectado'
      : isConnecting
        ? 'A conectar...'
        : 'Desconectado';

    this.setButtonMode(isConnected, isConnecting);
  }

  showConnectionError(error) {
    if (!this.isServerConnected) {
      this.statusLabel.textContent = 'Servidor indisponível';
      return;
    }

    console.error('[Header] Connection error:', error?.message);

    this.statusLabel.textContent = 'Erro de conexão';

    this.setButtonMode(false, false);
  }

  setButtonMode(isConnected, isConnecting) {
    this.isCNCConnected = isConnected;

    const buttonElement = this.connectButton?.querySelector(':scope > button');

    if (!buttonElement) {
      return;
    }

    buttonElement.textContent = isConnected
      ? 'DESCONECTAR'
      : isConnecting
        ? 'A CONECTAR...'
        : 'CONECTAR';

    this.connectButton.setAttribute(
      'variant',
      isConnected ? 'danger' : 'primary'
    );

    if (!this.isServerConnected || isConnecting) {
      this.connectButton.setAttribute('disabled', '');
    } else {
      this.connectButton.removeAttribute('disabled');
    }
  }
}

customElements.define('cnc-header', CNCHeader);

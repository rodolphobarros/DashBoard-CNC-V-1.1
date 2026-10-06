import { holdCNC, resumeCNC, startGcode } from '../../socket/socketClient.js';
import { logError } from '../../core/util.js';

class CNCGcodePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="gcode-panel__content">
        <div class="section-header">
          <h2>Programa G-code</h2>
        </div>

        <label for="gcodeFile">Selecionar programa</label>
        <input id="gcodeFile" type="file" />

        <p class="gcode-panel__status" role="status">
          Verificando programa carregado...
        </p>

        <pre
          class="gcode-panel__preview"
          aria-label="Pré-visualização do G-code"
        ></pre>

        <button class="gcode-panel__upload" type="button" disabled>
          Enviar programa
        </button>

        <button class="gcode-panel__start" type="button" disabled>
          Iniciar programa — indisponível
        </button>
      </section>
    `;

    this.fileInputElement = this.querySelector('#gcodeFile');
    this.statusElement = this.querySelector('.gcode-panel__status');
    this.previewElement = this.querySelector('.gcode-panel__preview');
    this.uploadButtonElement = this.querySelector('.gcode-panel__upload');
    this.startButtonElement = this.querySelector('.gcode-panel__start');

    this.gcodeState = {
      loaded: false,
      fileName: null,
      executionState: 'NO_FILE',
    };

    this.cncState = {
      connection: 'DISCONNECTED',
      status: null,
    };

    this.fileInputElement.addEventListener('change', () => {
      void this.showSelectedFile();
    });

    this.uploadButtonElement.addEventListener('click', () => {
      void this.uploadSelectedFile();
    });

    this.startButtonElement.addEventListener('click', () => {
      this.handleProgramControl();
    });

    this.handleGcodeState = (event) => {
      this.updateGcodeState(event.detail);
    };

    this.handleCncState = (event) => {
      this.updateCncState(event.detail);
    };

    this.handleCommandResult = (event) => {
      this.handleProgramControlResult(event.detail);
    };

    window.addEventListener('gcode:state', this.handleGcodeState);
    window.addEventListener('cnc:state', this.handleCncState);
    window.addEventListener('cnc:command-result', this.handleCommandResult);

    this.setProgramState();

    void this.loadGcodeState();
  }

  disconnectedCallback() {
    window.removeEventListener('gcode:state', this.handleGcodeState);
    window.removeEventListener('cnc:state', this.handleCncState);
    window.removeEventListener('cnc:command-result', this.handleCommandResult);
  }

  async loadGcodeState() {
    try {
      const response = await fetch('/api/gcode/status');

      if (!response.ok) {
        throw new Error('Failed to load G-code state');
      }

      const state = await response.json();

      this.updateGcodeState(state);
    } catch (error) {
      logError(`[GcodePanel] Failed to load G-code state: ${error.message}`);

      this.statusElement.textContent =
        'Não foi possível verificar o programa carregado.';

      this.setProgramState();
    }
  }

  updateGcodeState(state) {
    this.gcodeState = state;

    this.updateProgramDisplay();
  }

  updateCncState(state) {
    this.cncState = state;

    this.updateProgramDisplay();
  }

  updateProgramDisplay() {
    this.setProgramState();

    if (this.gcodeState.executionState === 'NO_FILE') {
      this.statusElement.textContent = 'Nenhum programa carregado.';
      return;
    }

    if (this.gcodeState.executionState === 'READY') {
      this.statusElement.textContent =
        'Programa carregado e pronto para execução.';
      return;
    }

    if (this.gcodeState.executionState === 'RUNNING') {
      if (this.cncState.status === 'HOLD') {
        this.statusElement.textContent = 'Programa pausado.';
        return;
      }

      this.statusElement.textContent = 'Programa em execução.';
      return;
    }

    if (this.gcodeState.executionState === 'COMPLETED') {
      this.statusElement.textContent =
        'Programa concluído. Programa permanece carregado.';
    }
  }

  setProgramState() {
    const programState = this.gcodeState.executionState;
    const machineStatus = this.cncState.status;

    this.startButtonElement.classList.remove('gcode-panel__start--running');

    if (programState === 'READY' || programState === 'COMPLETED') {
      this.startButtonElement.disabled = false;
      this.startButtonElement.textContent = 'Iniciar programa';
      return;
    }

    if (programState === 'RUNNING' && machineStatus === 'RUN') {
      this.startButtonElement.disabled = false;
      this.startButtonElement.textContent = 'Pausar programa';
      this.startButtonElement.classList.add('gcode-panel__start--running');
      return;
    }

    if (programState === 'RUNNING' && machineStatus === 'HOLD') {
      this.startButtonElement.disabled = false;
      this.startButtonElement.textContent = 'Retomar programa';
      this.startButtonElement.classList.add('gcode-panel__start--running');
      return;
    }

    if (programState === 'RUNNING') {
      this.startButtonElement.disabled = true;
      this.startButtonElement.textContent = 'Programa em execução';
      this.startButtonElement.classList.add('gcode-panel__start--running');
      return;
    }

    this.startButtonElement.disabled = true;
    this.startButtonElement.textContent = 'Iniciar programa — indisponível';
  }

  handleProgramControl() {
    const programState = this.gcodeState.executionState;
    const machineStatus = this.cncState.status;

    if (programState === 'READY' || programState === 'COMPLETED') {
      this.startProgram();
      return;
    }

    if (programState === 'RUNNING' && machineStatus === 'RUN') {
      this.pauseProgram();
      return;
    }

    if (programState === 'RUNNING' && machineStatus === 'HOLD') {
      this.resumeProgram();
    }
  }

  startProgram() {
    this.startButtonElement.disabled = true;
    this.statusElement.textContent = 'Solicitando início do programa...';

    const emitted = startGcode();

    if (!emitted) {
      this.setProgramState();
    }
  }

  pauseProgram() {
    this.startButtonElement.disabled = true;
    this.statusElement.textContent = 'Solicitando pausa do programa...';

    const emitted = holdCNC();

    if (!emitted) {
      this.updateProgramDisplay();
    }
  }

  resumeProgram() {
    this.startButtonElement.disabled = true;
    this.statusElement.textContent = 'Solicitando retomada do programa...';

    const emitted = resumeCNC();

    if (!emitted) {
      this.updateProgramDisplay();
    }
  }

  handleProgramControlResult(result) {
    const supportedCommands = ['gcode:start', 'cnc:hold', 'cnc:resume'];

    if (!supportedCommands.includes(result?.command)) {
      return;
    }

    if (result.ok) {
      return;
    }

    this.statusElement.textContent =
      result.message || 'Não foi possível controlar o programa.';

    this.setProgramState();
  }

  async uploadSelectedFile() {
    const selectedFile = this.fileInputElement.files?.[0];

    if (!selectedFile) {
      return;
    }

    this.uploadButtonElement.disabled = true;
    this.statusElement.textContent = 'Enviando programa...';

    try {
      const response = await fetch('/api/gcode/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error('G-code upload failed');
      }

      const state = await response.json();

      this.updateGcodeState(state);
    } catch {
      this.statusElement.textContent = 'Não foi possível enviar o programa.';
      this.uploadButtonElement.disabled = false;
    }
  }

  async showSelectedFile() {
    const selectedFile = this.fileInputElement.files?.[0];

    this.previewElement.textContent = '';
    this.uploadButtonElement.disabled = true;

    if (!selectedFile) {
      this.updateGcodeState(this.gcodeState);
      return;
    }

    try {
      const fileContent = await selectedFile.text();

      if (this.fileInputElement.files?.[0] !== selectedFile) {
        return;
      }

      const gcodeLines = fileContent.split(/\r?\n/);

      this.statusElement.textContent =
        `${selectedFile.name} — ${gcodeLines.length} linhas — ` +
        `${(selectedFile.size / 1024).toFixed(1)} KiB. ` +
        'Programa selecionado; ainda não enviado.';

      this.previewElement.textContent = gcodeLines.slice(0, 20).join('\n');
      this.uploadButtonElement.disabled = false;
    } catch {
      this.statusElement.textContent = 'Não foi possível ler o ficheiro.';
    }
  }
}

customElements.define('cnc-gcode-panel', CNCGcodePanel);

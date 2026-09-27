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
          Nenhum ficheiro selecionado.
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

    this.fileInputElement.addEventListener('change', () => {
      void this.showSelectedFile();
    });

    this.uploadButtonElement.addEventListener('click', () => {
      void this.uploadSelectedFile();
    });

    this.setProgramState('unavailable');
  }

  setProgramState(programState) {
    this.startButtonElement.classList.remove('gcode-panel__start--running');

    if (programState === 'ready') {
      this.startButtonElement.disabled = false;
      this.startButtonElement.textContent = 'Iniciar programa';
      return;
    }

    if (programState === 'running') {
      this.startButtonElement.disabled = true;
      this.startButtonElement.textContent = 'Programa em execução';
      this.startButtonElement.classList.add('gcode-panel__start--running');
      return;
    }

    this.startButtonElement.disabled = true;
    this.startButtonElement.textContent = 'Iniciar programa — indisponível';
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

      this.statusElement.textContent = `${selectedFile.name} enviado. Programa pronto para execução.`;

      this.setProgramState('ready');
    } catch {
      this.statusElement.textContent = 'Não foi possível enviar o programa.';
      this.uploadButtonElement.disabled = false;
      this.setProgramState('unavailable');
    }
  }

  async showSelectedFile() {
    const selectedFile = this.fileInputElement.files?.[0];

    this.previewElement.textContent = '';
    this.uploadButtonElement.disabled = true;
    this.setProgramState('unavailable');

    if (!selectedFile) {
      this.statusElement.textContent = 'Nenhum ficheiro selecionado.';
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

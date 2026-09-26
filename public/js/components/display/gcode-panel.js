class CNCGcodePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="gcode-panel__content">
        <div class="section-header">
          <h2>Programa G-code</h2>
        </div>

        <label for="gcodeFile">Selecionar programa</label>
        <input id="gcodeFile" type="file" accept=".gcode,.nc,.tap" />

        <p class="gcode-panel__status" role="status">
          Nenhum ficheiro selecionado.
        </p>

        <pre
          class="gcode-panel__preview"
          aria-label="Pré-visualização do G-code"
        ></pre>

        <button class="gcode-panel__start" type="button" disabled>
          Iniciar programa — indisponível
        </button>
      </section>
    `;

    this.fileInputElement = this.querySelector('#gcodeFile');
    this.statusElement = this.querySelector('.gcode-panel__status');
    this.previewElement = this.querySelector('.gcode-panel__preview');

    this.fileInputElement.addEventListener('change', () => {
      void this.showSelectedFile();
    });
  }

  async showSelectedFile() {
    const selectedFile = this.fileInputElement.files?.[0];

    this.previewElement.textContent = '';

    if (!selectedFile) {
      this.statusElement.textContent = 'Nenhum ficheiro selecionado.';
      return;
    }

    if (!/\.(gcode|nc|tap)$/i.test(selectedFile.name)) {
      this.statusElement.textContent =
        'Escolhe um ficheiro .gcode, .nc ou .tap.';
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
        'Pré-visualização apenas; execução indisponível.';

      this.previewElement.textContent = gcodeLines.slice(0, 20).join('\n');
    } catch {
      this.statusElement.textContent = 'Não foi possível ler o ficheiro.';
    }
  }
}

customElements.define('cnc-gcode-panel', CNCGcodePanel);

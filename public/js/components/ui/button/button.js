class UIButton extends HTMLElement {
  connectedCallback() {
    // Wrap the original content only once to preserve it
    // when the element is reconnected to the DOM.
    if (!this.buttonElement) {
      // Reuse an existing button instead of creating a nested one.
      const existingButton = this.querySelector(':scope > button');

      if (existingButton) {
        this.buttonElement = existingButton;
      } else {
        const buttonContent = this.innerHTML;

        this.innerHTML = `<button type="button">${buttonContent}</button>`;
        this.buttonElement = this.querySelector('button');
      }
    }

    this.update();
  }

  static get observedAttributes() {
    return ['type', 'variant', 'size', 'disabled'];
  }

  attributeChangedCallback() {
    if (this.buttonElement) {
      this.update();
    }
  }

  update() {
    this.buttonElement.type = this.getAttribute('type') || 'button';

    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'md';

    this.buttonElement.className = `button button--${variant} button--${size}`;
    this.buttonElement.disabled = this.hasAttribute('disabled');
  }
}

customElements.define('ui-button', UIButton);

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function setHTML(element, html) {
  if (!element) {
    return;
  }

  element.innerHTML = html;
}

function setText(element, text) {
  if (!element) {
    return;
  }

  element.textContent = text;
}

function addClass(element, className) {
  if (!element) {
    return;
  }

  element.classList.add(className);
}

function removeClass(element, className) {
  if (!element) {
    return;
  }

  element.classList.remove(className);
}

export { qs, qsa, setHTML, setText, addClass, removeClass };

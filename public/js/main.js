async function carregarMensagem() {
  const mensagem = document.querySelector('#mensagem');

  try {
    const resposta = await fetch('/api/hello');
    const texto = await resposta.text();

    mensagem.textContent = texto;
  } catch (erro) {
    console.error('Erro ao carregar mensagem:', erro);

    mensagem.textContent = 'Erro ao comunicar com o servidor.';
  }
}

carregarMensagem();

# Roadmap — Dashboard CNC

## Princípios do projeto

- Segurança antes de habilitar comandos na máquina real.
- Simulador e máquina real devem possuir estados separados.
- O backend deve ser a fonte oficial do estado.
- O frontend não deve assumir que um comando foi executado.
- Toda entrada externa deve ser validada.
- Funcionalidades críticas devem possuir testes automatizados.
- Desenvolvimento e produção devem usar configurações separadas.

---

# 0 — Preparação do ambiente

## 0.1 Ferramentas e repositório

- [x] Instalar Git
- [x] Criar o repositório do projeto
- [x] Instalar Node.js
- [x] Inicializar o projeto NPM
- [x] Configurar ES Modules
- [x] Criar `.gitignore`

## 0.2 Docker de desenvolvimento

- [x] Instalar Docker
- [x] Instalar Docker Compose
- [x] Criar Dockerfile inicial
- [x] Criar Docker Compose inicial
- [x] Criar `.dockerignore`
- [x] Validar a construção da imagem
- [x] Validar a inicialização do container
- [x] Criar scripts para iniciar e parar o ambiente

## 0.3 Qualidade e padronização

- [x] Instalar ESLint
- [x] Configurar ESLint para backend e frontend
- [x] Instalar Prettier
- [x] Criar `.prettierrc`
- [x] Criar `.prettierignore`
- [x] Configurar o VS Code
- [x] Criar comandos NPM para lint e formatação

## 0.4 Estrutura inicial

- [x] Separar frontend e backend
  - [x] Criar pasta `src`
  - [x] Criar pasta `public`
- [x] Definir `src/app.js` como entrada da aplicação
- [ ] Criar estrutura inicial dos componentes
- [ ] Criar estrutura inicial dos estilos

## 0.5 Inventário e montagem inicial

### Equipamentos definidos

- [x] Definir o Raspberry Pi 5 como computador da máquina
- [x] Definir o Arduino Uno Rev3 como controlador da CNC
- [x] Manter o Arduino Micro como placa de desenvolvimento no PC
- [x] Definir uma CNC Shield para conexão dos drivers ao Arduino Uno Rev3
- [x] Definir o A4988 como driver inicial dos motores
- [x] Definir o NEMA 17 modelo `17HS4401` como motor inicial
- [x] Identificar a corrente nominal de `1,7 A` por fase do NEMA 17
- [x] Registrar passo de `1,8°` e `200` passos por volta
- [x] Definir uma fonte Redrex de `24 V`, `15 A` e `360 W`
- [x] Verificar a corrente nominal disponível de `15 A`

### CNC Shield e A4988

- [x] Identificar a placa como `CNC Shield Ver. 3.00` para Arduino Uno
- [x] Confirmar compatibilidade da CNC Shield com GRBL 1.1
- [x] Identificar o encaixe do A4988 correspondente ao eixo X
- [x] Confirmar a orientação correta do A4988 antes de encaixá-lo
- [x] Identificar os módulos `HW-134` como compatíveis com A4988
- [x] Identificar os resistores de sensoriamento como `R100`
- [x] Registrar resistência de sensoriamento de `0,10 Ω`
- [x] Definir o modo de microstepping como `1/4`
- [x] Configurar somente o jumper `M1`
- [x] Verificar a existência de capacitor eletrolítico próximo à entrada de alimentação
- [x] Instalar dissipadores nos módulos A4988
- [x] Definir ventilação adequada para os drivers
- [x] Definir `VREF` alvo de `1,00 V`
- [x] Calcular limite de corrente aproximado de `1,25 A` por fase
- [x] Medir o `VREF` dos quatro drivers
- [x] Confirmar valores de `VREF` entre `0,98 V` e `1,00 V`
- [x] Confirmar limite estimado entre `1,225 A` e `1,25 A` por fase
- [x] Ajustar e validar o limite de corrente dos A4988
- [ ] Verificar a temperatura dos drivers durante os ensaios **(adicional)**

### Motor

- [ ] Identificar os pares de bobinas do motor
- [ ] Confirmar a sequência dos quatro fios
- [ ] Conectar uma bobina aos terminais `1A` e `1B`
- [ ] Conectar a outra bobina aos terminais `2A` e `2B`
- [ ] Confirmar que o motor está desacoplado da CNC
- [ ] Confirmar que o eixo do motor gira livremente antes da alimentação

### Fonte e segurança elétrica

- [ ] Confirmar a tensão de entrada configurada para a rede elétrica local
- [ ] Proteger os terminais de entrada da rede elétrica
- [ ] Ligar o terminal de proteção à terra quando previsto pelo fabricante
- [ ] Instalar fusível ou proteção adequada no circuito dos motores
- [ ] Disponibilizar chave para cortar a alimentação de 24 V
- [ ] Medir a saída antes de conectar a CNC Shield
- [ ] Confirmar a polaridade da saída
- [ ] Confirmar tensão de aproximadamente `24 V DC`
- [ ] Interligar corretamente os GNDs da fonte, da Shield e do Arduino
- [ ] Não conectar ou retirar o motor com o driver energizado

### Documentação e inspeção

- [ ] Documentar o esquema elétrico da montagem
- [ ] Verificar continuidade dos cabos
- [ ] Verificar ausência de curto-circuito
- [ ] Fotografar a orientação da CNC Shield e do A4988
- [ ] Fotografar e registrar a montagem utilizada nos experimentos
- [ ] Registrar os valores medidos da fonte
- [ ] Registrar o ajuste de corrente do A4988
- [ ] Preparar o procedimento do primeiro teste

---

# 1 — Desenvolvimento da base funcional

## 1.1 Frontend do Dashboard

- [x] Criar página principal e estrutura de cabeçalho, corpo e rodapé
- [x] Criar sistema de Web Components e componentes base de UI
- [x] Criar painel de posição dos eixos e controles de JOG
- [x] Criar painel de monitorização térmica
- [x] Criar painel de parada de emergência
- [x] Criar painel de câmera e telemetria
- [x] Criar painel de seleção e pré-visualização de G-code
- [x] Criar seletor da fonte de conexão e exibir estado da conexão
- [x] Sincronizar a interface com o estado da CNC e bloquear controles indisponíveis
- [x] Criar layout responsivo inicial

## 1.2 Backend e comunicação em tempo real

- [x] Criar servidor Express e servir o frontend
- [x] Integrar servidor HTTP com Socket.IO
- [x] Criar rota de configuração do Dashboard
- [x] Criar gerenciamento central do estado da CNC
- [x] Criar roteador de eventos e comandos Socket.IO
- [x] Implementar conexão e desconexão da fonte de dados
- [ ] Receber e validar comandos enviados pelo frontend
- [x] Sincronizar estado, conexão e capacidades com todos os clientes
- [x] Tratar e comunicar erros de conexão e operação
- [x] Restaurar o estado atual ao conectar ou atualizar o Dashboard

## 1.3 Simulador CNC

- [x] Criar estrutura e estado do simulador
- [x] Implementar inicialização, conexão e desconexão
- [x] Implementar ciclo de atualização em tempo real
- [x] Simular posição e movimento dos eixos
- [x] Implementar limites dos eixos simulados
- [x] Implementar estados `IDLE`, `RUN`, `HOLD` e `ALARM`
- [x] Implementar parada de emergência e reposição
- [x] Registrar histórico básico de emergências
- [x] Simular temperaturas e alarmes térmicos

## 1.4 Máquina real e comunicação serial — Grbl 1.1h

### 1.4.1 Estrutura e conexão serial

- [x] Criar estrutura própria da máquina real
- [x] Separar simulador e máquina real
- [x] Detectar portas seriais `ttyACM` e `ttyUSB`
- [x] Abrir porta serial em `115200 baud`
- [x] Confirmar abertura da porta serial
- [x] Fechar porta serial corretamente
- [x] Configurar acesso à serial no Docker
- [x] Configurar permissões do grupo `dialout`

### 1.4.2 Comunicação com Grbl

- [x] Ler respostas do Grbl terminadas por quebra de linha
- [x] Identificar respostas `ok`, `error` e `ALARM`
- [x] Solicitar e interpretar relatórios de estado com `?`
- [x] Detectar a conexão com Grbl
- [x] Detectar perda da comunicação serial
- [x] Criar e atualizar o estado da máquina real
- [x] Encaminhar o estado da máquina pelo Socket.IO

### 1.4.3 Integração e validação

- [ ] Mostrar conexão da máquina real no Dashboard
- [ ] Atualizar o Dashboard após perda da conexão
- [ ] Bloquear JOG real enquanto não estiver implementado
- [ ] Bloquear emergência real enquanto não estiver implementada
- [ ] Validar conexão e desconexão com o Arduino Uno R3
- [ ] Registrar os resultados da validação serial

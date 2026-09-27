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

- [x] Mostrar conexão da máquina real no Dashboard
- [x] Atualizar o Dashboard após perda da conexão
- [x] Bloquear JOG real enquanto não estiver implementado
- [x] Bloquear emergência real enquanto não estiver implementada
- [x] Validar conexão e desconexão com o Arduino Uno R3
- [x] Registrar os resultados da validação serial

## 1.5 Câmera e Raspberry Pi

- [x] Preparar Raspberry Pi 5 com Debian 13
- [x] Detectar e configurar a câmera USB em `/dev/video0`
- [x] Validar captura MJPEG em `1280x720` a 30 FPS
- [x] Instalar e configurar o µStreamer
- [x] Transmitir o stream MJPEG pela rede local
- [x] Integrar e validar o stream da câmera no Dashboard
- [x] Configurar o µStreamer como serviço `systemd` com inicialização automática
- [x] Instalar e configurar Docker e Docker Compose no Raspberry Pi
- [x] Configurar SSH, clonar o projeto e construir a imagem ARM64
- [x] Executar e validar o Dashboard pela rede em computadores e celular

## 1.6 Configuração do Grbl no Arduino Uno Rev3

### 1.6.1 Definição da arquitetura

- [x] Definir o Arduino Uno Rev3 como controlador da CNC
- [x] Definir o Grbl como firmware de controle
- [x] Definir G-code como linguagem de movimento
- [x] Manter Socket.IO entre frontend e backend
- [x] Utilizar o protocolo textual Grbl entre backend e Arduino
- [x] Configurar comunicação serial em `115200 baud`
- [x] Registrar a versão utilizada: `Grbl 1.1h`
- [x] Registrar a origem oficial do firmware
- [x] Separar comunicação serial, interpretação do protocolo e estado da máquina
- [x] Validar a arquitetura com o Arduino Uno Rev3 real

### 1.6.2 Instalação do GRBL

- [x] Instalar o GRBL na Arduino IDE
- [x] Abrir o exemplo `grblUpload`
- [x] Selecionar a placa `Arduino Uno`
- [x] Selecionar a porta serial do Uno Rev3
- [x] Compilar o firmware
- [x] Gravar o GRBL no Uno Rev3
- [x] Confirmar a gravação sem erros
- [x] Confirmar a mensagem de inicialização do GRBL

### 1.6.3 Validação da comunicação

- [x] Abrir a comunicação serial em `115200 baud`
- [x] Executar o comando `$I`
- [x] Executar o comando `$$`
- [x] Executar a consulta de estado `?`
- [x] Confirmar a resposta do GRBL
- [x] Salvar a configuração original
- [x] Confirmar que nenhum motor foi movimentado nesta etapa

### 1.6.4 Preparação da integração

- [x] Identificar respostas `ok`
- [x] Identificar respostas `error:n`
- [x] Identificar respostas `ALARM:n`
- [x] Identificar relatórios de estado `<...>`
- [x] Definir consulta periódica de estado com `?`
- [x] Definir timeout de resposta do Grbl
- [ ] Documentar os comandos Grbl utilizados pelo Dashboard

---

# 2 — Ambiente de execução no Raspberry Pi

## 2.1 Base do Raspberry Pi

- [x] Utilizar Raspberry Pi 5 como computador principal da CNC
- [x] Instalar Debian 13
- [x] Configurar acesso à rede local
- [x] Configurar acesso remoto por SSH
- [x] Instalar Git
- [x] Configurar acesso SSH ao repositório do projeto
- [x] Clonar o repositório no Raspberry Pi
- [x] Instalar Docker
- [x] Instalar Docker Compose
- [x] Configurar o usuário para executar Docker

## 2.2 Dispositivos da máquina

- [x] Detectar o Arduino Uno Rev3 pela interface USB
- [x] Identificar a porta serial `/dev/ttyACM0`
- [x] Configurar acesso ao grupo `dialout`
- [x] Disponibilizar a porta serial para o container Docker
- [x] Validar comunicação serial com Grbl em `115200 baud`
- [x] Detectar a câmera USB em `/dev/video0`
- [x] Validar captura MJPEG da câmera
- [x] Disponibilizar o stream da câmera pela rede
- [x] Validar acesso ao stream pelo Dashboard
- [x] Validar dispositivos após reinicialização completa do Raspberry Pi

## 2.3 Configuração por variáveis de ambiente

- [x] Definir `PORT`
- [x] Definir `CNC_SERIAL_PORT`
- [x] Definir `CAMERA_STREAM_URL`
- [x] Definir `GRBL_STATUS_INTERVAL_MS`
- [x] Definir `GRBL_STATUS_TIMEOUT_MS`
- [x] Definir `GRBL_STARTUP_TIMEOUT_MS`
- [x] Utilizar valores padrão seguros na configuração da aplicação
- [x] Encaminhar as variáveis para o container Docker
- [ ] Documentar as variáveis de ambiente disponíveis
- [ ] Criar configuração de ambiente específica para produção

## 2.4 Docker de desenvolvimento e produção

- [x] Criar imagem Docker para desenvolvimento
- [x] Criar imagem Docker para produção
- [x] Utilizar build multi-stage
- [x] Instalar somente dependências necessárias na imagem de produção
- [x] Executar a aplicação com usuário não privilegiado
- [x] Configurar acesso à porta serial no Docker Compose
- [x] Configurar acesso ao grupo `dialout` no container
- [x] Construir a imagem para arquitetura ARM64
- [x] Executar o Dashboard em container no Raspberry Pi
- [x] Validar explicitamente a imagem de produção no Raspberry Pi

## 2.5 Inicialização automática

- [x] Criar serviço `systemd` para o µStreamer
- [x] Habilitar inicialização automática da câmera
- [x] Validar o µStreamer após inicialização
- [x] Definir estratégia de inicialização automática do Dashboard
- [x] Configurar inicialização automática dos containers
- [x] Garantir reinicialização do Dashboard após falha
- [x] Garantir disponibilidade da serial após inicialização
- [x] Garantir disponibilidade da câmera após inicialização
- [x] Validar ordem de inicialização dos serviços
- [x] Validar funcionamento completo após reiniciar o Raspberry Pi

## 2.6 Fluxo de atualização

- [x] Configurar acesso do Raspberry Pi ao repositório Git
- [ ] Definir procedimento para atualizar o código com Git
- [ ] Definir procedimento para reconstruir a imagem Docker
- [ ] Definir procedimento para recriar os containers
- [ ] Preservar configurações locais durante atualizações
- [ ] Definir procedimento de rollback
- [ ] Registrar a versão implantada no Raspberry Pi
- [ ] Validar atualização sem reinstalação manual do ambiente
- [ ] Documentar o fluxo completo de atualização

## 2.7 Verificação no Raspberry Pi

- [x] Validar inicialização completa após reboot
- [x] Confirmar container do Dashboard em execução
- [x] Confirmar serviço da câmera em execução
- [x] Confirmar detecção do Arduino Uno Rev3
- [x] Confirmar comunicação com Grbl
- [x] Confirmar acesso ao stream MJPEG
- [x] Confirmar acesso ao Dashboard pela rede local
- [x] Confirmar conexão da máquina real pelo Dashboard
- [x] Confirmar atualização do Dashboard após perda da serial
- [ ] Executar validação final sem movimentar motores

---

# 3 — Controle e execução da CNC

## 3.0 Adequação do frontend

- [x] Adaptar o frontend ao fluxo de arquivo G-code e execução

## 3.1 Recebimento e gerenciamento do G-code

- [ ] Criar diretório persistente `data/gcode` no Raspberry Pi
- [ ] Disponibilizar o diretório de G-code ao container de produção
- [x] Implementar envio de arquivo do Dashboard para o backend
- [x] Salvar qualquer arquivo recebido como `execute.gcode`
- [x] Sobrescrever `execute.gcode` ao receber um novo arquivo
- [ ] Manter `execute.gcode` persistente após reinicializações
- [ ] Identificar no backend se existe um G-code carregado
- [ ] Bloquear JOG enquanto existir um G-code carregado
- [x] Permitir substituir o G-code carregado por um novo arquivo
- [ ] Permitir reutilizar o mesmo `execute.gcode` em múltiplas execuções

## 3.2 Estado do programa G-code

- [ ] Separar estado de arquivo carregado do estado de execução
- [ ] Definir estado sem arquivo carregado
- [ ] Definir estado de arquivo carregado e aguardando execução
- [ ] Definir estado de programa em execução
- [ ] Definir estado de programa concluído
- [ ] Manter o arquivo carregado após conclusão da execução
- [ ] Liberar novamente a ação de iniciar após conclusão
- [ ] Manter JOG bloqueado após conclusão enquanto houver arquivo carregado
- [ ] Sincronizar o estado do programa com o Dashboard
- [ ] Restaurar o estado de arquivo carregado após reiniciar o Dashboard

## 3.3 Execução do G-code

- [ ] Implementar ação para iniciar o G-code carregado
- [ ] Ler `execute.gcode` para execução
- [ ] Preparar as linhas do arquivo para envio
- [ ] Enviar comandos G-code ao Grbl pela comunicação serial
- [ ] Controlar o avanço das linhas durante a execução
- [ ] Impedir nova execução enquanto o programa estiver executando
- [ ] Atualizar o progresso da execução no Dashboard
- [ ] Detectar o fim do programa
- [ ] Retornar o programa ao estado disponível para nova execução
- [ ] Validar execuções consecutivas do mesmo `execute.gcode`

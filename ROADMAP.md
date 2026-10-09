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
- [x] Criar estrutura inicial dos componentes
- [x] Criar estrutura inicial dos estilos

## 0.5 Inventário e montagem inicial

### 0.5.1 Equipamentos definidos

- [x] Definir o Raspberry Pi 5 como computador da máquina
- [x] Definir o Arduino Uno Rev3 como controlador da CNC
- [x] Manter o Arduino Micro como placa de desenvolvimento no PC
- [x] Definir a CNC Shield Ver. 3.00 para conexão dos drivers
- [x] Definir o A4988 como driver inicial dos motores
- [x] Definir o NEMA 17 `17HS4401` como motor inicial
- [x] Registrar corrente nominal de `1,7 A` por fase do motor
- [x] Registrar passo de `1,8°` e `200` passos por volta
- [x] Definir a fonte Redrex de `24 V`, `15 A` e `360 W`
- [x] Confirmar corrente nominal disponível de `15 A`

### 0.5.2 CNC Shield e drivers A4988

- [x] Identificar a placa como `CNC Shield Ver. 3.00`
- [x] Confirmar compatibilidade da CNC Shield com GRBL 1.1
- [x] Identificar os encaixes dos drivers dos eixos
- [x] Confirmar a orientação correta dos A4988
- [x] Identificar os módulos `HW-134` utilizados
- [x] Identificar os resistores de sensoriamento como `R100`
- [x] Registrar resistência de sensoriamento de `0,10 Ω`
- [x] Instalar dissipadores nos módulos A4988
- [x] Definir ventilação adequada para os drivers
- [x] Verificar capacitor eletrolítico na alimentação da Shield

### 0.5.3 Configuração dos drivers A4988

- [x] Definir microstepping inicial em `1/4`
- [x] Configurar somente o jumper `M1`
- [x] Definir `VREF` alvo de `1,00 V`
- [x] Calcular limite de corrente aproximado de `1,25 A` por fase
- [x] Medir o `VREF` dos quatro drivers
- [x] Confirmar `VREF` entre `0,98 V` e `1,00 V`
- [x] Confirmar limite estimado entre `1,225 A` e `1,25 A` por fase
- [x] Ajustar e validar o limite de corrente dos A4988
- [x] Verificar temperatura dos drivers durante os ensaios
- [x] Registrar o resultado do ensaio térmico

### 0.5.4 Preparação dos motores

- [x] Identificar os pares de bobinas dos motores
- [x] Registrar as cores dos fios de cada bobina
- [x] Confirmar a sequência dos quatro fios
- [x] Conectar uma bobina aos terminais `1A` e `1B`
- [x] Conectar a outra bobina aos terminais `2A` e `2B`
- [x] Confirmar a correspondência entre motor e eixo da CNC
- [x] Confirmar que o motor de teste está desacoplado da CNC
- [x] Confirmar que o eixo do motor gira livremente sem alimentação
- [x] Verificar mecanicamente cabos e conectores dos motores
- [x] Confirmar a montagem antes de energizar os drivers

### 0.5.5 Fonte e segurança elétrica

- [x] Confirmar a tensão de entrada configurada para a rede elétrica local (`230 V AC`, Portugal)
- [x] Proteger os terminais de entrada da rede elétrica
- [x] Ligar o terminal de proteção à terra quando previsto pelo fabricante
- [x] Disponibilizar chave de corte na entrada de alimentação `230 V AC`
- [x] Medir a saída da fonte antes de conectar a CNC Shield
- [x] Confirmar a polaridade da saída
- [x] Confirmar tensão de aproximadamente `24 V DC`
- [x] Interligar corretamente os GNDs da fonte, Shield e Arduino
- [x] Não conectar ou retirar motores com os drivers energizados

## 0.6 Primeiro teste dos motores

- [x] Energizar a montagem após concluir a inspeção
- [x] Confirmar ausência de aquecimento ou comportamento anormal
- [x] Testar inicialmente apenas um eixo
- [x] Executar movimento curto e em baixa velocidade
- [x] Confirmar que o motor gira sem perda evidente de passos
- [x] Confirmar o sentido positivo e negativo do eixo
- [x] Verificar ruído, vibração e aquecimento durante o ensaio
- [x] Repetir o procedimento nos demais eixos
- [x] Confirmar resposta dos eixos X, Y e Z
- [x] Registrar o resultado do primeiro ensaio

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
- [x] Confirmar inicialização automática do µStreamer
- [x] Confirmar disponibilidade da câmera após boot
- [x] Definir estratégia de inicialização automática do Dashboard
- [x] Configurar inicialização automática dos containers
- [x] Garantir reinicialização do Dashboard após falha
- [x] Garantir disponibilidade da serial após inicialização
- [x] Validar ordem de inicialização dos serviços
- [x] Validar funcionamento completo após reiniciar o Raspberry Pi

## 2.6 Fluxo de atualização

- [x] Configurar acesso do Raspberry Pi ao repositório Git
- [x] Definir procedimento para atualizar o código com Git
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

- [x] Criar diretório persistente `data/gcode` no Raspberry Pi
- [x] Disponibilizar o diretório de G-code ao container de produção
- [x] Implementar envio de arquivo do Dashboard para o backend
- [x] Salvar qualquer arquivo recebido como `execute.gcode`
- [x] Sobrescrever `execute.gcode` ao receber um novo arquivo
- [x] Manter `execute.gcode` persistente após reinicializações
- [x] Identificar no backend se existe um G-code carregado
- [x] Bloquear JOG enquanto existir um G-code carregado
- [x] Permitir substituir o G-code carregado por um novo arquivo
- [x] Permitir reutilizar o mesmo `execute.gcode` em múltiplas execuções — `só se der tempo`

## 3.2 Estado do programa G-code

- [x] Separar estado de arquivo carregado do estado de execução
- [x] Definir estado sem arquivo carregado
- [x] Definir estado de arquivo carregado e aguardando execução
- [x] Definir estado de programa em execução
- [x] Definir estado de programa concluído
- [x] Manter o arquivo carregado após conclusão da execução
- [x] Liberar novamente a ação de iniciar após conclusão
- [x] Manter JOG bloqueado após conclusão enquanto houver arquivo carregado
- [x] Sincronizar o estado do programa com o Dashboard
- [x] Restaurar o estado de arquivo carregado após reiniciar o Dashboard

## 3.3 Execução do G-code

- [x] Implementar ação para iniciar o G-code carregado
- [x] Ler `execute.gcode` para execução
- [x] Preparar as linhas do arquivo para envio
- [x] Enviar comandos G-code ao Grbl pela comunicação serial
- [x] Controlar o avanço das linhas durante a execução
- [x] Impedir nova execução enquanto o programa estiver executando
- [x] Detectar o fim do programa
- [x] Retornar o programa ao estado disponível para nova execução
- [ ] Validar execuções consecutivas do mesmo `execute.gcode` — `bônus: fazer apenas se der tempo`
- [ ] Atualizar o progresso da execução no Dashboard — `bônus: fazer apenas se der tempo`

## 3.4 JOG da máquina real

- [x] Definir o formato interno do comando de JOG
- [x] Validar eixo, direção e distância recebidos
- [x] Converter a intenção de JOG para comando Grbl
- [x] Encaminhar o JOG pelo caminho central de comandos
- [x] Permitir JOG somente com a máquina real conectada
- [x] Bloquear JOG enquanto existir G-code carregado
- [x] Bloquear JOG em estados incompatíveis da máquina
- [x] Atualizar a posição pelo estado retornado pelo Grbl
- [x] Tratar rejeições e erros do comando de JOG
- [x] Validar JOG real nos eixos X, Y e Z

## 3.5 Execução de G-code na máquina real

- [x] Garantir que o JOG seja travado antes do primeiro comando G-code
- [x] Preparar um arquivo G-code mínimo para teste real
- [x] Enviar a primeira linha executável ao Grbl
- [x] Aguardar a resposta `ok` antes de enviar a próxima linha
- [x] Continuar o envio sequencial até o final do arquivo
- [ ] Interromper a execução caso o Grbl retorne `error` ou `ALARM`
- [x] Atualizar a posição da máquina durante a execução
- [x] Detectar o retorno do Grbl ao estado `Idle` ao final
- [x] Alterar o estado do programa de `RUNNING` para `COMPLETED`
- [ ] Adicional: validar condições antes de iniciar a execução

## 3.6 Pausa, retomada e emergência

- [x] Definir os estados em que o controle de execução é permitido
- [x] Implementar pausa real utilizando o mecanismo adequado do Grbl
- [x] Atualizar o estado da máquina para `HOLD` durante a pausa
- [x] Implementar retomada da execução após pausa
- [x] Sincronizar pausa e retomada com o Dashboard
- [x] Implementar a ação de emergência para a máquina real
- [x] Bloquear novos movimentos durante emergência ou `ALARM`
- [x] Definir o procedimento de reposição após emergência
- [x] Tratar perda da comunicação durante pausa ou execução
- [x] Encaminhar erros e mudanças de estado ao Dashboard

---

# 4 — Testes, segurança e diagnóstico

## 4.1 Estrutura de logs

- [x] Definir níveis básicos de log
- [x] Padronizar as mensagens de log do backend
- [x] Registrar conexão e desconexão da CNC
- [x] Registrar comandos relevantes enviados ao Grbl
- [x] Registrar respostas `ok`, `error` e `ALARM`
- [x] Registrar início, conclusão e falha da execução de G-code
- [x] Registrar falhas e timeouts de comandos
- [x] Registrar perda e recuperação da comunicação serial
- [x] Evitar excesso de logs das consultas periódicas de estado
- [x] Validar os logs no ambiente de produção do Raspberry Pi

## 4.2 Testes básicos da máquina

- [x] Validar conexão com a máquina real antes do movimento
- [x] Confirmar alimentação e comportamento normal dos drivers
- [x] Validar movimento positivo e negativo do eixo X
- [x] Validar movimento positivo e negativo do eixo Y
- [x] Validar movimento positivo e negativo do eixo Z
- [x] Validar movimentos curtos e em baixa velocidade
- [x] Confirmar atualização da posição no Dashboard
- [x] Confirmar retorno da máquina ao estado `IDLE`
- [x] Verificar ruído, vibração e temperatura dos drivers
- [x] Registrar os resultados dos primeiros testes físicos

## 4.3 Testes de execução G-code

- [x] Validar carregamento de `execute.gcode`
- [x] Validar início da execução pela máquina real
- [x] Confirmar transição `READY → RUNNING`
- [x] Confirmar envio controlado das linhas ao Grbl
- [x] Confirmar movimento físico correspondente ao programa
- [x] Confirmar detecção do fim e retorno ao estado disponível
- [x] Confirmar que o arquivo permanece carregado após a execução
- [x] Executar novamente o mesmo `execute.gcode`
- [x] Confirmar que o JOG permanece bloqueado durante a execução do G-code
- [ ] Confirmar atualização do progresso no Dashboard — `bônus: fazer apenas se der tempo`

## 4.4 Testes de falha e segurança

- [x] Validar rejeição de movimento sem máquina conectada
- [x] Validar bloqueio de comandos concorrentes incompatíveis
- [x] Validar pausa durante movimento
- [x] Validar retomada após pausa
- [x] Validar comportamento da emergência
- [x] Validar comportamento durante estado `ALARM`
- [x] Validar tratamento de respostas `error:n` do Grbl
- [x] Validar timeout de comando
- [x] Validar perda da comunicação durante operação
- [x] Confirmar recuperação controlada após falha

## 4.5 Robustez da comunicação serial

- [x] Tratar erro da porta serial após a abertura
- [x] Tratar fechamento inesperado da porta serial
- [x] Detectar remoção do cabo USB durante a operação
- [x] Notificar os clientes após perda da comunicação serial
- [x] Rejeitar comandos pendentes após falha da comunicação
- [x] Limpar dados do Grbl que não sejam mais confiáveis após desconexão
- [ ] Impedir que respostas antigas confirmem comandos após reconexão
- [ ] Detectar reinicialização inesperada do Grbl durante uma conexão ativa
- [ ] Recuperar de forma controlada a comunicação após reinicialização do Grbl
- [ ] Validar reconexão e retomada segura após falhas sucessivas

# 5 — Limites, homing, configuração e sensores

## 5.1 Sensores de fim de curso

- [x] Definir os sensores utilizados nos eixos
- [ ] Definir a posição dos sensores na máquina
- [x] Identificar as entradas de limite da CNC Shield
- [ ] Definir a lógica elétrica dos sensores
- [x] Instalar o sensor do eixo X
- [ ] Instalar o sensor do eixo Y
- [ ] Instalar o sensor do eixo Z
- [ ] Organizar e proteger o cabeamento dos sensores
- [ ] Confirmar a leitura dos sensores pelo Grbl
- [ ] Validar individualmente cada sensor

## 5.2 Limites da máquina

- [ ] Definir o curso útil do eixo X
- [ ] Definir o curso útil do eixo Y
- [ ] Definir o curso útil do eixo Z
- [ ] Configurar os cursos máximos no Grbl
- [ ] Configurar `hard limits`
- [ ] Configurar `soft limits`
- [ ] Confirmar atuação dos limites físicos
- [ ] Confirmar bloqueio ao ultrapassar limites lógicos
- [ ] Confirmar geração de `ALARM` quando aplicável
- [ ] Validar recuperação após acionamento de limite

## 5.3 Homing

- [ ] Definir a direção de homing de cada eixo
- [ ] Definir a posição de referência da máquina
- [ ] Habilitar homing no Grbl
- [ ] Configurar a direção de busca dos sensores
- [ ] Configurar velocidade de busca
- [ ] Configurar velocidade de aproximação
- [ ] Configurar distância de afastamento do sensor
- [ ] Executar homing de forma controlada
- [ ] Executar ciclo completo de homing
- [ ] Confirmar a posição da máquina após homing

## 5.4 Calibração dos eixos

- [ ] Calcular `steps/mm` inicial do eixo X
- [ ] Calcular `steps/mm` inicial do eixo Y
- [ ] Calcular `steps/mm` inicial do eixo Z
- [ ] Configurar os valores iniciais no Grbl
- [ ] Executar deslocamento conhecido no eixo X
- [ ] Executar deslocamento conhecido no eixo Y
- [ ] Executar deslocamento conhecido no eixo Z
- [ ] Medir o deslocamento real dos três eixos
- [ ] Corrigir os valores de `steps/mm`
- [ ] Validar a precisão final dos movimentos

## 5.5 Sensores e monitorização

### 5.5.1 Monitorização da caixa dos drivers — DHT20

- [x] Definir o DHT20 como sensor de temperatura e umidade
- [x] Definir a região dos drivers como ponto de medição de temperatura
- [x] Instalar o DHT20 na tampa da caixa próximo aos quatro drivers
- [x] Integrar a leitura do DHT20 ao Raspberry Pi
- [x] Enviar os valores do sensor ao backend
- [x] Integrar os valores ao estado da CNC
- [x] Exibir os valores no Dashboard
- [ ] Definir limites de aviso
- [ ] Registrar eventos relevantes nos logs
- [ ] Validar o sensor durante operação da máquina

> **Observação:** a “temperatura dos drivers” é obtida pelo sensor DHT20
> instalado na tampa da caixa, próximo aos quatro drivers. A leitura
> representa a temperatura do ar nessa região e não a temperatura direta
> dos A4988.

### 5.5.2 Monitorização da temperatura do spindle — DS18B20

- [ ] Definir o DS18B20 como sensor de temperatura do spindle
- [ ] Definir o ponto de instalação no spindle
- [ ] Definir a fixação térmica e proteção do sensor
- [ ] Integrar fisicamente o DS18B20 ao Raspberry Pi
- [ ] Configurar e validar a interface 1-Wire
- [ ] Integrar a leitura do DS18B20 ao backend
- [ ] Integrar a leitura ao campo `spindleTemp`
- [ ] Exibir a temperatura real do spindle no Dashboard
- [ ] Definir limite de aviso da temperatura do spindle
- [ ] Validar a leitura durante operação da máquina

## 5.6 Configuração final do Grbl

- [x] Revisar os parâmetros atuais do Grbl
- [ ] Configurar `steps/mm` definitivos
- [ ] Configurar velocidade máxima dos eixos
- [ ] Configurar aceleração dos eixos
- [ ] Configurar curso máximo dos eixos
- [ ] Configurar parâmetros de homing
- [ ] Configurar parâmetros de limites
- [ ] Validar o sentido dos eixos
- [ ] Exportar a configuração final do Grbl
- [ ] Registrar a configuração final no projeto

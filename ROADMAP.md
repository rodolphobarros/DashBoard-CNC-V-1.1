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

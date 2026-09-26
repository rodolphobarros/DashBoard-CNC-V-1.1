# Socket Client

Documentação do arquivo `socketClient.js`.

O `socketClient.js` centraliza a comunicação Socket.IO entre o frontend do Dashboard CNC e o servidor.

## Estado da CNC

O evento `cnc:state` utiliza o seguinte estado:

| Variável          | Tipo             | Valor inicial  | Descrição                             |
| ----------------- | ---------------- | -------------- | ------------------------------------- |
| `source`          | `string \| null` | `null`         | Origem da conexão com a CNC           |
| `connection`      | `string`         | `DISCONNECTED` | Estado da conexão com a CNC           |
| `status`          | `string \| null` | `null`         | Estado operacional da CNC             |
| `emergency`       | `boolean`        | `false`        | Indica emergência ativa               |
| `lastEmergencyAt` | `string \| null` | `null`         | Data/hora da última emergência        |
| `emergencyCount`  | `number`         | `0`            | Quantidade de emergências registradas |
| `holdReason`      | `string \| null` | `null`         | Motivo de pausa ou espera             |
| `position`        | `object \| null` | `null`         | Posição atual dos eixos               |
| `feedRate`        | `number \| null` | `null`         | Velocidade de avanço                  |
| `spindleSpeed`    | `number \| null` | `null`         | Velocidade do spindle                 |
| `driverTemp`      | `number \| null` | `null`         | Temperatura do driver                 |
| `spindleTemp`     | `number \| null` | `null`         | Temperatura do spindle                |
| `alarms`          | `array`          | `[]`           | Lista de alarmes ativos               |

## Capabilities

O objeto `capabilities` informa quais comandos estão disponíveis.

| Variável    | Tipo      | Valor inicial | Descrição                     |
| ----------- | --------- | ------------- | ----------------------------- |
| `jog`       | `boolean` | `false`       | Permite movimentação manual   |
| `emergency` | `boolean` | `false`       | Permite comando de emergência |

## Eventos recebidos do servidor

### `cnc:state`

Atualiza o estado atual da CNC.

```js
socket.on('cnc:state', (state) => {
  // state
});
```

import http from 'node:http';

import express from 'express';
import { Server } from 'socket.io';

import registerSocketRouter from './routes/socketRouter.js';

const app = express();
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

registerSocketRouter(socketServer);

export { app, httpServer, socketServer };

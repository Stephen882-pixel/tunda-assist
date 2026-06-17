import { type INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { Server } from 'socket.io';

/**
 * Binds Socket.IO to the same HTTP server as Express and allows browser clients
 * to connect (CORS / credentials) for the `/chat` namespace.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: Record<string, unknown>): Server {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        credentials: true,
      },
    }) as Server;
  }
}

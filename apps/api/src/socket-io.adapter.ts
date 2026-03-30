import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';

/**
 * Socket.IO adapter that sets CORS to a specific origin with credentials.
 * Without this, Socket.IO uses wildcard '*' which fails when client uses withCredentials: true.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    appOrHttpServer: INestApplicationContext | any,
    private readonly corsOrigin: string = 'http://localhost:5173',
  ) {
    super(appOrHttpServer);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const opts = {
      ...options,
      cors: {
        origin: this.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    } as ServerOptions;
    return super.createIOServer(port, opts);
  }
}

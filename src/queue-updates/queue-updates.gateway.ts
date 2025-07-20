// queue-updates.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/queue',
})
export class QueueUpdatesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueueUpdatesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'You are connected to /queue' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitQueueUpdate(data: any) {
    this.logger.debug(`Broadcasting queueUpdate: ${JSON.stringify(data)}`);
    this.server.emit('queueUpdate', data);
  }
}

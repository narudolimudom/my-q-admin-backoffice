import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: '/queue'
})
export class QueueUpdatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueueUpdatesGateway.name);

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Admin panel client connected to queue namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin panel client disconnected from queue namespace: ${client.id}`);
  }

  emitQueueUpdate(data: any) {
    this.logger.debug(`Emitting queueUpdate from Admin Panel: ${JSON.stringify(data)}`);
    this.server.emit('queueUpdate', data);
  }
}
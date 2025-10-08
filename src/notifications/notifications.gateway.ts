/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Organization } from './../entity/organization.entity';
import { VerifyCallback } from './../../node_modules/@types/jsonwebtoken/index.d';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/strategies/jwt.strategy'; // Our defined payload interface
import { timestamp } from 'rxjs';
import { time } from 'console';


@WebSocketGateway({
  cors:{origin:'*'}},

)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger=new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ){ }
  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth.token || client.handshake.query.token;
    if (!token) {
      this.logger.warn(`Client disconnected(No token): ${client.id}`);
      return client.disconnect();
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as JwtPayload;

      (client as any).user = payload;
      const organizationRoom = `org-${payload.organizationId}`;
      void client.join(organizationRoom);
      this.logger.log(`Client ${payload.email} connected to room: ${organizationRoom}`);

      this.server.to(organizationRoom).emit('userConnected', {
        userId: payload.userId,
        email: payload.email,
        online: true,
      });
    } catch {
      this.logger.warn(`Client auth failed: ${client.id}`);
      return client.disconnect();
    }
  }

handleDisconnect(client: Socket){
  const user=(client as any).user as JwtPayload;
  if(user){
    const organizationRoom=`org-${user.organizationId}`;
    this.logger.log(`Client ${user.email} disconnected from room ${organizationRoom}`);

    this.server.to(organizationRoom).emit('userDisconnected',{
      userId:user.userId,
      online: false
    });

  }
  for (const room of client.rooms) {
    if (room !== client.id) {
      void client.leave(room);
    }
  }
}
@SubscribeMessage('sendMessage')
handleMessage(@MessageBody () data: any,client: Socket): void {
  const user=(client as any).user as JwtPayload;
  if(!user) return;
  const organizationRoom=` org-${user.organizationId}`;
  this.server.to(organizationRoom).emit(`newMessage`,{
    senderId:user.userId,
    message: data.message,
    timestamp: new Date(),
  })
}

/**
   * Used by other services (like TasksService) to send real-time updates.
   * @param organizationId The organization room to target.
   * @param event The event name (e.g., 'taskUpdated', 'deadlineAlert').
   * @param data The payload data.
   */
  sendToOrganization(organizationId: string,event: string,data: any): void {
    const room=`org-${organizationId}`
    this.logger.verbose(` Broadcasting even ${event} to ${room}`);
    this.server.to(room).emit(event, data);
  }
}
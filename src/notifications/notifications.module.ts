
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module'; 
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    // Import AuthModule to use the configured JwtModule (or just import JwtModule.registerAsync if preferred)
    AuthModule,
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // Export so other services can use it to broadcast
})
export class NotificationsModule {}
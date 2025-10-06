// src/invites/invites.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { Invite } from '../entity/invite.entity'; 
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [

    TypeOrmModule.forFeature([Invite]), 
    UsersModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
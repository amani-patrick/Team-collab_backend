import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invite } from '../entity/invite.entity';
import { CreateInviteDto } from './dto/create-invite.dto'; 
import { UsersService } from '../users/users.service';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private inviteRepository: Repository<Invite>,
    private usersService: UsersService,
  ) {}

  /**
   * Creates a new invite record and token for a prospective team member.
   * @param dto - email and role.
   * @param organizationId - The organization the user is being invited to.
   * @param inviterId - The user sending the invite.
   */
  async createInvite(dto: CreateInviteDto, organizationId: string, inviterId: string): Promise<Invite> {
    const existingUser = await this.usersService.findOneByEmailWithPassword(dto.email);
    if (existingUser) {
        if (existingUser.organizationId === organizationId) {
            throw new ConflictException('User is already a member of this organization.');
        }
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newInvite = this.inviteRepository.create({
      email: dto.email,
      role: dto.role,
      organizationId,
      token,
      expiresAt,
    });
    //adding inviteeId on above newInvite entity
    const savedInvite = await this.inviteRepository.save(newInvite);
    //invite email send for later development
    return savedInvite;
  }

  async findAllInOrganization(organizationId: string): Promise<Invite[]> {
    return this.inviteRepository.find({
      where: { organizationId },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
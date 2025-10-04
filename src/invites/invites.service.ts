import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invite } from '../entity/invite.entity';
import { CreateInviteDto } from './dto/create-invite.dto'; // We need this DTO
import { UsersService } from '../users/users.service';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private inviteRepository: Repository<Invite>,
    private usersService: UsersService, // To check if the user already exists
  ) {}

  /**
   * Creates a new invite record and token for a prospective team member.
   * @param dto - email and role.
   * @param organizationId - The organization the user is being invited to.
   * @param inviterId - The user sending the invite.
   */
  async createInvite(dto: CreateInviteDto, organizationId: string, inviterId: string): Promise<Invite> {
    // 1. Check if the user is already a member of this or any company
    const existingUser = await this.usersService.findOneByEmailWithPassword(dto.email);
    if (existingUser) {
        // You may want to allow inviting users who are already members of *other* organizations.
        // But for *this* organization, they should not exist.
        if (existingUser.organizationId === organizationId) {
            throw new ConflictException('User is already a member of this organization.');
        }
    }

    // 2. Generate a secure, unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // 3. Set expiration (e.g., 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Create and save the Invite record
    const newInvite = this.inviteRepository.create({
      email: dto.email,
      role: dto.role,
      organizationId,
      token,
      expiresAt,
      // You might also include the inviterId here
    });

    const savedInvite = await this.inviteRepository.save(newInvite);

    // TODO: In production, send email here using a dedicated EmailService.
    // The link will be: frontend_url/invite?token={token}

    return savedInvite;
  }
}
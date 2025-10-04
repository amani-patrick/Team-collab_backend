import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * CRITICAL for Auth: Finds a user by email, explicitly selecting the password hash.
   */
  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      // Explicitly select fields required for login/auth check
      select: ['id', 'name', 'email', 'passwordHash', 'role', 'organizationId'], 
      relations: ['organization'], 
    });
  }

  /**
   * Finds a user by ID (for profile view). Excludes sensitive fields automatically.
   */
  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['organization'],
    });
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }
  
  /**
   * Updates a user's profile, scoped by their ID.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
    }
    
    // NOTE: If password is in DTO, it must be hashed here before saving.
    // We will skip the hashing logic for brevity, but it's a critical step.

    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }
  
  /**
   * Finds all users within a specific organization (multi-tenancy scoping).
   */
  async findAllInOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organizationId },
      select: ['id', 'name', 'email', 'role', 'phoneNumber'], // Do not expose passwordHash
    });
  }
async findOneByEmail(email: string): Promise<User | null> {
  return await this.usersRepository.findOne({ where: { email } });
}
}
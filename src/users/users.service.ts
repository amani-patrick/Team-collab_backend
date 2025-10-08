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

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'passwordHash', 'role', 'organizationId'], 
      relations: ['organization'], 
    });
  }

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
  
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
    }
    
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }
  
  async findAllInOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organizationId },
      select: ['id', 'name', 'email', 'role', 'phoneNumber'],
    });
  }

  async findOneByIdAndOrg(id: string, organizationId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, organizationId },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
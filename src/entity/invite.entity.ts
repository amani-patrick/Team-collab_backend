
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { UserRole } from '../common/enums/user-role.enum'; 
import { InviteStatus } from '../common/enums/user-role.enum';

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date; 


  @Column({ type: 'uuid' })
  organizationId: string;


  @ManyToOne(() => Organization, (organization) => organization.invites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;
}
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BillingProfile } from './billing/billing-profile.entity';
import { Subscription } from './subscription/subscription.entity';
import { Invite } from './invite/invite.entity';
import { OnboardingStep } from 'src/common/enums/onboarding-step.enum';

@Entity('organizations') 
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  industry: string;

  @Column('int') 
  teamSize: number;



  @Column({ type: 'uuid' })
  ownerId: string; // FK to User.id

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;


  @OneToMany(() => User, (user) => user.organization)
  users: User[];


  @OneToOne(() => BillingProfile, (billingProfile) => billingProfile.organization)
  billingProfile: BillingProfile;


  @OneToOne(() => Subscription, (subscription) => subscription.organization)
  subscription: Subscription;

  @OneToMany(() => Invite, (invite) => invite.organization)
  invites: Invite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
  type: 'enum',
  enum: OnboardingStep, 
  default: OnboardingStep.ACCOUNT_SETUP,
})
onboardingStep: OnboardingStep;
}
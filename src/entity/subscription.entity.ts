/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { SubscriptionPlan } from '../common/enums/user-role.enum';
import { SubscriptionStatus } from '../common/enums/user-role.enum';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  status: SubscriptionStatus;

  @Column({ unique: true, nullable: true }) // Should be unique, but nullable until payment is set up
  stripeCustomerId: string;

  @Column({ unique: true, nullable: true })
  stripeSubscriptionId: string;

  // --- Relations ---

  @Column({ type: 'uuid', unique: true }) // Ensure one subscription per organization
  organizationId: string; // FK to Organization.id

  // The owning side of a OneToOne relation.
  @OneToOne(() => Organization, (organization) => organization.subscription, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // --- Timestamps ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
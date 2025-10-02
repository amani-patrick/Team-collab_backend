/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
export enum UserRole  {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
}

export enum SubscriptionStatus {
    PAID= 'PAID',
    TRIALING= 'TRIALING',
    EXPIRED= 'EXPIRED',
    CANCELED= 'CANCELED',
    PAST_DUE= 'PAST_DUE',
}

export enum InviteStatus{
    PENDING= 'PENDING',
    ACCEPTED='ACCEPTED',
    REJECTED= 'REJECTED',
    VOID='VOID,'
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export enum TaskStatus {
  TODO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
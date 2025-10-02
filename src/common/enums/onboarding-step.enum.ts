/* eslint-disable prettier/prettier */
export enum OnboardingStep {
  ACCOUNT_SETUP = 'ACCOUNT_SETUP', // Step 1: User created
  ORG_SETUP = 'ORG_SETUP', // Step 2: Org name, Industry, Size
  BILLING_CONTACT = 'BILLING_CONTACT', // Step 3: BillingProfile created
  PLAN_SELECTION = 'PLAN_SELECTION', // Step 4: Subscription created/updated
  INVITE_MEMBERS = 'INVITE_MEMBERS', // Step 5: Invites sent
  COMPLETED = 'COMPLETED', // Step 6: Full access granted
}
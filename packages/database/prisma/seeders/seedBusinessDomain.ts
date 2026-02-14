import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';
import type { SeededOrganizations } from './seedOrganizations';

export async function seedBusinessDomain(
  prisma: PrismaClient,
  users: SeededUsers,
  organizations: SeededOrganizations,
): Promise<void> {
  const orgId = organizations.activeOrg.id;
  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in365Days = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const existingIntegration = await prisma.integration.findFirst({
    where: { organizationId: orgId, provider: 'SLACK' },
  });

  if (existingIntegration) {
    await prisma.integration.update({
      where: { id: existingIntegration.id },
      data: {
        description: faker.company.buzzPhrase(),
        isIntegrated: true,
        integrationDetails: {
          workspace: 'porkfoods',
          channel: '#hr-notifications',
        },
      },
    });
  } else {
    await prisma.integration.create({
      data: {
        organizationId: orgId,
        provider: 'SLACK',
        description: faker.company.buzzPhrase(),
        isIntegrated: true,
        integrationDetails: {
          workspace: 'porkfoods',
          channel: '#hr-notifications',
        },
      },
    });
  }

  const plan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Growth Plan' },
    update: {
      description: faker.company.catchPhrase(),
      monthlyPrice: '9.00',
      yearlyPrice: '90.00',
      isFeatured: true,
      trialDays: 14,
      isActive: true,
      displayOrder: 1,
      features: ['People Directory', 'Attendance', 'Policies'],
    },
    create: {
      name: 'Growth Plan',
      description: faker.company.catchPhrase(),
      monthlyPrice: '9.00',
      yearlyPrice: '90.00',
      isFeatured: true,
      trialDays: 14,
      isActive: true,
      displayOrder: 1,
      features: ['People Directory', 'Attendance', 'Policies'],
    },
  });

  const promo = await prisma.promoCode.upsert({
    where: { code: 'PORK10' },
    update: {
      description: '10% launch discount',
      discountType: 'PERCENTAGE',
      discountValue: '10.00',
      maxUses: 100,
      usedCount: 1,
      validFrom: now,
      validUntil: in365Days,
      isActive: true,
    },
    create: {
      code: 'PORK10',
      description: '10% launch discount',
      discountType: 'PERCENTAGE',
      discountValue: '10.00',
      maxUses: 100,
      usedCount: 1,
      validFrom: now,
      validUntil: in365Days,
      isActive: true,
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { id: 'seed-subscription-pork-active' },
    update: {
      organizationId: orgId,
      planId: plan.id,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      employeeCount: users.employees.length + 1,
      unitPrice: '90.00',
      subtotal: '810.00',
      discount: '81.00',
      total: '729.00',
      promoCodeId: promo.id,
      startedAt: now,
      expiresAt: in365Days,
      trialEndsAt: in14Days,
      autoRenew: true,
      nextBillingDate: in365Days,
    },
    create: {
      id: 'seed-subscription-pork-active',
      organizationId: orgId,
      planId: plan.id,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      employeeCount: users.employees.length + 1,
      unitPrice: '90.00',
      subtotal: '810.00',
      discount: '81.00',
      total: '729.00',
      promoCodeId: promo.id,
      startedAt: now,
      expiresAt: in365Days,
      trialEndsAt: in14Days,
      autoRenew: true,
      nextBillingDate: in365Days,
    },
  });

  await prisma.subscriptionHistory.upsert({
    where: { id: 'seed-subscription-history-1' },
    update: {
      subscriptionId: subscription.id,
      planId: plan.id,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      employeeCount: users.employees.length + 1,
      total: '729.00',
      reason: 'Initial seeded subscription',
      changedAt: now,
    },
    create: {
      id: 'seed-subscription-history-1',
      subscriptionId: subscription.id,
      planId: plan.id,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      employeeCount: users.employees.length + 1,
      total: '729.00',
      reason: 'Initial seeded subscription',
      changedAt: now,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-payment-1' },
    update: {
      subscriptionId: subscription.id,
      amount: '729.00',
      currency: 'USD',
      status: 'SUCCEEDED',
      paymentMethod: 'CARD',
      cardLast4: '4242',
      cardBrand: 'Visa',
      billingEmail: 'billing@porkfoods.example.com',
      billingName: organizations.activeOrg.name,
      billingCountry: 'US',
      billingAddress: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state({ abbreviated: true }),
      billingPostalCode: faker.location.zipCode(),
      externalPaymentId: 'pi_seed_pork_001',
      paidAt: now,
      failureReason: null,
    },
    create: {
      id: 'seed-payment-1',
      subscriptionId: subscription.id,
      amount: '729.00',
      currency: 'USD',
      status: 'SUCCEEDED',
      paymentMethod: 'CARD',
      cardLast4: '4242',
      cardBrand: 'Visa',
      billingEmail: 'billing@porkfoods.example.com',
      billingName: organizations.activeOrg.name,
      billingCountry: 'US',
      billingAddress: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state({ abbreviated: true }),
      billingPostalCode: faker.location.zipCode(),
      externalPaymentId: 'pi_seed_pork_001',
      paidAt: now,
    },
  });

  const annualLeaveType = await prisma.policyType.upsert({
    where: {
      name_organizationId: {
        name: 'Annual Leave',
        organizationId: orgId,
      },
    },
    update: {
      description: 'Standard paid annual leave policy',
      isPaid: true,
      createdBy: users.johnOrgAdmin.id,
    },
    create: {
      organizationId: orgId,
      name: 'Annual Leave',
      description: 'Standard paid annual leave policy',
      isPaid: true,
      createdBy: users.johnOrgAdmin.id,
    },
  });

  await prisma.policy.upsert({
    where: {
      name_organizationId: {
        name: 'Annual Leave 2026',
        organizationId: orgId,
      },
    },
    update: {
      policyTypeId: annualLeaveType.id,
      description: faker.lorem.sentence(),
      assignDate: now,
      frequency: 'YEARLY',
      entitledDays: 15,
      maximumCarryOverDays: 5,
      carryOverExpiration: in365Days,
    },
    create: {
      organizationId: orgId,
      name: 'Annual Leave 2026',
      policyTypeId: annualLeaveType.id,
      description: faker.lorem.sentence(),
      assignDate: now,
      frequency: 'YEARLY',
      entitledDays: 15,
      maximumCarryOverDays: 5,
      carryOverExpiration: in365Days,
    },
  });

  await prisma.session.upsert({
    where: { id: 'seed-session-john' },
    update: {
      userId: users.johnOrgAdmin.id,
      expiresAt: in14Days,
    },
    create: {
      id: 'seed-session-john',
      userId: users.johnOrgAdmin.id,
      expiresAt: in14Days,
    },
  });

  await prisma.magicLink.upsert({
    where: { token: 'seed-magic-john-001' },
    update: {
      userId: users.johnOrgAdmin.id,
      expiresAt: in14Days,
      usedAt: null,
    },
    create: {
      userId: users.johnOrgAdmin.id,
      token: 'seed-magic-john-001',
      expiresAt: in14Days,
      usedAt: null,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'seed-audit-org-created' },
    update: {
      organizationId: orgId,
      userId: users.johnOrgAdmin.id,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: orgId,
      metadata: {
        source: 'faker-seed',
        generatedAt: now.toISOString(),
      },
    },
    create: {
      id: 'seed-audit-org-created',
      organizationId: orgId,
      userId: users.johnOrgAdmin.id,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: orgId,
      metadata: {
        source: 'faker-seed',
        generatedAt: now.toISOString(),
      },
    },
  });
}

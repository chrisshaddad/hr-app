import { PrismaClient } from '../../src/generated/prisma/client';

interface ChecklistSeed {
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  tasks: {
    name: string;
    mandatory: boolean;
    assignedRole: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  }[];
}

const CHECKLIST_TEMPLATES: ChecklistSeed[] = [
  {
    name: 'Employee Onboarding',
    type: 'ONBOARDING',
    tasks: [
      { name: 'Submit ID Document', mandatory: true, assignedRole: 'EMPLOYEE' },
      { name: 'Sign Employment Contract', mandatory: true, assignedRole: 'EMPLOYEE' },
      { name: 'Create Work Email Account', mandatory: true, assignedRole: 'ORG_ADMIN' },
      { name: 'Assign Laptop', mandatory: true, assignedRole: 'MANAGER' },
      { name: 'Orientation Meeting', mandatory: true, assignedRole: 'MANAGER' },
    ],
  },
  {
    name: 'Employee Offboarding',
    type: 'OFFBOARDING',
    tasks: [
      { name: 'Return Company Laptop', mandatory: true, assignedRole: 'EMPLOYEE' },
      { name: 'Revoke System Access', mandatory: true, assignedRole: 'ORG_ADMIN' },
      { name: 'Exit Interview', mandatory: true, assignedRole: 'MANAGER' },
      { name: 'Final Payroll Clearance', mandatory: true, assignedRole: 'ORG_ADMIN' },
    ],
  },
];

export async function seedChecklistTemplates(prisma: PrismaClient) {
  console.log('🌱 Seeding Checklist Templates...');

  // Only seed for ACTIVE organizations
  const organizations = await prisma.organization.findMany({
    where: { status: 'ACTIVE' },
  });

  if (!organizations.length) {
    console.warn('No active organizations found. Skipping checklist seeding.');
    return;
  }

  for (const org of organizations) {
    console.log(`  → Seeding templates for ${org.name}`);

    for (const template of CHECKLIST_TEMPLATES) {
      // Prevent duplicate creation
      const existingTemplate = await prisma.checklistTemplate.findFirst({
        where: {
          name: template.name,
          organizationId: org.id,
        },
      });

      if (existingTemplate) {
        console.log(`    Checklist "${template.name}" already exists. Skipping.`);
        continue;
      }

      const createdTemplate = await prisma.checklistTemplate.create({
        data: {
          name: template.name,
          type: template.type,
          organizationId: org.id,
        },
      });

      for (let i = 0; i < template.tasks.length; i++) {
        const taskSeed = template.tasks[i];

        // Create TaskTemplate
        const createdTaskTemplate = await prisma.taskTemplate.create({
          data: {
            name: taskSeed.name,
            mandatory: taskSeed.mandatory,
          },
        });

        // Assign role to task
        await prisma.taskTemplateRole.create({
          data: {
            taskTemplateId: createdTaskTemplate.id,
            role: taskSeed.assignedRole,
          },
        });

        // Link task to checklist with order
        await prisma.checklistTemplateTask.create({
          data: {
            checklistTemplateId: createdTemplate.id,
            taskTemplateId: createdTaskTemplate.id,
            orderIndex: i,
          },
        });
      }
    }
  }

  console.log('✅ Checklist Templates Seeded Successfully');
}

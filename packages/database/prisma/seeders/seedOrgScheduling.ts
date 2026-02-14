import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';

export interface SchedulingResult {
  scheduleId: string;
}

export async function seedOrgScheduling(
  prisma: PrismaClient,
  users: SeededUsers,
  organizationId: string,
): Promise<SchedulingResult> {
  const now = new Date();

  const schedule = await prisma.workSchedule.upsert({
    where: {
      organizationId_name: { organizationId, name: 'Standard Mon-Fri' },
    },
    update: {
      scheduleType: 'TIME_BASED',
      isDefault: true,
      standardHoursPerDay: '8.00',
      totalWeeklyHours: '40.00',
      effectiveFrom: now,
      effectiveTo: null,
      isActive: true,
    },
    create: {
      organizationId,
      name: 'Standard Mon-Fri',
      scheduleType: 'TIME_BASED',
      isDefault: true,
      standardHoursPerDay: '8.00',
      totalWeeklyHours: '40.00',
      effectiveFrom: now,
      isActive: true,
    },
  });

  for (let day = 0; day <= 6; day += 1) {
    const isWorkingDay = day >= 1 && day <= 5;
    await prisma.workScheduleDay.upsert({
      where: {
        scheduleId_dayOfWeek: { scheduleId: schedule.id, dayOfWeek: day },
      },
      update: {
        hoursPerDay: isWorkingDay ? '8.00' : '0.00',
        startTime: isWorkingDay ? '09:00' : null,
        endTime: isWorkingDay ? '17:00' : null,
        isWorkingDay,
      },
      create: {
        scheduleId: schedule.id,
        dayOfWeek: day,
        hoursPerDay: isWorkingDay ? '8.00' : '0.00',
        startTime: isWorkingDay ? '09:00' : null,
        endTime: isWorkingDay ? '17:00' : null,
        isWorkingDay,
      },
    });
  }

  for (const employee of users.employees) {
    await prisma.userWorkSchedule.upsert({
      where: {
        userId_scheduleId: { userId: employee.id, scheduleId: schedule.id },
      },
      update: {
        assignedBy: users.johnOrgAdmin.id,
        isActive: true,
      },
      create: {
        userId: employee.id,
        scheduleId: schedule.id,
        assignedBy: users.johnOrgAdmin.id,
        isActive: true,
      },
    });
  }

  return { scheduleId: schedule.id };
}

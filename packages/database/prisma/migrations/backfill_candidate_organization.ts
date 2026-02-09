import { PrismaClient } from '../../src/generated/prisma/client';

const prisma = new PrismaClient();

async function backfillCandidateOrganization() {
  console.log('🔄 Backfilling Candidate.organizationId...\n');

  // Get all candidates without organizationId
  const candidates = await prisma.candidate.findMany({
    where: { organizationId: null },
    include: {
      applications: {
        select: {
          organizationId: true,
        },
        take: 1, // Just need one to get the org
      },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    // Try to get organizationId from applications
    if (candidate.applications.length > 0) {
      const organizationId = candidate.applications[0].organizationId;

      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { organizationId },
      });

      updated++;
      console.log(
        `  ✓ Updated candidate ${candidate.email} → org ${organizationId}`,
      );
    } else {
      // Handle orphaned candidates (no applications)
      console.log(
        `  ⚠️  Skipped candidate ${candidate.email} (no applications found)`,
      );
      skipped++;
    }
  }

  // Also handle seeded candidates (Onramp org)
  const onrampOrg = await prisma.organization.findFirst({
    where: { name: 'Onramp' },
  });

  if (onrampOrg) {
    // Update any candidates that should belong to Onramp
    // (e.g., john.doe@example.com from seed)
    const seededCandidates = await prisma.candidate.findMany({
      where: {
        organizationId: null,
        email: 'john.doe@example.com', // From seed
      },
    });

    for (const candidate of seededCandidates) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { organizationId: onrampOrg.id },
      });
      updated++;
      console.log(`  ✓ Updated seeded candidate ${candidate.email} → Onramp`);
    }
  }

  console.log(`\n✅ Backfill complete: ${updated} updated, ${skipped} skipped`);

  // Verify no nulls remain
  const remainingNulls = await prisma.candidate.count({
    where: { organizationId: null },
  });

  if (remainingNulls > 0) {
    console.log(
      `\n⚠️  WARNING: ${remainingNulls} candidates still have null organizationId`,
    );
    console.log('   Please handle these manually before running migration 2.');
  } else {
    console.log('\n✅ All candidates have organizationId assigned');
  }
}

backfillCandidateOrganization()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

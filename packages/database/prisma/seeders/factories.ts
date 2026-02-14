import { faker } from '@faker-js/faker';

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
] as const;

const MARITAL_STATUSES = [
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
] as const;
const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

export function seedId(prefix: string, key: string): string {
  return `${prefix}-${key}`;
}

export function employeeCode(index: number): string {
  return `PORK-${String(index + 1).padStart(4, '0')}`;
}

export function randomDob(): Date {
  return faker.date.birthdate({ mode: 'age', min: 21, max: 62 });
}

export function randomProfileData(fullName: string) {
  const [firstName] = fullName.split(' ');
  return {
    dateOfBirth: randomDob(),
    gender: faker.helpers.arrayElement(GENDERS),
    bio: faker.person.bio(),
    phoneNumber: faker.phone.number(),
    street1: faker.location.streetAddress(),
    street2: faker.helpers.maybe(
      () => `Apt ${faker.number.int({ min: 1, max: 999 })}`,
      {
        probability: 0.3,
      },
    ),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    postalCode: faker.location.zipCode(),
    country: 'US',
    insuranceProvider: faker.company.name(),
    personalTaxId: faker.string.alphanumeric({ length: 9, casing: 'upper' }),
    maritalStatus: faker.helpers.arrayElement(MARITAL_STATUSES),
    socialInsuranceNumber: faker.string.numeric(9),
    emergencyContactName: faker.person.fullName(),
    emergencyContactPhone: faker.phone.number(),
    emergencyContactRelation: faker.helpers.arrayElement([
      'Spouse',
      'Sibling',
      'Parent',
      'Friend',
    ]),
    nationality: 'American',
    profilePictureUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(firstName)}`,
    timezone: faker.helpers.arrayElement(TIMEZONES),
  };
}

export function randomAttendanceWindow(days: number) {
  const rows: Array<{
    date: Date;
    clockIn: Date;
    clockOut: Date;
    overtimeHours: string;
  }> = [];

  for (let offset = 1; offset <= days; offset += 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - offset);

    const day = date.getUTCDay();
    if (day === 0 || day === 6) {
      continue;
    }

    const clockIn = new Date(date);
    clockIn.setUTCHours(9, faker.number.int({ min: 0, max: 20 }), 0, 0);

    const workedMinutes = faker.number.int({ min: 450, max: 570 });
    const clockOut = new Date(clockIn.getTime() + workedMinutes * 60 * 1000);

    const overtime = Math.max(0, (workedMinutes - 480) / 60);

    rows.push({
      date,
      clockIn,
      clockOut,
      overtimeHours: overtime.toFixed(2),
    });
  }

  return rows;
}

export function randomEmploymentType() {
  return faker.helpers.arrayElement([
    'FULLTIME',
    'PARTTIME',
    'CONTRACT',
    'INTERN',
    'FREELANCE',
  ] as const);
}

export function randomDocumentType() {
  return faker.helpers.arrayElement([
    'EMPLOYMENT_CONTRACT',
    'TAX_DOCUMENT',
    'ID_CARD',
    'PROOF_OF_ADDRESS',
    'DEGREE_CERTIFICATE',
  ] as const);
}

import { userProfileResponseSchema } from '../../src/users/user-profile.response';

const validUser = {
  id: '5f1d7e26-9c60-4c6c-b27e-123456789abc',
  userId: '6f2d8e26-9c60-4c6c-b27e-123456789def',
  email: 'alice@example.com',
  department: { id: '5f1d7e26-9c60-4c6c-b27e-123456789abc', name: 'HR' },
  branch: { id: '6f2d8e26-9c60-4c6c-b27e-123456789def', name: 'HQ' },
  role: 'ORG_ADMIN',
  dateOfBirth: '1990-01-01T00:00:00Z',
  gender: 'FEMALE',
  bio: null,
  phoneNumber: null,
  street1: null,
  street2: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  emergencyContactRelation: null,
  nationality: null,
  profilePictureUrl: null,
  createdAt: '2026-02-10T12:00:00Z',
  updatedAt: '2026-02-10T12:00:00Z',
};

describe('userProfileResponseSchema', () => {
  it('accepts valid user', () => {
    expect(() => userProfileResponseSchema.parse(validUser)).not.toThrow();
  });

  it('rejects invalid user', () => {
    const invalidUser = { ...validUser, email: 'not-an-email' };
    expect(() => userProfileResponseSchema.parse(invalidUser)).toThrow();
  });
});

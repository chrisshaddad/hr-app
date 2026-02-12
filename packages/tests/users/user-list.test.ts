import { userListResponseSchema } from '../../contracts/src/users/user-list.response';
import { userProfileResponseSchema } from '../../contracts/src/users/user-profile.response';

const validUser = userProfileResponseSchema.parse({
  id: '5f1d7e26-9c60-4c6c-b27e-123456789abc',
  userId: '6f2d8e26-9c60-4c6c-b27e-123456789def',
  email: 'alice@example.com',
  department: { id: '5f1d7e26-9c60-4c6c-b27e-123456789abc', name: 'HR' },
  branch: { id: '6f2d8e26-9c60-4c6c-b27e-123456789def', name: 'HQ' },
  role: 'SUPER_ADMIN',
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
});

const validList = {
  data: [validUser, validUser],
  pagination: {
    page: 1,
    limit: 10,
    total: 37,
    totalPages: 4,
  },
};

describe('userListResponseSchema', () => {
  it('accepts valid list', () => {
    expect(() => userListResponseSchema.parse(validList)).not.toThrow();
  });

  it('rejects invalid list', () => {
    const invalidList = { data: [], pagination: { page: 1 } }; // missing fields
    expect(() => userListResponseSchema.parse(invalidList)).toThrow();
  });
});

import { userCreateRequestSchema } from '../../contracts/src/users/user-create.request';

describe('userCreateRequestSchema', () => {
  it('should pass with valid data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'strongPass123',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      phone: '+1234567890',
      departmentId: '550e8400-e29b-41d4-a716-446655440000',
      branchId: '550e8400-e29b-41d4-a716-446655440001',
      role: 'USER',
    };

    expect(() => userCreateRequestSchema.parse(validData)).not.toThrow();
  });

  it('should fail if email is invalid', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'strongPass123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
    };

    expect(() => userCreateRequestSchema.parse(invalidData)).toThrow();
  });

  it('should fail if password is too short', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
    };

    expect(() => userCreateRequestSchema.parse(invalidData)).toThrow();
  });

  it('should fail if role is invalid', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'strongPass123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CEO', // not in enum
    };

    expect(() => userCreateRequestSchema.parse(invalidData)).toThrow();
  });

  it('should pass with only required fields', () => {
    const minimalData = {
      email: 'test@example.com',
      password: 'strongPass123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER',
    };

    expect(() => userCreateRequestSchema.parse(minimalData)).not.toThrow();
  });

  it('should fail if departmentId or branchId are invalid UUIDs', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'strongPass123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      departmentId: 'not-a-uuid',
      branchId: '123',
    };

    expect(() => userCreateRequestSchema.parse(invalidData)).toThrow();
  });
});

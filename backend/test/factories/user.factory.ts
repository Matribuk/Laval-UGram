import { v4 as uuidv4 } from 'uuid';
import { User } from '../../src/modules/users/entities/user.entity';

let userCounter = 0;

export const createUserFactory = (overrides: Partial<User> = {}): User => {
  const counter = ++userCounter;
  const user = new User();

  user.id = overrides.id ?? uuidv4();
  user.username = overrides.username ?? `testuser_${counter}`;
  user.email = overrides.email ?? `test_${counter}@example.com`;
  user.passwordHash = overrides.passwordHash ?? '$2b$10$mockHashedPasswordForTesting';
  user.firstName = overrides.firstName ?? 'Test';
  user.lastName = overrides.lastName ?? 'User';
  user.phoneNumber = overrides.phoneNumber ?? (null as unknown as string);
  user.profilePictureUrl = overrides.profilePictureUrl ?? (null as unknown as string);
  user.createdAt = overrides.createdAt ?? new Date();
  user.updatedAt = overrides.updatedAt ?? new Date();

  return user;
};

export const createManyUsers = (count: number, baseOverrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, (_, i) =>
    createUserFactory({
      username: `user_${i + 1}`,
      email: `user_${i + 1}@example.com`,
      ...baseOverrides,
    }),
  );

export const createUserWithPassword = (password: string, overrides: Partial<User> = {}): User => {
  return createUserFactory({
    ...overrides,
    passwordHash: `$2b$10$hashedVersion_${password}`,
  });
};

export const resetUserCounter = (): void => {
  userCounter = 0;
};

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const createUserDtoFactory = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => {
  const counter = ++userCounter;
  return {
    username: overrides.username ?? `newuser_${counter}`,
    email: overrides.email ?? `newuser_${counter}@example.com`,
    password: overrides.password ?? 'SecurePassword123!',
    firstName: overrides.firstName ?? 'New',
    lastName: overrides.lastName ?? 'User',
  };
};

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export const createUpdateUserDtoFactory = (overrides: Partial<UpdateUserDto> = {}): UpdateUserDto => ({
  firstName: overrides.firstName,
  lastName: overrides.lastName,
  email: overrides.email,
  phoneNumber: overrides.phoneNumber,
});

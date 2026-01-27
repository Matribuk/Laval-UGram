import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../auth.service';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { createMockAuthService } from '../../../../test/mocks/services.mock';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    authService = createMockAuthService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      
      const user = createUserFactory();
      authService.validateUser.mockResolvedValue(user);

      
      const result = await strategy.validate('test@example.com', 'password');

      
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when credentials invalid', async () => {
      
      authService.validateUser.mockResolvedValue(null);

      
      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with correct message', async () => {
      
      authService.validateUser.mockResolvedValue(null);

      
      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should call AuthService.validateUser with email and password', async () => {
      
      const user = createUserFactory();
      authService.validateUser.mockResolvedValue(user);

      
      await strategy.validate('specific@example.com', 'specificpassword');

      
      expect(authService.validateUser).toHaveBeenCalledWith(
        'specific@example.com',
        'specificpassword',
      );
    });

    it('should use email as username field', async () => {
      
      const user = createUserFactory({ email: 'email@example.com' });
      authService.validateUser.mockResolvedValue(user);

      
      await strategy.validate('email@example.com', 'password');

      
      expect(authService.validateUser).toHaveBeenCalledWith('email@example.com', 'password');
    });

    it('should return user object from AuthService on success', async () => {
      
      const expectedUser = createUserFactory({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      });
      authService.validateUser.mockResolvedValue(expectedUser);

      
      const result = await strategy.validate('test@example.com', 'password');

      
      expect(result).toEqual(expectedUser);
      expect(result.id).toBe('user-123');
      expect(result.username).toBe('testuser');
    });
  });
});

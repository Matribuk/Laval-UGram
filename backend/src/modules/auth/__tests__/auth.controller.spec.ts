import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { createMockAuthService } from '../../../../test/mocks/services.mock';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    authService = createMockAuthService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'SecurePassword123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should return auth response on successful registration', async () => {

      const expectedResponse = {
        accessToken: 'jwt-token',
        user: { id: 'user-id', username: 'newuser', email: 'new@example.com' },
      };
      authService.register.mockResolvedValue(expectedResponse);
      
      const result = await controller.register(registerDto);

      
      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should delegate registration to AuthService', async () => {
      
      authService.register.mockResolvedValue({
        accessToken: 'token',
        user: createUserFactory(),
      });

      
      await controller.register(registerDto);

      
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should pass all registration fields to service', async () => {
      
      const fullDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      authService.register.mockResolvedValue({
        accessToken: 'token',
        user: createUserFactory(),
      });

      
      await controller.register(fullDto);

      
      expect(authService.register).toHaveBeenCalledWith(fullDto);
    });
  });

  describe('POST /auth/login', () => {
    it('should return auth response on successful login', async () => {
      
      const user = createUserFactory();
      const expectedResponse = {
        accessToken: 'jwt-token',
        user: { id: user.id, username: user.username, email: user.email },
      };
      authService.login.mockResolvedValue(expectedResponse);

      
      const result = await controller.login(user);

      
      expect(result).toEqual(expectedResponse);
    });

    it('should delegate login to AuthService with user from guard', async () => {
      
      const user = createUserFactory();
      authService.login.mockResolvedValue({
        accessToken: 'token',
        user,
      });

      
      await controller.login(user);

      
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should receive user from LocalAuthGuard via @CurrentUser decorator', async () => {
      
      const authenticatedUser = createUserFactory({
        id: 'specific-user-id',
        email: 'specific@example.com',
      });
      authService.login.mockResolvedValue({
        accessToken: 'token',
        user: authenticatedUser,
      });

      
      await controller.login(authenticatedUser);

      
      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'specific-user-id',
          email: 'specific@example.com',
        }),
      );
    });
  });
});

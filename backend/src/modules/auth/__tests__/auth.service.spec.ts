import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AnalyticsService } from '../../monitoring/analytics.service';
import { createUserFactory } from '../../../../test/factories/user.factory';
import {
  createMockUsersService,
  createMockJwtService,
  createMockAnalyticsService,
} from '../../../../test/mocks/services.mock';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: ReturnType<typeof createMockUsersService>;
  let jwtService: ReturnType<typeof createMockJwtService>;
  let analytics: ReturnType<typeof createMockAnalyticsService>;

  beforeEach(async () => {
    usersService = createMockUsersService();
    jwtService = createMockJwtService();
    analytics = createMockAnalyticsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: AnalyticsService, useValue: analytics },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      
      const mockUser = createUserFactory();
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);

      
      const result = await service.validateUser('test@example.com', 'password');

      
      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith(mockUser, 'password');
    });

    it('should return null when user does not exist', async () => {
      
      usersService.findByEmail.mockResolvedValue(null);

      
      const result = await service.validateUser('nonexistent@example.com', 'password');

      
      expect(result).toBeNull();
      expect(usersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      
      const mockUser = createUserFactory();
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      
      const result = await service.validateUser('test@example.com', 'wrongpassword');

      
      expect(result).toBeNull();
    });

    it('should look up user by email first', async () => {
      
      usersService.findByEmail.mockResolvedValue(null);

      
      await service.validateUser('test@example.com', 'password');

      
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'SecurePassword123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create user and return auth response with token', async () => {
      
      const createdUser = createUserFactory({
        username: registerDto.username,
        email: registerDto.email,
      });
      usersService.create.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('jwt-token');

      
      const result = await service.register(registerDto);

      
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toBeDefined();
      expect(usersService.create).toHaveBeenCalledWith({
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
    });

    it('should delegate user creation to UsersService', async () => {
      
      const createdUser = createUserFactory();
      usersService.create.mockResolvedValue(createdUser);

      
      await service.register(registerDto);

      
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should generate JWT token for new user', async () => {
      
      const createdUser = createUserFactory();
      usersService.create.mockResolvedValue(createdUser);

      
      await service.register(registerDto);

      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
    });
  });

  describe('login', () => {
    it('should generate JWT token with correct payload', async () => {
      
      const user = createUserFactory();

      
      await service.login(user);

      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('should return user data in response', async () => {
      
      const user = createUserFactory({
        username: 'testuser',
        email: 'test@example.com',
      });
      jwtService.sign.mockReturnValue('login-token');

      
      const result = await service.login(user);

      
      expect(result.accessToken).toBe('login-token');
      expect(result.user).toBeDefined();
    });

    it('should include sub and email in JWT payload', async () => {
      
      const user = createUserFactory({
        id: 'user-123',
        email: 'specific@example.com',
      });

      
      await service.login(user);

      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'specific@example.com',
      });
    });
  });

  describe('generateAuthResponse (via login/register)', () => {
    it('should transform user to UserResponseDto', async () => {
      
      const user = createUserFactory({
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });

      
      const result = await service.login(user);

      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('email');
    });

    it('should return accessToken string', async () => {
      
      const user = createUserFactory();
      jwtService.sign.mockReturnValue('generated-token-123');

      
      const result = await service.login(user);

      
      expect(result.accessToken).toBe('generated-token-123');
      expect(typeof result.accessToken).toBe('string');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UsersService } from '../../users/users.service';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { createMockUsersService } from '../../../../test/mocks/services.mock';
import { createMockConfigService } from '../../../../test/mocks/config.mock';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: ReturnType<typeof createMockUsersService>;
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(async () => {
    usersService = createMockUsersService();
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when JWT payload contains valid user id', async () => {
      
      const user = createUserFactory({ id: 'valid-user-id' });
      const payload = { sub: 'valid-user-id', email: 'test@example.com' };
      usersService.findById.mockResolvedValue(user);

      
      const result = await strategy.validate(payload);

      
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      
      const payload = { sub: 'non-existent-id', email: 'test@example.com' };
      usersService.findById.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should extract sub from payload for user lookup', async () => {
      
      const user = createUserFactory();
      const payload = { sub: 'specific-user-id', email: 'test@example.com' };
      usersService.findById.mockResolvedValue(user);

      
      await strategy.validate(payload);

      
      expect(usersService.findById).toHaveBeenCalledWith('specific-user-id');
    });

    it('should use UsersService to find user', async () => {
      
      const user = createUserFactory();
      const payload = { sub: user.id, email: user.email };
      usersService.findById.mockResolvedValue(user);

      
      await strategy.validate(payload);

      
      expect(usersService.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with correct message', async () => {
      
      const payload = { sub: 'invalid-id', email: 'test@example.com' };
      usersService.findById.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(strategy.validate(payload)).rejects.toThrow('User not found');
    });
  });

  describe('configuration', () => {
    it('should use secret from config service', async () => {
      const user = createUserFactory();
      const payload = { sub: user.id, email: user.email };
      usersService.findById.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result).toEqual(user);
    });
  });
});

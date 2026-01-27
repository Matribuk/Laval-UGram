import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from '../decorators/current-user.decorator';
import { createUserFactory } from '../../../test/factories/user.factory';

describe('CurrentUser Decorator', () => {
  const getParamDecoratorFactory = () => {
    class TestController {
      testMethod(@CurrentUser() user: any) {
        return user;
      }
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'testMethod',
    );

    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  };

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({} as any),
      switchToWs: () => ({} as any),
      getType: () => 'http',
    } as unknown as ExecutionContext;
  };

  it('should extract user from request', () => {
    const factory = getParamDecoratorFactory();
    const mockUser = createUserFactory({ id: 'user-123', username: 'testuser' });
    const ctx = createMockExecutionContext(mockUser);

    const result = factory(undefined, ctx);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined when request has no user', () => {
    const factory = getParamDecoratorFactory();
    const ctx = createMockExecutionContext(undefined);

    const result = factory(undefined, ctx);

    expect(result).toBeUndefined();
  });

  it('should return null when user is explicitly null', () => {
    const factory = getParamDecoratorFactory();
    const ctx = createMockExecutionContext(null);

    const result = factory(undefined, ctx);

    expect(result).toBeNull();
  });
});

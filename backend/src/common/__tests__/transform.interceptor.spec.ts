import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { Exclude, Expose } from 'class-transformer';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockContext = {} as ExecutionContext;
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should transform response data using classToPlain', (done) => {
      const testData = { name: 'Test', value: 123 };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toEqual(testData);
        done();
      });
    });

    it('should handle null response', (done) => {
      mockCallHandler = {
        handle: () => of(null),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle undefined response', (done) => {
      mockCallHandler = {
        handle: () => of(undefined),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('should handle array response', (done) => {
      const testArray = [{ id: 1 }, { id: 2 }, { id: 3 }];
      mockCallHandler = {
        handle: () => of(testArray),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toEqual(testArray);
        expect(Array.isArray(result)).toBe(true);
        done();
      });
    });

    it('should transform class instance with @Exclude decorator', (done) => {
      class TestClass {
        @Expose()
        name: string;

        @Exclude()
        secret: string;

        constructor() {
          this.name = 'visible';
          this.secret = 'hidden';
        }
      }

      const instance = new TestClass();
      mockCallHandler = {
        handle: () => of(instance),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
        expect(result.name).toBe('visible');
        expect(result.secret).toBeUndefined();
        done();
      });
    });

    it('should handle nested objects', (done) => {
      const nestedData = {
        user: {
          id: 1,
          profile: {
            name: 'Test User',
          },
        },
        meta: {
          total: 10,
        },
      };
      mockCallHandler = {
        handle: () => of(nestedData),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
        expect(result.user.profile.name).toBe('Test User');
        expect(result.meta.total).toBe(10);
        done();
      });
    });

    it('should handle primitive values', (done) => {
      mockCallHandler = {
        handle: () => of('string value'),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toBe('string value');
        done();
      });
    });

    it('should process data through the pipe', (done) => {
      const testData = { processed: true };
      mockCallHandler = {
        handle: () => of(testData),
      };

      const observable = interceptor.intercept(mockContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result).toEqual(testData);
        done();
      });
    });
  });
});

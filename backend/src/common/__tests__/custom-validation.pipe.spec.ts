import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';
import { CustomValidationPipe } from '../pipes/custom-validation.pipe';

class TestDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}

describe('CustomValidationPipe', () => {
  let pipe: CustomValidationPipe;

  beforeEach(() => {
    pipe = new CustomValidationPipe();
  });

  describe('transform', () => {
    it('should validate body parameters', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };
      const validValue = { name: 'John', email: 'john@example.com' };

      const result = await pipe.transform(validValue, metadata);

      expect(result).toBeInstanceOf(TestDto);
      expect(result).toHaveProperty('name', 'John');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should validate query parameters', async () => {
      const metadata: ArgumentMetadata = {
        type: 'query',
        metatype: TestDto,
      };
      const validValue = { name: 'Jane', email: 'jane@example.com' };

      const result = await pipe.transform(validValue, metadata);

      expect(result).toBeInstanceOf(TestDto);
    });

    it('should skip validation for param type', async () => {
      const metadata: ArgumentMetadata = {
        type: 'param',
        metatype: TestDto,
      };
      const value = { invalid: 'data' };

      const result = await pipe.transform(value, metadata);

      expect(result).toEqual(value);
    });

    it('should skip primitive types', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: String,
      };
      const value = 'primitive string';

      const result = await pipe.transform(value, metadata);

      expect(result).toBe('primitive string');
    });

    it('should throw BadRequestException on validation failure', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };
      const invalidValue = { name: 'ab', email: 'not-an-email' };


      await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should format validation errors', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };
      const invalidValue = { name: 'ab', email: 'invalid' };


      try {
        await pipe.transform(invalidValue, metadata);
        fail('Expected BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = (error as BadRequestException).getResponse();
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('error', 'Validation Error');
      }
    });

    it('should return error messages as array', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };
      const invalidValue = { name: 'ab', email: 'invalid' };


      try {
        await pipe.transform(invalidValue, metadata);
        fail('Expected BadRequestException');
      } catch (error) {
        const response = (error as BadRequestException).getResponse() as any;
        expect(Array.isArray(response.message)).toBe(true);
      }
    });
  });

  describe('shouldValidate', () => {
    it('should return false for null values', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const result = await pipe.transform(null, metadata);

      expect(result).toBeNull();
    });

    it('should return false for undefined values', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const result = await pipe.transform(undefined, metadata);

      expect(result).toBeUndefined();
    });

    it('should return false for non-body/query types', async () => {
      const metadata: ArgumentMetadata = {
        type: 'custom' as any,
        metatype: TestDto,
      };
      const value = { invalid: 'data' };

      const result = await pipe.transform(value, metadata);

      expect(result).toEqual(value);
    });

    it('should return false when metatype is undefined', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: undefined,
      };
      const value = { any: 'data' };

      const result = await pipe.transform(value, metadata);

      expect(result).toEqual(value);
    });

    it('should skip Number metatype', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: Number,
      };
      const value = 42;

      const result = await pipe.transform(value, metadata);

      expect(result).toBe(42);
    });

    it('should skip Boolean metatype', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: Boolean,
      };
      const value = true;

      const result = await pipe.transform(value, metadata);

      expect(result).toBe(true);
    });

    it('should skip Array metatype', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: Array,
      };
      const value = [1, 2, 3];

      const result = await pipe.transform(value, metadata);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should skip Object metatype', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: Object,
      };
      const value = { key: 'value' };

      const result = await pipe.transform(value, metadata);

      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('whitelist and forbidNonWhitelisted', () => {
    it('should strip non-whitelisted properties', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };
      const valueWithExtra = {
        name: 'Valid',
        email: 'valid@example.com',
        extraField: 'should be removed',
      };

      await expect(pipe.transform(valueWithExtra, metadata)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

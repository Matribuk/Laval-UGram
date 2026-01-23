import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type Metatype = new (...args: unknown[]) => unknown;

const PRIMITIVE_TYPES: Metatype[] = [String, Boolean, Number, Array, Object];
const VALIDATABLE_PARAM_TYPES = ['body', 'query'];

@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (!this.shouldValidate(value, metadata)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype!, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: formattedErrors,
        error: 'Validation Error',
      });
    }

    return object;
  }

  private shouldValidate(value: unknown, { metatype, type }: ArgumentMetadata): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (!VALIDATABLE_PARAM_TYPES.includes(type)) {
      return false;
    }

    if (!metatype || PRIMITIVE_TYPES.includes(metatype as Metatype)) {
      return false;
    }

    return true;
  }

  private formatErrors(errors: ValidationError[]): string[] {
    return errors.map((error) => {
      const constraints = error.constraints;
      return constraints ? Object.values(constraints).join(', ') : '';
    });
  }
}

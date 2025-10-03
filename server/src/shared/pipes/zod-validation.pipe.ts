import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Validation pipe using Zod schemas
 * Provides type-safe validation for DTOs
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodType) { }

    transform(value: any) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: error.errors || error.message,
            });
        }
    }
}

/**
 * Zod Validation Middleware - Validate request body, query, and params
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation target type
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Format Zod error messages for user-friendly display
 */
function formatZodError(error: ZodError): any {
  const formattedErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return {
    error: 'Validation failed',
    details: formattedErrors,
    _raw: error.errors // Include raw errors for debugging
  };
}

/**
 * Create validation middleware for request body
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse request body
      const validated = await schema.parseAsync(req.body);

      // Replace request body with validated data
      req.body = validated;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      // Unexpected error
      console.error('Unexpected validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Create validation middleware for query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse query parameters
      const validated = await schema.parseAsync(req.query);

      // Replace query with validated data
      req.query = validated as any;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      console.error('Unexpected validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Create validation middleware for route parameters
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse route parameters
      const validated = await schema.parseAsync(req.params);

      // Replace params with validated data
      req.params = validated as any;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      console.error('Unexpected validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Generic validation middleware that can validate multiple targets
 */
export function validate<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;

      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          throw new Error(`Invalid validation target: ${target}`);
      }

      // Validate and parse data
      const validated = await schema.parseAsync(dataToValidate);

      // Replace data with validated version
      switch (target) {
        case 'body':
          req.body = validated;
          break;
        case 'query':
          req.query = validated as any;
          break;
        case 'params':
          req.params = validated as any;
          break;
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      console.error('Unexpected validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Combine multiple validation middlewares
 */
export function validateAll(validations: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}) {
  const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  if (validations.body) {
    middlewares.push(validateBody(validations.body));
  }

  if (validations.query) {
    middlewares.push(validateQuery(validations.query));
  }

  if (validations.params) {
    middlewares.push(validateParams(validations.params));
  }

  return middlewares;
}

/**
 * Safe validation - returns validation result without throwing
 */
export async function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: ZodError }> {
  const result = await schema.safeParseAsync(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Partial validation - allows partial data (useful for updates)
 */
export function validatePartial<T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') {
  // Convert schema to partial (all fields optional)
  // Type assertion needed because not all Zod schemas have .partial()
  const partialSchema = (schema as any).partial();
  return validate(partialSchema, target);
}

// Export commonly used validators
export { z } from 'zod';

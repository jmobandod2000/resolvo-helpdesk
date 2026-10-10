import { BadRequestException } from '@nestjs/common';
import { getMetadataStorage, ValidationError } from 'class-validator';

import { i18nMessage } from './i18n';

export interface ValidationIssue {
  property: string;
  constraint: string;
  args: string[];
}

const constraintArgs = (
  target: object | undefined,
  property: string,
  constraint: string,
): string[] => {
  if (!target) return [];
  const metadata = getMetadataStorage()
    .getTargetValidationMetadatas(target.constructor, '', true, false)
    .find((item) => item.propertyName === property && item.name === constraint);
  return (metadata?.constraints ?? [])
    .filter((value) => typeof value === 'number' || typeof value === 'string')
    .map(String);
};

const collectIssues = (errors: ValidationError[]): ValidationIssue[] =>
  errors.flatMap((error) => [
    ...Object.keys(error.constraints ?? {}).map((constraint) => ({
      property: error.property,
      constraint,
      args: constraintArgs(error.target, error.property, constraint),
    })),
    ...collectIssues(error.children ?? []),
  ]);

export const validationExceptionFactory = (errors: ValidationError[]) =>
  new BadRequestException({
    ...i18nMessage('errors.validation'),
    issues: collectIssues(errors),
  });

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
  AppLanguage,
  hasTranslation,
  isTranslatableMessage,
  resolveLanguage,
  translate,
} from './i18n';
import { ValidationIssue } from './validation-exception.factory';

const translateIssue = (
  language: AppLanguage,
  { property, constraint, args }: ValidationIssue,
) => {
  const fieldKey = `fields.${property}`;
  const field = hasTranslation(language, fieldKey)
    ? translate(language, fieldKey)
    : property;

  const messageKey =
    property === 'password' && constraint === 'matches'
      ? 'validation.passwordFormat'
      : hasTranslation(language, `validation.${constraint}`)
        ? `validation.${constraint}`
        : 'validation.default';

  const positional = Object.fromEntries(
    args.map((value, index) => [String(index), value]),
  );
  return translate(language, messageKey, { field, ...positional });
};

const buildMessage = (
  body: string | object,
  language: AppLanguage,
): string | string[] => {
  if (typeof body === 'string') return body;

  if (isTranslatableMessage(body)) {
    const { issues } = body as { issues?: ValidationIssue[] };
    return issues?.length
      ? issues.map((issue) => translateIssue(language, issue))
      : translate(language, body.key, body.args);
  }

  const { message } = body as { message?: unknown };
  if (isTranslatableMessage(message))
    return translate(language, message.key, message.args);
  if (typeof message === 'string' || Array.isArray(message))
    return message as string | string[];
  return translate(language, 'errors.unexpected');
};

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const language = resolveLanguage(
      request.headers['x-lang'],
      request.headers['accept-language'],
    );
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: buildMessage(exception.getResponse(), language),
      error: HttpStatus[status],
    });
  }
}

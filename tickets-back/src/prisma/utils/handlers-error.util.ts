import { Prisma } from '@prisma/client';

import { i18nMessage, TranslatableMessage } from '../../i18n';

interface DbErrorResponse {
  status: number;
  message: TranslatableMessage;
}

const handleKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): DbErrorResponse => {
  switch (error.code) {
    case 'P2002':
      return {
        status: 409,
        message: i18nMessage('errors.db.duplicate', {
          fields: String(error.meta?.target ?? ''),
        }),
      };
    case 'P2003':
      return { status: 400, message: i18nMessage('errors.db.foreignKey') };
    case 'P2025':
      return { status: 404, message: i18nMessage('errors.db.recordNotFound') };
    default:
      return { status: 500, message: i18nMessage('errors.db.unknown') };
  }
};

const handlersDbError = (error: unknown): DbErrorResponse => {
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return handleKnownRequestError(error);

  if (error instanceof Prisma.PrismaClientInitializationError)
    return { status: 500, message: i18nMessage('errors.db.connection') };

  if (error instanceof Prisma.PrismaClientRustPanicError)
    return { status: 500, message: i18nMessage('errors.db.critical') };

  return { status: 500, message: i18nMessage('errors.unexpected') };
};

export default handlersDbError;

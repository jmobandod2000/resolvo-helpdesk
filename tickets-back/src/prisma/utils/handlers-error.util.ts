import { Prisma } from '@prisma/client';

interface DbErrorResponse {
  status: number;
  message: string;
}

const handleKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): DbErrorResponse => {
  switch (error.code) {
    case 'P2002':
      return {
        status: 409,
        message: `Duplicate entry, unique constraint failed on field(s): ${error.meta?.target}`,
      };
    case 'P2003':
      return { status: 400, message: 'Foreign key constraint failed.' };
    case 'P2025':
      return { status: 404, message: 'Record not found.' };
    default:
      return { status: 500, message: 'An unknown database error occurred.' };
  }
};

const handlersDbError = (error: unknown): DbErrorResponse => {
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return handleKnownRequestError(error);

  if (error instanceof Prisma.PrismaClientInitializationError)
    return {
      status: 500,
      message: 'Failed to initialize the database connection.',
    };

  if (error instanceof Prisma.PrismaClientRustPanicError)
    return {
      status: 500,
      message: 'A critical error occurred in the database engine.',
    };

  return { status: 500, message: 'An unexpected error occurred.' };
};

export default handlersDbError;

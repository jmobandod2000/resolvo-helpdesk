import { Prisma } from '@prisma/client';

import { FilterTicketDto } from '../dtos';
import { OPEN_STATUSES } from '../interfaces';

const buildSearchFilter = (search: string): Prisma.TicketWhereInput => {
  const term = search.trim();
  return {
    OR: [
      { code: { contains: term, mode: 'insensitive' } },
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { requesterName: { contains: term, mode: 'insensitive' } },
      { productCodes: { has: term } },
      { documents: { has: term } },
    ],
  };
};

const buildStatusFilter = ({
  status,
  onlyOpen,
}: FilterTicketDto): Prisma.TicketWhereInput => {
  if (status?.length) return { status: { in: status } };
  if (onlyOpen) return { status: { in: OPEN_STATUSES } };
  return {};
};

export const buildTicketWhere = (
  filter: FilterTicketDto,
): Prisma.TicketWhereInput => {
  const {
    company,
    category,
    priority,
    rootCause,
    assigneeId,
    search,
    from,
    to,
  } = filter;

  return {
    isDeleted: false,
    ...buildStatusFilter(filter),
    ...(company && { company }),
    ...(category && { category }),
    ...(priority && { priority }),
    ...(rootCause && { rootCause }),
    ...(assigneeId && { assigneeId }),
    ...((from || to) && {
      reportedAt: { ...(from && { gte: from }), ...(to && { lte: to }) },
    }),
    ...(search?.trim() && buildSearchFilter(search)),
  };
};

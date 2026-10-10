import { BadRequestException } from '@nestjs/common';
import { Prisma, Ticket, TicketStatus } from '@prisma/client';

import { ChangeStatusDto } from '../dtos';
import { DONE_STATUSES } from '../interfaces';

const isReopening = (from: TicketStatus, to: TicketStatus) =>
  (DONE_STATUSES.includes(from) || from === TicketStatus.CANCELLED) &&
  !DONE_STATUSES.includes(to) &&
  to !== TicketStatus.CANCELLED;

const assertClosable = (ticket: Ticket, dto: ChangeStatusDto) => {
  const closureComment = dto.closureComment ?? ticket.closureComment;
  const rootCause = dto.rootCause ?? ticket.rootCause;

  if (!closureComment?.trim())
    throw new BadRequestException(
      'Para cerrar el ticket se requiere el comentario de cierre',
    );
  if (!rootCause)
    throw new BadRequestException(
      'Para cerrar el ticket se requiere la causa raíz',
    );
};

export const buildStatusChangeData = (
  ticket: Ticket,
  dto: ChangeStatusDto,
  now = new Date(),
): Prisma.TicketUpdateInput => {
  const { status: to } = dto;
  const from = ticket.status;

  if (from === to)
    throw new BadRequestException(`El ticket ya está en estado ${to}`);

  if (to === TicketStatus.CLOSED) assertClosable(ticket, dto);

  const data: Prisma.TicketUpdateInput = {
    status: to,
    ...(dto.rootCause && { rootCause: dto.rootCause }),
    ...(dto.closureComment && { closureComment: dto.closureComment }),
  };

  if (!ticket.firstResponseAt && to !== TicketStatus.OPEN)
    data.firstResponseAt = now;

  if (to === TicketStatus.RESOLVED) data.resolvedAt = now;

  if (to === TicketStatus.CLOSED) {
    data.closedAt = now;
    if (!ticket.resolvedAt) data.resolvedAt = now;
  }

  if (isReopening(from, to)) {
    data.resolvedAt = null;
    data.closedAt = null;
  }

  return data;
};

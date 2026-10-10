import {
  RootCause,
  TicketCategory,
  TicketChannel,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';

export interface HistoricalTicket {
  title: string;
  description: string;
  requesterName: string;
  requesterArea?: string;
  siteCode?: string | null;
  channel: TicketChannel;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  rootCause?: RootCause;
  productCodes: string[];
  documents: string[];
  affectedUnits?: number;
  diagnosis: string;
  closureComment?: string;
  devRequestRef?: string;
  evidencePaths: string[];
  reportedAt: string;
  firstResponseAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

/*
  Tickets de ejemplo (datos ficticios) para poblar una base nueva.
  Para cargar tickets reales, cree prisma/data/historical-tickets.local.ts con la misma
  estructura: el seed lo usa en lugar de este archivo y git lo ignora.
*/
export interface HistoricalSite {
  code: string;
  name: string;
}

export const HISTORICAL_SITES: HistoricalSite[] = [
  { code: 'A', name: 'Sede A' },
  { code: 'B', name: 'Sede B' },
];

export const HISTORICAL_TICKETS: HistoricalTicket[] = [
  {
    title:
      'Producto de ejemplo: el reporte de movimientos no coincide con la existencia',
    description:
      'El reporte de movimientos por artículo muestra un saldo menor al de la consulta de inventario.',
    requesterName: 'Inventario Sede A',
    siteCode: 'A',
    channel: TicketChannel.WHATSAPP,
    category: TicketCategory.REPORTS,
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    rootCause: RootCause.SYSTEM_DEFECT,
    productCodes: ['000001'],
    documents: ['DOC-0001'],
    affectedUnits: 10,
    diagnosis:
      'Una recepción quedó sin movimiento de entrada. Se registró la entrada faltante y el reporte quedó igual a la existencia.',
    closureComment:
      'Entrada faltante registrada; reporte y existencia coinciden.',
    evidencePaths: [],
    reportedAt: '2026-01-05T09:00:00-04:00',
    firstResponseAt: '2026-01-05T10:00:00-04:00',
    resolvedAt: '2026-01-06T15:00:00-04:00',
  },
  {
    title: 'Producto de ejemplo: existencia en sistema mayor al conteo físico',
    description:
      'El conteo físico da menos unidades de las que muestra el sistema.',
    requesterName: 'Inventario Sede B',
    siteCode: 'B',
    channel: TicketChannel.EMAIL,
    category: TicketCategory.INVENTORY,
    priority: TicketPriority.HIGH,
    status: TicketStatus.WAITING_INFO,
    rootCause: RootCause.OPERATIONAL_ERROR,
    productCodes: ['000002'],
    documents: [],
    affectedUnits: 5,
    diagnosis:
      'Las unidades faltantes se trasladaron a una ubicación de búsqueda y no aparecieron. Pendiente de confirmación de Inventario para darles salida.',
    evidencePaths: [],
    reportedAt: '2026-01-10T08:30:00-04:00',
    firstResponseAt: '2026-01-10T09:15:00-04:00',
  },
];

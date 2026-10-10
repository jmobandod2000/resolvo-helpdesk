import {
  PrismaClient,
  RootCause,
  TicketChannel,
  TicketEventType,
  TicketPriority,
  TicketStatus,
  UserRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const TICKET_COUNT = 60;
const HISTORY_DAYS = 90;

let seed = 20261010;
const random = () => {
  seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
  return seed / 2_147_483_648;
};
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]!;
const weighted = <T>(entries: readonly [T, number][]): T => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[0]![0];
};
const between = (min: number, max: number) => min + random() * (max - min);

const SITES = [
  { code: '01', name: 'Sede Central' },
  { code: '02', name: 'Sucursal Norte' },
  { code: '03', name: 'Centro de Distribución' },
];

const CATEGORIES = [
  {
    name: 'Hardware y equipos',
    description: 'Computadoras, monitores, periféricos y otros equipos',
  },
  {
    name: 'Software y aplicaciones',
    description: 'Instalación, errores y actualizaciones de programas',
  },
  {
    name: 'Red e internet',
    description: 'Conectividad, wifi, VPN y caídas del servicio',
  },
  {
    name: 'Accesos y cuentas',
    description: 'Usuarios, contraseñas y permisos',
  },
  {
    name: 'Correo y comunicaciones',
    description: 'Correo electrónico, telefonía y mensajería',
  },
  { name: 'Impresoras', description: 'Impresión, escaneo y consumibles' },
  {
    name: 'Sistemas de la empresa',
    description: 'ERP, inventario, facturación y otros sistemas de gestión',
  },
];

const ANALYSTS = [
  { name: 'Ana Pérez', email: 'ana.perez@demo.local' },
  { name: 'Luis Gómez', email: 'luis.gomez@demo.local' },
  { name: 'María Rodríguez', email: 'maria.rodriguez@demo.local' },
];

const REQUESTERS = [
  ['Carla Méndez', 'Contabilidad'],
  ['Jorge Salas', 'Ventas'],
  ['Patricia Ruiz', 'Recursos Humanos'],
  ['Andrés Castillo', 'Almacén'],
  ['Lucía Herrera', 'Compras'],
  ['Diego Torres', 'Atención al cliente'],
  ['Valentina Rojas', 'Gerencia'],
  ['Ricardo Peña', 'Logística'],
  ['Sofía Navarro', 'Facturación'],
  ['Miguel Ortega', 'Mantenimiento'],
] as const;

const TEMPLATES: { category: number; title: string; description: string }[] = [
  {
    category: 0,
    title: 'La computadora no enciende',
    description:
      'Al presionar el botón de encendido no pasa nada. Ayer funcionaba normal.',
  },
  {
    category: 0,
    title: 'El monitor parpadea constantemente',
    description:
      'La pantalla parpadea cada pocos segundos y molesta para trabajar.',
  },
  {
    category: 0,
    title: 'Teclado con teclas que no responden',
    description: 'Varias teclas (A, S, Enter) no funcionan desde esta mañana.',
  },
  {
    category: 1,
    title: 'Excel se cierra al abrir archivos grandes',
    description:
      'Cada vez que abro el reporte mensual, Excel se cierra sin mensaje.',
  },
  {
    category: 1,
    title: 'Solicito instalar lector de PDF',
    description: 'Necesito un programa para firmar documentos PDF.',
  },
  {
    category: 1,
    title: 'Error al actualizar el antivirus',
    description: 'El antivirus muestra un aviso de actualización fallida.',
  },
  {
    category: 2,
    title: 'Sin internet en el área de ventas',
    description:
      'Desde las 9 a. m. ninguna computadora del área tiene internet.',
  },
  {
    category: 2,
    title: 'La VPN se desconecta cada pocos minutos',
    description:
      'Trabajando desde casa, la VPN se cae y pierdo lo que estaba haciendo.',
  },
  {
    category: 2,
    title: 'Wifi lento en la sala de reuniones',
    description:
      'Las videollamadas se cortan en la sala de reuniones del segundo piso.',
  },
  {
    category: 3,
    title: 'Olvidé mi contraseña del sistema',
    description: 'No recuerdo la contraseña y el sistema bloqueó mi usuario.',
  },
  {
    category: 3,
    title: 'Acceso a carpeta compartida de Finanzas',
    description:
      'Necesito permiso de lectura en la carpeta compartida de Finanzas.',
  },
  {
    category: 3,
    title: 'Alta de usuario para personal nuevo',
    description:
      'Ingresa una persona nueva el lunes al área; necesita correo y usuario.',
  },
  {
    category: 4,
    title: 'No llegan correos externos',
    description:
      'Los clientes dicen que me escriben, pero no recibo sus correos.',
  },
  {
    category: 4,
    title: 'Buzón de correo lleno',
    description: 'El correo dice que el buzón está lleno y no puedo enviar.',
  },
  {
    category: 4,
    title: 'Teléfono IP sin tono',
    description: 'El teléfono de mi puesto no tiene tono desde ayer.',
  },
  {
    category: 5,
    title: 'La impresora de caja no imprime',
    description: 'La impresora muestra una luz roja y no imprime las facturas.',
  },
  {
    category: 5,
    title: 'Atasco de papel recurrente',
    description: 'La multifuncional del pasillo se atasca con cada impresión.',
  },
  {
    category: 5,
    title: 'Solicito tóner para impresora de oficina',
    description:
      'La impresora indica tóner bajo y las impresiones salen claras.',
  },
  {
    category: 6,
    title: 'El sistema de facturación no emite',
    description:
      'Al emitir una factura aparece un error de conexión con el servidor.',
  },
  {
    category: 6,
    title: 'Existencia del sistema no coincide con el conteo',
    description: 'El conteo físico da 15 unidades y el sistema muestra 39.',
  },
  {
    category: 6,
    title: 'Reporte de ventas sale vacío',
    description:
      'El reporte de ventas del mes no muestra datos aunque hubo ventas.',
  },
];

const PUBLIC_QUESTIONS = [
  '¿Puedes indicarnos el mensaje exacto que aparece en pantalla?',
  '¿Desde qué equipo o ubicación ocurre? Nos ayuda para revisarlo.',
  '¿Le pasa a alguien más de tu área?',
];
const REQUESTER_ANSWERS = [
  'Aparece "Error de conexión con el servidor".',
  'Desde la computadora de la recepción.',
  'Sí, a mis dos compañeros también.',
];
const INTERNAL_NOTES = [
  'Revisado el registro de eventos; se identifica la causa.',
  'Se reinició el servicio y se monitorea por una hora.',
  'Se coordina visita al puesto para revisar el equipo.',
  'Se escaló al proveedor con la evidencia del error.',
];
const CLOSURE_COMMENTS = [
  'Se corrigió la configuración y se verificó con el usuario. Si vuelve a ocurrir, reporta un nuevo ticket.',
  'Se reemplazó la pieza dañada y el equipo quedó funcionando.',
  'Se restableció el acceso y se explicó al usuario cómo cambiar su contraseña.',
  'El proveedor aplicó la corrección; se confirmó que el servicio funciona.',
];

const buildCode = (id: number) => `TK-${String(id).padStart(5, '0')}`;

const assertDemoDatabase = () => {
  const url = process.env.DATABASE_URL ?? '';
  const database = new URL(url).pathname.replace(/^\//, '');
  if (!/demo/i.test(database))
    throw new Error(
      `Base "${database}": el seed de demostración solo corre en bases cuyo nombre contiene "demo".`,
    );
};

const workingHour = (date: Date) => {
  const value = new Date(date);
  value.setHours(Math.floor(between(8, 17)), Math.floor(between(0, 59)), 0, 0);
  return value;
};

const main = async () => {
  assertDemoDatabase();
  if ((await prisma.ticket.count()) > 0) {
    console.log('La base de demostración ya tiene tickets; no se modifica.');
    return;
  }

  const password = await argon2.hash(process.env.LOGIN_PASSWORD ?? 'Demo12345');
  const admin = await prisma.user.upsert({
    where: {
      email: (process.env.LOGIN_EMAIL ?? 'admin@demo.local').toLowerCase(),
    },
    update: {},
    create: {
      name: process.env.LOGIN_NAME ?? 'Administrador',
      email: (process.env.LOGIN_EMAIL ?? 'admin@demo.local').toLowerCase(),
      password,
      roles: UserRole.admin,
    },
  });
  const analysts = [admin];
  for (const analyst of ANALYSTS)
    analysts.push(
      await prisma.user.upsert({
        where: { email: analyst.email },
        update: {},
        create: { ...analyst, password, roles: UserRole.user },
      }),
    );
  const portalUser = await prisma.user.upsert({
    where: { email: 'portal@system.resolvo' },
    update: {},
    create: {
      name: 'Portal',
      email: 'portal@system.resolvo',
      password: await argon2.hash(randomBytes(32).toString('hex')),
      isActive: false,
      isSystem: true,
    },
  });

  await prisma.organization.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Demo Corp',
      email: 'soporte@demo.local',
      phone: '+58 212 555 0100',
      website: 'https://demo.local',
      portalEnabled: true,
      portalMessage:
        'Cuéntanos qué pasó. Atendemos de lunes a viernes de 8:00 a 17:00.',
    },
  });

  const sites = [];
  for (const site of SITES)
    sites.push(await prisma.site.create({ data: site }));
  const categories = [];
  for (const category of CATEGORIES)
    categories.push(await prisma.category.create({ data: category }));

  const now = Date.now();
  const plans = Array.from({ length: TICKET_COUNT }, () => {
    const ageDays = Math.pow(random(), 1.4) * HISTORY_DAYS;
    return {
      reportedAt: workingHour(new Date(now - ageDays * DAY_MS)),
      ageDays,
    };
  }).sort((a, b) => a.reportedAt.getTime() - b.reportedAt.getTime());

  for (const { reportedAt, ageDays } of plans) {
    const template = pick(TEMPLATES);
    const [requesterName, requesterArea] = pick(REQUESTERS);
    const channel = weighted<TicketChannel>([
      [TicketChannel.PORTAL, 4],
      [TicketChannel.WHATSAPP, 3],
      [TicketChannel.EMAIL, 2],
      [TicketChannel.CALL, 1],
      [TicketChannel.IN_PERSON, 1],
    ]);
    const priority = weighted<TicketPriority>([
      [TicketPriority.LOW, 2],
      [TicketPriority.MEDIUM, 5],
      [TicketPriority.HIGH, 2],
      [TicketPriority.CRITICAL, 0.5],
    ]);
    const status: TicketStatus =
      ageDays > 14
        ? weighted([
            [TicketStatus.CLOSED, 8],
            [TicketStatus.RESOLVED, 1],
            [TicketStatus.CANCELLED, 0.5],
            [TicketStatus.ESCALATED_DEV, 0.5],
          ])
        : ageDays > 3
          ? weighted([
              [TicketStatus.CLOSED, 3],
              [TicketStatus.RESOLVED, 2],
              [TicketStatus.IN_ANALYSIS, 2],
              [TicketStatus.WAITING_INFO, 1],
              [TicketStatus.ESCALATED_DEV, 1],
            ])
          : weighted([
              [TicketStatus.OPEN, 3],
              [TicketStatus.IN_ANALYSIS, 3],
              [TicketStatus.WAITING_INFO, 1],
              [TicketStatus.RESOLVED, 1],
            ]);

    const assignee =
      status === TicketStatus.OPEN && random() < 0.6 ? null : pick(analysts);
    const firstResponseAt =
      status === TicketStatus.OPEN
        ? null
        : new Date(reportedAt.getTime() + between(0.2, 6) * HOUR_MS);
    const isDone =
      status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED;
    const maxResolution = Math.max(1, Math.min(ageDays * 24 - 1, 120));
    const resolvedAt = isDone
      ? new Date(reportedAt.getTime() + between(1, maxResolution) * HOUR_MS)
      : null;
    const closedAt =
      status === TicketStatus.CLOSED && resolvedAt
        ? new Date(
            Math.min(
              resolvedAt.getTime() + between(0.5, 24) * HOUR_MS,
              now - HOUR_MS,
            ),
          )
        : null;
    const isPortal = channel === TicketChannel.PORTAL;
    const actor = assignee ?? admin;
    const creatorId = isPortal ? portalUser.id : actor.id;

    const events: {
      type: TicketEventType;
      fromStatus?: TicketStatus;
      toStatus?: TicketStatus;
      note?: string;
      isPublic?: boolean;
      authorName?: string;
      userId: number;
      createdAt: Date;
    }[] = [
      {
        type: TicketEventType.CREATED,
        toStatus: TicketStatus.OPEN,
        userId: creatorId,
        authorName: isPortal ? requesterName : undefined,
        createdAt: reportedAt,
      },
    ];

    let current: TicketStatus = TicketStatus.OPEN;
    const move = (to: TicketStatus, at: Date, note?: string) => {
      events.push({
        type: TicketEventType.STATUS_CHANGED,
        fromStatus: current,
        toStatus: to,
        note,
        userId: actor.id,
        createdAt: at,
      });
      current = to;
    };

    if (firstResponseAt && assignee) {
      events.push({
        type: TicketEventType.ASSIGNED,
        note: assignee.name,
        userId: actor.id,
        createdAt: firstResponseAt,
      });
      move(TicketStatus.IN_ANALYSIS, firstResponseAt);
      events.push({
        type: TicketEventType.NOTE,
        note: pick(INTERNAL_NOTES),
        userId: actor.id,
        createdAt: new Date(firstResponseAt.getTime() + 0.3 * HOUR_MS),
      });
    }

    const askedAt = firstResponseAt
      ? new Date(firstResponseAt.getTime() + 0.5 * HOUR_MS)
      : null;
    if (
      askedAt &&
      (status === TicketStatus.WAITING_INFO || (isPortal && random() < 0.5))
    ) {
      const index = Math.floor(random() * PUBLIC_QUESTIONS.length);
      events.push({
        type: TicketEventType.NOTE,
        note: PUBLIC_QUESTIONS[index],
        isPublic: true,
        userId: actor.id,
        createdAt: askedAt,
      });
      move(TicketStatus.WAITING_INFO, askedAt);
      if (status !== TicketStatus.WAITING_INFO) {
        const answeredAt = new Date(
          askedAt.getTime() + between(0.3, 4) * HOUR_MS,
        );
        events.push({
          type: TicketEventType.NOTE,
          note: REQUESTER_ANSWERS[index],
          isPublic: true,
          authorName: requesterName,
          userId: portalUser.id,
          createdAt: answeredAt,
        });
        events.push({
          type: TicketEventType.STATUS_CHANGED,
          fromStatus: TicketStatus.WAITING_INFO,
          toStatus: TicketStatus.IN_ANALYSIS,
          authorName: requesterName,
          userId: portalUser.id,
          createdAt: answeredAt,
        });
        current = TicketStatus.IN_ANALYSIS;
      }
    }

    if (status === TicketStatus.ESCALATED_DEV && firstResponseAt)
      move(
        TicketStatus.ESCALATED_DEV,
        new Date(firstResponseAt.getTime() + 2 * HOUR_MS),
        'Escalado al proveedor del sistema',
      );
    if (status === TicketStatus.CANCELLED)
      move(
        TicketStatus.CANCELLED,
        new Date(reportedAt.getTime() + 3 * HOUR_MS),
        'Duplicado de otra solicitud',
      );
    const closureComment = isDone ? pick(CLOSURE_COMMENTS) : null;
    if (resolvedAt) {
      events.push({
        type: TicketEventType.NOTE,
        note: 'Listo, ya quedó solucionado. Cualquier cosa nos avisas.',
        isPublic: true,
        userId: actor.id,
        createdAt: resolvedAt,
      });
      move(TicketStatus.RESOLVED, resolvedAt);
    }
    if (closedAt) move(TicketStatus.CLOSED, closedAt);

    const ticket = await prisma.ticket.create({
      data: {
        title: template.title,
        description: template.description,
        requesterName,
        requesterArea,
        requesterEmail: `${requesterName.split(' ')[0]!.toLowerCase()}@demo.local`,
        channel,
        priority,
        status,
        siteId: random() < 0.85 ? pick(sites).id : null,
        categoryId: categories[template.category]!.id,
        assigneeId: assignee?.id ?? null,
        createdById: creatorId,
        reportedAt,
        createdAt: reportedAt,
        firstResponseAt,
        resolvedAt,
        closedAt,
        rootCause: isDone ? pick(Object.values(RootCause)) : null,
        closureComment,
        diagnosis: firstResponseAt ? pick(INTERNAL_NOTES) : null,
        publicToken: isPortal ? randomBytes(32).toString('base64url') : null,
        Events: {
          create: events.map((event) => ({
            ...event,
            isPublic: event.isPublic ?? false,
          })),
        },
      },
    });
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { code: buildCode(ticket.id) },
    });
  }

  console.log(
    `Demostración lista: ${TICKET_COUNT} tickets, ${SITES.length} sedes, ${CATEGORIES.length} categorías, ${ANALYSTS.length + 1} analistas.`,
  );
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

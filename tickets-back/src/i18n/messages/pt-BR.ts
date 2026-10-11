import type { MessageSchema } from '../i18n';

const messages: MessageSchema = {
  errors: {
    ticketNotFound: 'Ticket {term} não encontrado',
    userNotFound: 'Usuário {id} não encontrado',
    invalidCredentials: 'E-mail ou senha inválidos',
    userInactive: 'O usuário não está ativo',
    notLoggedIn: 'Nenhuma sessão iniciada',
    forbiddenRole: 'O usuário {name} não tem o perfil necessário: {roles}',
    userNotInRequest: 'Usuário não encontrado na solicitação',
    closureCommentRequired:
      'Para encerrar o ticket é necessário o comentário de encerramento',
    rootCauseRequired: 'Para encerrar o ticket é necessária a causa raiz',
    sameStatus: 'O ticket já está no status {status}',
    validation: 'Os dados enviados não são válidos',
    reportInvalidRange:
      'A data inicial deve ser anterior ou igual à data final',
    reportRangeTooLong: 'O período do relatório não pode passar de {days} dias',
    reportInvalidTimeZone: 'O fuso horário {timeZone} não é válido',
    siteNotFound: 'A unidade {id} não foi encontrada',
    siteInactive: 'A unidade {name} está inativa',
    siteDuplicate: 'Já existe uma unidade chamada {name}',
    categoryNotFound: 'A categoria {id} não foi encontrada',
    categoryInactive: 'A categoria {name} está inativa',
    categoryDuplicate: 'Já existe uma categoria chamada {name}',
    tooManyRequests:
      'Muitas tentativas. Aguarde alguns minutos e tente novamente',
    organizationMissing: 'Primeiro preencha os dados da empresa',
    portalDisabled: 'O portal de solicitações não está disponível',
    portalRejected:
      'Não foi possível receber a solicitação. Revise os dados e tente novamente',
    portalTicketNotFound:
      'Não encontramos essa solicitação. Verifique o link de acompanhamento',
    portalTicketClosed:
      'Esta solicitação já está fechada. Se o problema continuar, crie uma nova',
    portalReplyLimit:
      'Esta solicitação atingiu o máximo de mensagens. Crie uma nova se precisar',
    portalBusy:
      'O portal está recebendo muitas solicitações. Tente novamente em alguns minutos',
    notificationNotFound: 'A notificação {id} não foi encontrada',
    portalEmailUnavailable: 'Os avisos por e-mail não estão disponíveis',
    portalAccessExpired:
      'O link expirou ou não é válido. Peça um novo pelo portal',
    unexpected: 'Ocorreu um erro inesperado',
    db: {
      duplicate: 'Já existe um registro com o mesmo valor em: {fields}',
      foreignKey: 'O registro relacionado não existe',
      recordNotFound: 'Registro não encontrado',
      unknown: 'Ocorreu um erro desconhecido no banco de dados',
      connection: 'Não foi possível conectar ao banco de dados',
      critical: 'Ocorreu um erro crítico no mecanismo do banco de dados',
    },
  },
  validation: {
    isString: '{field} deve ser texto',
    isNotEmpty: '{field} é obrigatório',
    minLength: '{field} deve ter pelo menos {0} caracteres',
    maxLength: '{field} deve ter no máximo {0} caracteres',
    isEnum: '{field} tem um valor inválido',
    isArray: '{field} deve ser uma lista',
    isInt: '{field} deve ser um número inteiro',
    isPositive: '{field} deve ser um número positivo',
    isDate: '{field} deve ser uma data válida',
    isEmail: '{field} não é um e-mail válido',
    isBoolean: '{field} deve ser verdadeiro ou falso',
    min: '{field} deve ser maior ou igual a {0}',
    max: '{field} deve ser menor ou igual a {0}',
    matches: '{field} não tem o formato esperado',
    passwordFormat:
      'A senha deve ter uma letra maiúscula, uma minúscula e um número',
    whitelistValidation: 'O campo {field} não é permitido',
    default: '{field} não é válido',
  },
  emails: {
    common: {
      cta: 'Ver minha solicitação',
      messageTitle: 'Mensagem da equipe de TI',
      solutionTitle: 'Solução',
      footer:
        'Você recebe este e-mail porque reportou uma solicitação à equipe de TI. Responda pelo link; não responda a este e-mail.',
    },
    received: {
      subject: 'Recebemos sua solicitação {code}',
      heading: 'Recebemos sua solicitação {code}',
      intro:
        '"{title}" já está com a equipe de TI. Avisaremos por aqui quando houver novidades.',
    },
    reply: {
      subject: 'Você tem uma resposta em {code}',
      heading: 'A equipe de TI respondeu',
      intro: 'Há uma nova mensagem na sua solicitação "{title}".',
    },
    status: {
      WAITING_INFO: {
        subject: 'Precisamos da sua resposta em {code}',
        heading: 'Precisamos de algo de você',
        intro:
          'Para continuar com "{title}" a equipe de TI precisa da sua resposta. Abra o link e responda.',
      },
      RESOLVED: {
        subject: 'Sua solicitação {code} foi resolvida',
        heading: 'Pronto! Resolvemos sua solicitação',
        intro:
          '"{title}" foi resolvida. Se o problema continuar, avise pelo link.',
      },
      CLOSED: {
        subject: 'Fechamos sua solicitação {code}',
        heading: 'Sua solicitação está fechada',
        intro: 'Fechamos "{title}". Obrigado por avisar.',
      },
      CANCELLED: {
        subject: 'Sua solicitação {code} foi cancelada',
        heading: 'Sua solicitação foi cancelada',
        intro:
          '"{title}" foi cancelada pela equipe de TI. Se achar que é um erro, crie uma nova solicitação.',
      },
    },
    access: {
      subject: 'Suas solicitações à equipe de TI',
      heading: 'Aqui estão suas solicitações',
      intro:
        'Use este link para ver todas as suas solicitações e o status. Ele expira em 7 dias.',
      cta: 'Ver minhas solicitações',
      footer: 'Se você não pediu este link, pode ignorar este e-mail.',
    },
    test: {
      subject: 'E-mail de teste do Resolvo',
      heading: 'O e-mail está funcionando',
      intro:
        'Se você recebeu esta mensagem, os avisos por e-mail do portal estão configurados corretamente.',
      cta: 'Abrir o portal',
    },
  },
  fields: {
    title: 'Título',
    description: 'Mensagem do solicitante',
    requesterName: 'Solicitante',
    requesterArea: 'Área',
    requesterEmail: 'E-mail',
    urgent: 'Urgente',
    message: 'Mensagem',
    elapsedMs: 'Tempo de preenchimento',
    portalEnabled: 'Portal ativo',
    portalMessage: 'Mensagem do portal',
    isPublic: 'Visível para o solicitante',
    siteId: 'Unidade',
    code: 'Código',
    taxId: 'Identificação fiscal',
    phone: 'Telefone',
    address: 'Endereço',
    website: 'Site',
    channel: 'Canal',
    categoryId: 'Categoria',
    priority: 'Prioridade',
    productCodes: 'Códigos de produto',
    documents: 'Documentos',
    affectedUnits: 'Unidades envolvidas',
    diagnosis: 'Diagnóstico',
    devRequestRef: 'Referência da solicitação ao desenvolvimento',
    evidencePaths: 'Evidências',
    assigneeId: 'Atribuído a',
    reportedAt: 'Data do relato',
    status: 'Status',
    note: 'Nota',
    rootCause: 'Causa raiz',
    closureComment: 'Comentário de encerramento',
    name: 'Nome',
    email: 'E-mail',
    password: 'Senha',
    roles: 'Perfil',
    isActive: 'Ativo',
    limit: 'Limite',
    offset: 'Deslocamento',
    from: 'De',
    to: 'Até',
    weeks: 'Semanas',
    search: 'Busca',
    onlyOpen: 'Somente abertos',
    groupBy: 'Agrupar por',
    timeZone: 'Fuso horário',
  },
  enums: {
    status: {
      OPEN: 'Aberto',
      IN_ANALYSIS: 'Em análise',
      WAITING_INFO: 'Aguardando informação',
      ESCALATED_DEV: 'Escalado para desenvolvimento',
      RESOLVED: 'Resolvido',
      CLOSED: 'Encerrado',
      CANCELLED: 'Cancelado',
    },
  },
};

export default messages;

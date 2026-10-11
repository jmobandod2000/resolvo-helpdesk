import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  APP_MODE: Joi.string().valid('dev', 'prod').default('prod'),
  HOST: Joi.string().optional(),
  PORT: Joi.number().default(3010),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('12h'),
  LOGIN_NAME: Joi.string().required(),
  LOGIN_EMAIL: Joi.string().email({ tlds: false }).required(),
  LOGIN_PASSWORD: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),

  DB_PS_DATABASE: Joi.string().optional(),
  DB_PS_USERNAME: Joi.string().optional(),
  DB_PS_PASSWORD: Joi.string().optional(),
  DB_PS_PORT: Joi.number().optional(),
  DB_PS_DOCKER_PORT: Joi.number().optional(),
  DB_PS_DOCKER_VOLUME: Joi.string().optional(),

  // Carpeta con la web compilada; si existe, la API también sirve el front (despliegue de un solo servicio)
  WEB_DIR: Joi.string().optional().allow(''),

  // Aviso de nuevas versiones (consulta GitHub cada 12 h). false en redes sin Internet
  UPDATE_CHECK: Joi.boolean().default(true),

  SEED_EXAMPLE_TICKETS: Joi.boolean().default(false),

  APP_URL: Joi.string().uri().optional().allow(''),
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  MAIL_FROM: Joi.string().optional().allow(''),
});

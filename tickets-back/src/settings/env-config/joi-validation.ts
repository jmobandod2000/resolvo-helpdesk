import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  APP_MODE: Joi.string().valid('dev', 'prod').required(),
  HOST: Joi.string().required(),
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('12h'),
  LOGIN_NAME: Joi.string().required(),
  LOGIN_EMAIL: Joi.string().email({ tlds: false }).required(),
  LOGIN_PASSWORD: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),

  DB_PS_DATABASE: Joi.string().required(),
  DB_PS_USERNAME: Joi.string().required(),
  DB_PS_PASSWORD: Joi.string().required(),
  DB_PS_PORT: Joi.number().required(),
  DB_PS_DOCKER_PORT: Joi.number().required(),
  DB_PS_DOCKER_VOLUME: Joi.string().required(),

  SEED_EXAMPLE_TICKETS: Joi.boolean().default(false),

  APP_URL: Joi.string().uri().optional().allow(''),
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  MAIL_FROM: Joi.string().optional().allow(''),
});

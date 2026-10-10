import { registerAs } from '@nestjs/config';

const EnvConfig = () => ({
  appMode: process.env.APP_MODE,
  baseUrl: process.env.HOST,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  loginName: process.env.LOGIN_NAME,
  loginEmail: process.env.LOGIN_EMAIL,
  loginPassword: process.env.LOGIN_PASSWORD,
});

export default registerAs('config', EnvConfig);

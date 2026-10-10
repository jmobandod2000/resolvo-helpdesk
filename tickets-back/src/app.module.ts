import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import config from './settings/env-config/env-config';
import { JoiValidationSchema } from './settings/env-config/joi-validation';
import { environments } from './settings/env-config/environments';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { MetricsModule } from './metrics/metrics.module';
import { DropDownsModule } from './drop-downs/drop-downs.module';
import { ReportsModule } from './reports/reports.module';
import { OrganizationModule } from './organization/organization.module';
import { PortalModule } from './portal/portal.module';
import { I18nExceptionFilter } from './i18n';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      load: [config],
      validationSchema: JoiValidationSchema,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TicketsModule,
    MetricsModule,
    DropDownsModule,
    ReportsModule,
    OrganizationModule,
    PortalModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: I18nExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}

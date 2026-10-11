import { Global, Module } from '@nestjs/common';

import { MailService, RequesterMailService } from './services';

@Global()
@Module({
  providers: [MailService, RequesterMailService],
  exports: [MailService, RequesterMailService],
})
export class MailModule {}

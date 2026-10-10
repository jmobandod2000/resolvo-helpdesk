import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { DropDownsService } from './drop-downs.service';

@ApiTags('Drop downs')
@Controller('drop-downs')
export class DropDownsController {
  constructor(private readonly dropDownsService: DropDownsService) {}

  @Get('catalogs')
  @Auth()
  getCatalogs() {
    return this.dropDownsService.getCatalogs();
  }
}

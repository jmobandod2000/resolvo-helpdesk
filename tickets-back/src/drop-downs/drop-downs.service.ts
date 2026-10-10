import { Injectable } from '@nestjs/common';

import {
  CHANNEL_LABELS,
  PRIORITY_LABELS,
  ROOT_CAUSE_LABELS,
  STATUS_LABELS,
} from '../tickets/interfaces';

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

@Injectable()
export class DropDownsService {
  getCatalogs() {
    return {
      statuses: toOptions(STATUS_LABELS),
      priorities: toOptions(PRIORITY_LABELS),
      channels: toOptions(CHANNEL_LABELS),
      rootCauses: toOptions(ROOT_CAUSE_LABELS),
    };
  }
}

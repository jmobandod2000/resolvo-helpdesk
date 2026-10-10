export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface Catalogs {
  statuses: SelectOption[];
  priorities: SelectOption[];
  companies: SelectOption[];
  channels: SelectOption[];
  categories: SelectOption[];
  rootCauses: SelectOption[];
}

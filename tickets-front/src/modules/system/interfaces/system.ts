export interface UpdateStatus {
  enabled: boolean;
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  url: string | null;
  publishedAt: string | null;
  notes: string | null;
  checkedAt: string | null;
}

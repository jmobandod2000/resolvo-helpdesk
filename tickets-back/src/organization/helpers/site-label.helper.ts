export const CATEGORY_SUMMARY_SELECT = { id: true, name: true } as const;

export const SITE_SUMMARY_SELECT = {
  id: true,
  code: true,
  name: true,
} as const;

export const siteLabel = ({
  code,
  name,
}: {
  code: string | null;
  name: string;
}) => (code ? `${code} ${name}` : name);

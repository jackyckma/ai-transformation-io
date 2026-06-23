export type RibbonTab = {
  href: string;
  label: string;
};

/** v2 IA ribbon — identical labels logged out / logged in (page content differs). */
export const IO_RIBBON: readonly RibbonTab[] = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/insights', label: 'Insights' },
  { href: '/ask', label: 'Ask' },
] as const;

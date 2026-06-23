export type NavLink = {
  href: string;
  label: string;
};

export type HamburgerLink = NavLink & {
  description?: string;
  external?: boolean;
};

/** v2 ribbon — identical logged-out / logged-in (page content differs, labels do not). */
export const ORG_RIBBON: readonly NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/community', label: 'Community' },
  { href: '/ask', label: 'Ask' },
];

/** Hamburger holds account, Agent API, Settings, and About — never the ribbon items. */
export const ORG_HAMBURGER_LINKS: readonly HamburgerLink[] = [
  { href: '/settings', label: 'Settings', description: 'Profile and onboarding fields' },
  { href: '/for-agents', label: 'Agentic Access API', description: 'Read and contribute via API' },
  { href: '/apprenticeship', label: 'About the apprenticeship', description: 'AI-era judgment training' },
  { href: 'https://ai-transformation.io', label: 'Frameworks on .io', external: true },
];

/** Secondary links shown below content pages — kept off the ribbon. */
export const ORG_EXPLORE_LINKS: readonly NavLink[] = [
  { href: '/knowledge', label: 'Knowledge commons' },
  { href: '/community', label: 'Community highlights' },
  { href: '/ask', label: 'Ask the companion' },
  { href: '/apprenticeship', label: 'Apprenticeship' },
];

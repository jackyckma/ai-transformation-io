'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IO_RIBBON } from '@/lib/nav';

type IconProps = { active: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        className={active ? 'fill-current/10' : undefined}
      />
    </svg>
  );
}

function LibraryIcon({ active }: IconProps) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4.5h5v15H5z" className={active ? 'fill-current/10' : undefined} />
      <path d="M11.5 4.5h3l3 14.4-2.9.6z" className={active ? 'fill-current/10' : undefined} />
    </svg>
  );
}

function InsightsIcon({ active }: IconProps) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 19V10M10 19V5M15 19v-6M20 19v-9" strokeLinecap="round" className={active ? 'stroke-2' : undefined} />
    </svg>
  );
}

function AskIcon({ active }: IconProps) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M6 7.5c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5-2.7 4.5-6 4.5c-.8 0-1.6-.1-2.3-.4L6 17l1.4-3.5"
        className={active ? 'fill-current/10' : undefined}
      />
    </svg>
  );
}

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  '/': HomeIcon,
  '/library': LibraryIcon,
  '/insights': InsightsIcon,
  '/ask': AskIcon,
};

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {IO_RIBBON.map((tab) => {
          const active =
            tab.href === '/'
              ? pathname === '/'
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = ICONS[tab.href] ?? HomeIcon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-normal transition ${
                  active ? 'text-[var(--foreground)]' : 'text-[var(--secondary)]'
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/learn', label: 'Learn', icon: LearnIcon },
  { href: '/stories/submit', label: 'Share', icon: ShareIcon },
  { href: '/ask', label: 'Ask', icon: AskIcon },
] as const;

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" className={active ? 'fill-current/10' : undefined} />
    </svg>
  );
}

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 5.5h14v13H5z" className={active ? 'fill-current/10' : undefined} />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </svg>
  );
}

function ShareIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v10M8 9l4-4 4 4" className={active ? 'stroke-[var(--accent)]' : undefined} />
      <path d="M6 19h12" />
    </svg>
  );
}

function AskIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 7.5c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5-2.7 4.5-6 4.5c-.8 0-1.6-.1-2.3-.4L6 17l1.4-3.5" className={active ? 'fill-current/10' : undefined} />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.href === '/'
              ? pathname === '/'
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
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

import type { ElementType, ReactNode } from 'react';

type PageShellWidth = 'read' | 'shell' | 'wide' | 'prose';

const WIDTH_CLASS: Record<PageShellWidth, string> = {
  read: 'layout-read',
  shell: 'layout-shell',
  wide: 'layout-wide',
  prose: 'layout-prose',
};

type PageShellProps = {
  children: ReactNode;
  as?: ElementType;
  width?: PageShellWidth;
  className?: string;
};

export function PageShell({
  children,
  as: Tag = 'div',
  width = 'read',
  className = '',
}: PageShellProps) {
  const widthClass = WIDTH_CLASS[width];
  return <Tag className={`${widthClass} py-10 md:py-14 ${className}`.trim()}>{children}</Tag>;
}

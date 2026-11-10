'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavLinks.module.css';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/episodes/', label: 'Episodes' },
  { href: '/about/', label: 'About' },
  { href: '/facts/', label: 'Facts' },
] as const;

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/**
 * The only client component: marks the current page with aria-current.
 * It is prerendered under static export, so the attribute is in the static HTML.
 */
export function NavLinks() {
  const pathname = normalize(usePathname() ?? '/');

  return (
    <ul className={styles.list}>
      {LINKS.map(({ href, label }) => {
        const active = normalize(href) === pathname;
        return (
          <li key={href}>
            <Link href={href} className={styles.link} aria-current={active ? 'page' : undefined}>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

import Link from 'next/link';
import { podcast } from '@/data/podcast';
import { NavLinks } from './NavLinks';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.orb} aria-hidden="true" />
          {podcast.name}
        </Link>
        <nav aria-label="Main">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
}

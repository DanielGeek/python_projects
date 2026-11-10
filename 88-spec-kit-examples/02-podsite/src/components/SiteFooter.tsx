import { podcast } from '@/data/podcast';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.name}>{podcast.name}</p>
          <p className={styles.tagline}>{podcast.tagline}</p>
        </div>
        <ul className={styles.links} aria-label="Follow the show">
          {podcast.followLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={styles.link} rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.small}>
          © {new Date().getFullYear()} {podcast.name}. A fictional show with mocked episodes.
        </p>
      </div>
    </footer>
  );
}

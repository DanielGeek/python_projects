import { hosts } from '@/data/hosts';
import { podcast } from '@/data/podcast';
import { pageMetadata } from '@/lib/metadata';
import styles from './about.module.css';

export const metadata = pageMetadata({
  title: 'About',
  description: `What ${podcast.name} is about, who hosts it and where to follow it.`,
  path: '/about/',
});

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <div className="container page">
      <header className={styles.header}>
        <p className="eyebrow">About the show</p>
        <h1 className={styles.title}>About</h1>
        <p className="lede">{podcast.description}</p>
      </header>

      <section className={styles.section} aria-labelledby="premise-title">
        <h2 id="premise-title">The premise</h2>
        <p className={styles.premise}>{podcast.premise}</p>
      </section>

      <section className={styles.section} aria-labelledby="hosts-title">
        <h2 id="hosts-title">Your hosts</h2>
        <ul className={styles.hosts}>
          {hosts.map((host) => (
            <li key={host.id} className={styles.host}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(host.name)}
              </span>
              <div>
                <h3>{host.name}</h3>
                <p className={styles.bio}>{host.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="follow-title">
        <h2 id="follow-title">Follow the show</h2>
        <ul className={styles.follow} aria-label="Follow the show">
          {podcast.followLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={styles.followLink} rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

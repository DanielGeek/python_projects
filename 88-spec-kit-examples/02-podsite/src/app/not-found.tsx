import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className="container page">
      <section className={styles.wrap} aria-labelledby="nf-title">
        <p className="eyebrow">Error 404</p>
        <h1 id="nf-title" className={styles.title}>
          Page not found
        </h1>
        <p className="lede">
          That page wandered off after the recording ended. It may have moved, or the link may be
          mistyped.
        </p>
        <div>
          <Link href="/" className="btn">
            Back to the home page
          </Link>
        </div>
      </section>
    </div>
  );
}

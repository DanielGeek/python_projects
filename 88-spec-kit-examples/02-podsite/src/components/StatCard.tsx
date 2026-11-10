import styles from './StatCard.module.css';

type Props = {
  /** Stable id used for `data-fact` (test hook). */
  id: string;
  label: string;
  value: string;
  note?: string;
};

/** One statistic. Must be rendered inside a `<dl>`. */
export function StatCard({ id, label, value, note }: Props) {
  return (
    <div className={styles.card} data-fact={id}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {note && <dd className={styles.note}>{note}</dd>}
    </div>
  );
}

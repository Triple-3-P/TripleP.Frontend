import styles from './landing-page.module.css';

interface IBrandProps {
  small?: boolean;
}

export function Brand({ small = false }: IBrandProps) {
  return (
    <span className={small ? styles.brandSmall : styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        triplep<span className={styles.brandPeriod}>.</span>
      </span>
    </span>
  );
}

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import Link from "next/link";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function NeonLogo({ size = "md", flicker = true, className }: { size?: "sm" | "md" | "lg"; flicker?: boolean; className?: string }) {
  return (
    <div className={cx("av-logo", `av-logo-${size}`, flicker && "av-flicker", className)} role="img" aria-label="Arcade Vault">
      <span className="av-logo-a" aria-hidden>ARCADE</span>
      <span className="av-logo-b" aria-hidden>VAULT</span>
    </div>
  );
}

export function ArcadeBackdrop({ children, className, style }: { children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx("av-backdrop", className)} style={style}>
      <div className="av-backdrop-floor" aria-hidden />
      <div className="av-backdrop-scan" aria-hidden />
      <div className="av-backdrop-content">{children}</div>
    </div>
  );
}

type Variant = "primary" | "secondary" | "outline" | "ghost";
interface ButtonStyleProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  block?: boolean;
  className?: string;
}

function buttonClass({ variant = "primary", size = "md", pulse, block, className }: ButtonStyleProps) {
  return cx("av-btn", `av-btn-${variant}`, size !== "md" && `av-btn-${size}`, pulse && "av-pulse", block && "av-btn-block", className);
}

export function Button({ variant, size, pulse, block, className, type = "button", ...rest }: ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...rest} className={buttonClass({ variant, size, pulse, block, className })} />;
}

/** A Next.js Link styled as a Button. */
export function ButtonLink({ href, children, ...style }: ButtonStyleProps & { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(style)}>
      {children}
    </Link>
  );
}

export function ScoreBadge({ score, label = "MEJOR PUNTUACIÓN", className }: { score: number | null | undefined; label?: string; className?: string }) {
  return (
    <div className={cx("av-badge", className)}>
      <span className="av-badge-label">{label}</span>
      <span className="av-badge-value">{score == null ? "---" : formatScore(score)}</span>
    </div>
  );
}

export function PixelSpinner({ label = "CARGANDO…" }: { label?: string | false }) {
  const order = [0, 1, 2, 5, 8, 7, 6, 3];
  return (
    <div className="av-spinner" role="status">
      <div className="av-spinner-grid" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => {
          const k = order.indexOf(i);
          return <span key={i} className={cx("av-spinner-cell", i === 4 && "av-spinner-mid")} style={k >= 0 ? { animationDelay: `${k * 0.12}s` } : undefined} />;
        })}
      </div>
      {label !== false && <span className="av-spinner-label">{label}</span>}
    </div>
  );
}

export function formatScore(n: number) {
  return n.toLocaleString("es-ES");
}

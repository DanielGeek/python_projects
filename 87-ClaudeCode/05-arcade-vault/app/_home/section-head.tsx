import { cx } from "@/components/ui/basics";

const TONE = {
  cyan: "av-home-tag-cyan",
  magenta: "av-home-tag-magenta",
  yellow: "av-home-tag-yellow",
  green: "av-home-tag-green",
} as const;

/** Stage tag + title + dashed rule shared by every landing section. */
export function SectionHead({
  kicker,
  tone,
  title,
}: {
  kicker: string;
  tone: keyof typeof TONE;
  title: string;
}) {
  return (
    <div className="av-home-head">
      <div className={cx("av-home-kicker av-pixel", TONE[tone])}>{kicker}</div>
      <h2 className="av-home-section-title">{title}</h2>
      <div className="av-home-rule" aria-hidden="true" />
    </div>
  );
}

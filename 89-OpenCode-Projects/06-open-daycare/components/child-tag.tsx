import type { ChildTag as ChildTagType } from "@/lib/mock-children";

type ChildTagProps = {
  tag: ChildTagType;
};

export default function ChildTag({ tag }: ChildTagProps) {
  const bgColor = tag.variant === "allergy" ? "#FBD8CC" : "#F9D2DE";
  const textColor = tag.variant === "allergy" ? "#D9684A" : "#C56486";

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 800,
        padding: "5px 9px",
        borderRadius: "999px",
        background: bgColor,
        color: textColor,
        flex: "none",
      }}
    >
      {tag.label}
    </span>
  );
}

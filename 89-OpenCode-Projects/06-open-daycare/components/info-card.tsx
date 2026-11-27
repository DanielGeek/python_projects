type InfoRow = {
  label: string;
  value: string;
};

type InfoCardProps = {
  rows: InfoRow[];
};

export default function InfoCard({ rows }: InfoCardProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: "#FFFDF9", borderColor: "#ECE0D0" }}
    >
      {rows.map((row, index) => (
        <div
          key={row.label}
          className="flex items-center justify-between px-[18px] py-[15px] text-[14.5px]"
          style={{
            borderBottom:
              index < rows.length - 1 ? "1px solid #F0E6D8" : "none",
          }}
        >
          <span style={{ color: "#94887B" }}>{row.label}</span>
          <span className="font-extrabold" style={{ color: "#3F362E" }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

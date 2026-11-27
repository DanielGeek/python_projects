type HealthNoteProps = {
  note: string;
};

export default function HealthNote({ note }: HealthNoteProps) {
  return (
    <div
      className="flex gap-3.5 rounded-2xl p-4"
      style={{ background: "#FBDAD6", padding: "16px 18px" }}
    >
      <div
        className="flex flex-none items-center justify-center rounded-[11px]"
        style={{
          width: 40,
          height: 40,
          background: "#F4A8A0",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <div>
        <div
          className="mb-0.5 text-[15px] font-extrabold"
          style={{ color: "#C5413A" }}
        >
          Allergies and notes
        </div>
        <div className="text-[14.5px] leading-relaxed" style={{ color: "#B25249" }}>
          {note}
        </div>
      </div>
    </div>
  );
}

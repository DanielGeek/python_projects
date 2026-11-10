type Props = {
  data: Record<string, unknown>;
};

/** Renders schema.org structured data as JSON-LD (escaped so it cannot close the script tag). */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

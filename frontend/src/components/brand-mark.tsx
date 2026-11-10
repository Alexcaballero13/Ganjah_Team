import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="Ganjah Team, inicio">
      <span className="brand-symbol" aria-hidden="true">GT</span>
      {!compact && <span className="brand-name">Ganjah Team</span>}
    </Link>
  );
}


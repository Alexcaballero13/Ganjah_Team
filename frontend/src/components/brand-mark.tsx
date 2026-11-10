import Image from "next/image";
import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="Ganjah Team, inicio">
      <Image
        className="brand-logo"
        src="/ganjah-team-logo-extracted.png"
        alt=""
        width={944}
        height={1100}
        priority
        aria-hidden="true"
      />
      {!compact && <span className="brand-name">Ganjah Team</span>}
    </Link>
  );
}


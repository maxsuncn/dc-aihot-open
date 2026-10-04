// The site's wordmark (its name from industry/site.ts, set in type) and a small ring mark used as the
// loader. A site with its own logo can replace Wordmark here.
import { SITE } from "@aihot/industry/site";

export function Wordmark({ size = 22, className = "", lines }: { size?: number; className?: string; lines?: readonly string[] }) {
  return (
    <span className={`inline-flex items-start font-black tracking-[-0.03em] ${className}`} style={{ fontSize: size }} aria-label={SITE.name} role="img">
      <span aria-hidden="true" className="mr-[0.3em] mt-[0.22em] inline-block size-[0.42em] shrink-0 rounded-full bg-accent" />
      <span aria-hidden="true" className={lines ? "flex flex-col leading-[1.08]" : "leading-none"}>
        {lines ? lines.map((line) => <span key={line}>{line}</span>) : SITE.name}
      </span>
    </span>
  );
}

/** A ring with a dot; spinning, it is the loader. */
export function RingMark({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g style={spinning ? { transformOrigin: "12px 12px", animation: "spin-slow 1.1s linear infinite" } : undefined}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="42 15" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}

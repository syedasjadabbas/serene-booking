const ITEMS = [
  "Heated infinity pool",
  "Rooftop restaurant",
  "Ski slope",
  "Sauna & massage",
  "Zipline",
  "Archery",
  "Mini golf",
  "Stargazing",
  "24/7 concierge",
  "Climate-controlled parking",
  "Rock climbing",
  "Banquet hall",
];

// Slow infinite ticker of resort facilities between two fine rules (pauses on hover; static with reduced motion).
export default function HomeMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-ink/10 py-7" aria-label="Resort facilities">
      <div className="marquee flex w-max items-center gap-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl text-ink/85 sm:text-[2rem]" aria-hidden={i >= ITEMS.length}>
            {item}
            <span className="h-2 w-2 rotate-45 border border-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}

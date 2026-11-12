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

// Slow infinite ticker of resort facilities (pauses on hover; static with reduced motion).
export default function HomeMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden py-6" aria-label="Resort facilities">
      <div className="marquee flex w-max items-center gap-8">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-lg font-semibold text-ink/80 sm:text-xl" aria-hidden={i >= ITEMS.length}>
            {item}
            <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          </span>
        ))}
      </div>
    </div>
  );
}

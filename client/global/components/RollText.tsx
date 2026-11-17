/**
 * Hover "roll" for labels: two stacked copies of the text; when the nearest `.roll-host` ancestor is hovered
 * (or focused), the first slides up out of view while the second slides in from below.
 */
export default function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
